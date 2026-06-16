import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import {
  AdditiveBlending,
  Color,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  type Group,
  type Texture,
} from 'three'

import {
  PHONE,
  SCREEN_TEXTURES,
  SECTION_TEXTURE_INDEX,
  samplePhone,
  sampleSegment,
} from '../config/choreography'
import { clamp, lerp } from '../lib/lerp'
import { stage } from '../lib/stage'
import {
  scrollState,
  pointerState,
  layoutState,
  pinchState,
} from '../scroll/scrollStore'

const MODEL_URL = '/models/iphone.glb'

/* ---- cinematic startup reveal -------------------------------------------- */
/** Seconds the reveal takes once the loader clears. */
const INTRO_DURATION = 2.0
/** Beat of suspense after the loader clears before the phone rises. */
const INTRO_DELAY = 0.15
/** Starting pose: laid back facing the sky (negative X → reveals bottom-first),
 *  low, and small. */
const INTRO_ROT_X = -1.35
const INTRO_ROT_Z = 0
const INTRO_Y = -3.2
const INTRO_SCALE = 0.8
/* -------------------------------------------------------------------------- */

/** Material name of the model's built-in screen mesh (the "green screen"). */
const SCREEN_MATERIAL = '4130c6244c49c5d5712e'

/** Peak brightness of the glass glare (additive). Lower = subtler. */
const GLARE_INTENSITY = 0.2

/**
 * Regenerate planar UVs for the (flat, +Z-facing) screen mesh straight from its
 * XY positions, so the app screenshot maps edge-to-edge regardless of the
 * model's original (junk) UVs. Returns the plane aspect (w/h) for cover-fit.
 */
function regeneratePlanarUVs(mesh: Mesh): number {
  const pos = mesh.geometry.attributes.position
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const w = maxX - minX
  const h = maxY - minY
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - minX) / w
    uv[i * 2 + 1] = (pos.getY(i) - minY) / h
  }
  mesh.geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  return w / h
}

/** CSS `object-fit: cover` via texture repeat/offset — fills, never distorts. */
function applyCoverFit(texture: Texture, planeAspect: number) {
  const img = texture.image as { width: number; height: number } | undefined
  if (!img?.width) return
  const imgAspect = img.width / img.height
  if (imgAspect > planeAspect) {
    const s = planeAspect / imgAspect
    texture.repeat.set(s, 1)
    texture.offset.set((1 - s) / 2, 0)
  } else {
    const s = imgAspect / planeAspect
    texture.repeat.set(1, s)
    texture.offset.set(0, (1 - s) / 2)
  }
  texture.needsUpdate = true
}

/**
 * Additive glass-glare overlay clipped to the screen shape. A soft diagonal
 * streak whose position + strength are driven by the pointer, so it's invisible
 * head-on and sweeps across only as the phone tilts. Additive = it brightens a
 * spot without ever veiling/desaturating the UI underneath.
 */
function makeGlareMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uCenter: { value: new Vector2(0.5, 0.5) },
      uIntensity: { value: 0 },
      uColor: { value: new Color(0.78, 0.86, 1.0) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform vec2 uCenter;
      uniform float uIntensity;
      uniform vec3 uColor;
      void main() {
        vec2 p = vUv - uCenter;
        // rotate 45° so the streak runs diagonally across the glass
        float c = 0.70710678;
        float rx = (p.x - p.y) * c;
        float ry = (p.x + p.y) * c;
        float band = smoothstep(0.22, 0.0, abs(rx)) * smoothstep(1.0, 0.0, abs(ry));
        float a = band * uIntensity;
        gl_FragColor = vec4(uColor * a, a);
      }
    `,
  })
}

/**
 * The persistent phone. Loaded once, never unmounts. The app screenshots are
 * painted onto the model's own screen mesh (perfect rounded corners), kept crisp
 * (unlit). Two stacked screen layers crossfade home → feature1/2/3 across the
 * sections; a subtle additive glare overlay adds the premium glass feel.
 */
export function Phone() {
  const group = useRef<Group>(null)
  const baseMat = useRef<MeshBasicMaterial | null>(null)
  const overlayMat = useRef<MeshBasicMaterial | null>(null)
  const glareMat = useRef<ShaderMaterial | null>(null)
  const screens = useRef<Texture[]>([])
  const introElapsed = useRef(0)

  const { scene } = useGLTF(MODEL_URL, true)
  const textures = useTexture(SCREEN_TEXTURES)

  // Green-screen: paint the app onto the model's screen mesh, plus the crossfade
  // overlay and glare layers (added once).
  useLayoutEffect(() => {
    let screenMesh: Mesh | undefined
    scene.traverse((o) => {
      const mat = (o as Mesh).material
      if (mat && !Array.isArray(mat) && mat.name === SCREEN_MATERIAL) {
        screenMesh = o as Mesh
      }
    })
    if (!screenMesh) return

    const aspect = regeneratePlanarUVs(screenMesh)
    for (const t of textures) {
      t.colorSpace = SRGBColorSpace
      t.anisotropy = 8
      applyCoverFit(t, aspect)
    }
    screens.current = textures

    // Base layer: crisp, unlit display (the look that read cleanest).
    let mat = screenMesh.material as MeshBasicMaterial
    if (!mat.userData?.__appScreen) {
      ;(mat as { dispose?: () => void }).dispose?.()
      mat = new MeshBasicMaterial({ toneMapped: false, name: SCREEN_MATERIAL })
      mat.userData.__appScreen = true
      screenMesh.material = mat
    }
    mat.map = textures[0]
    mat.needsUpdate = true
    baseMat.current = mat

    if (!screenMesh.userData.__screenSetup) {
      // Crossfade overlay: same rounded geometry, floated a hair in front, its
      // opacity ramped by section progress to dissolve to the next screen.
      const overlay = new MeshBasicMaterial({
        toneMapped: false,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
      const overlayMesh = new Mesh(screenMesh.geometry.clone(), overlay)
      overlayMesh.position.z += 0.002
      overlayMesh.renderOrder = 1
      screenMesh.parent?.add(overlayMesh)
      overlayMat.current = overlay

      // Glass glare on top.
      const glareMaterial = makeGlareMaterial()
      const glare = new Mesh(screenMesh.geometry.clone(), glareMaterial)
      glare.position.z += 0.004
      glare.renderOrder = 2
      screenMesh.parent?.add(glare)
      glareMat.current = glareMaterial

      screenMesh.userData.__screenSetup = true
    }
  }, [scene, textures])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return

    // Cinematic reveal: advance only once the loader clears.
    // `e` eases 0→1 from the laying-down pose into the live one.
    if (stage.revealed) introElapsed.current += delta
    const raw = clamp((introElapsed.current - INTRO_DELAY) / INTRO_DURATION)
    const e = 1 - Math.pow(1 - raw, 5) // easeOutQuint

    // Gentle idle float (scaled in by `e` so it doesn't fight the reveal) — keeps
    // the phone feeling like a real object hovering in space.
    const t = state.clock.elapsedTime
    const floatY = Math.sin(t * 0.6) * 0.07 * e
    const floatRotX = Math.sin(t * 0.45) * 0.015 * e
    const floatRotZ = Math.cos(t * 0.4) * 0.012 * e

    // Scroll sets the live target pose; the render loop eases toward it.
    const pose = samplePhone(scrollState.progress, layoutState.mobile)
    const liveRotY = pose.rotY + pointerState.x * 0.15
    const liveRotX = -pointerState.y * 0.1

    // Blend the intro pose → live pose by `e`. X stays at the live position so
    // the phone rises in place (on the right) rather than drifting from center.
    const tX = pose.x
    const tY = lerp(INTRO_Y, pose.y, e) + floatY
    const tRotX = lerp(INTRO_ROT_X, liveRotX, e) + floatRotX
    const tRotY = lerp(0, liveRotY, e)
    const tRotZ = lerp(INTRO_ROT_Z, 0, e) + floatRotZ
    // Pinch-to-zoom multiplies the live scale (1 on desktop / when not pinching).
    const tScale = PHONE.scale * lerp(INTRO_SCALE, pose.scale, e) * pinchState.scale

    g.position.x = lerp(g.position.x, tX, 0.08)
    g.position.y = lerp(g.position.y, tY, 0.08)
    g.rotation.x = lerp(g.rotation.x, tRotX, 0.09)
    g.rotation.y = lerp(g.rotation.y, tRotY, 0.08)
    g.rotation.z = lerp(g.rotation.z, tRotZ, 0.09)
    g.scale.setScalar(lerp(g.scale.x, tScale, 0.08))

    // Crossfade the screen: base = current section's screen, overlay = next,
    // overlay opacity = smoothstepped progress through the segment.
    const tex = screens.current
    const bm = baseMat.current
    const om = overlayMat.current
    if (tex.length && bm && om) {
      const { index, t } = sampleSegment(scrollState.progress)
      const a = tex[SECTION_TEXTURE_INDEX[index]]
      const b = tex[SECTION_TEXTURE_INDEX[index + 1]]
      if (bm.map !== a) {
        bm.map = a
        bm.needsUpdate = true
      }
      if (om.map !== b) {
        om.map = b
        om.needsUpdate = true
      }
      om.opacity = t * t * (3 - 2 * t)
    }

    // Drive the glare from pointer: invisible centered, sweeps in at angles.
    const gm = glareMat.current
    if (gm) {
      const mag = Math.min(1, Math.hypot(pointerState.x, pointerState.y))
      const u = gm.uniforms
      u.uIntensity.value = lerp(u.uIntensity.value, mag * GLARE_INTENSITY, 0.08)
      u.uCenter.value.x = lerp(u.uCenter.value.x, 0.5 + pointerState.x * 0.3, 0.08)
      u.uCenter.value.y = lerp(u.uCenter.value.y, 0.5 + pointerState.y * 0.3, 0.08)
    }
  })

  // Starts in the laying-down intro pose; eases upright on the loader reveal.
  return (
    <group
      ref={group}
      position={[0, INTRO_Y, 0]}
      rotation={[INTRO_ROT_X, 0, INTRO_ROT_Z]}
      scale={PHONE.scale * INTRO_SCALE}
    >
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, true)
// Warm every screen texture up front so the startup loader waits for them and
// the later crossfades have nothing left to fetch.
SCREEN_TEXTURES.forEach((url) => useTexture.preload(url))
