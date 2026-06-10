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

import { PHONE, SCREENS } from '../config/choreography'
import { lerp, clamp } from '../lib/lerp'
import { scrollState, pointerState } from '../scroll/scrollStore'

const MODEL_URL = '/models/iphone.glb'

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
 * The persistent phone. Loaded once, never unmounts. The app screenshot is
 * painted onto the model's own screen mesh (perfect rounded corners), kept crisp
 * (unlit), with a subtle additive glare overlay for premium glass feel.
 */
export function Phone() {
  const group = useRef<Group>(null)
  const glareMat = useRef<ShaderMaterial | null>(null)
  const { scene } = useGLTF(MODEL_URL, true)
  const screen = useTexture(SCREENS.home, (t) => {
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 8
  })

  // Green-screen: paint the app onto the model's screen mesh + add the glare.
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
    applyCoverFit(screen, aspect)

    // Crisp, unlit display (the look that read cleanest).
    let mat = screenMesh.material as MeshBasicMaterial
    if (!mat.userData?.__appScreen) {
      ;(mat as { dispose?: () => void }).dispose?.()
      mat = new MeshBasicMaterial({
        toneMapped: false,
        name: SCREEN_MATERIAL, // keep findable for Phase 3 screen swaps
      })
      mat.userData.__appScreen = true
      screenMesh.material = mat
    }
    mat.map = screen
    mat.needsUpdate = true

    // Glare overlay: a sibling mesh sharing the screen's rounded geometry,
    // floated a hair in front. Added once.
    if (!screenMesh.userData.__glareAdded) {
      const glareMaterial = makeGlareMaterial()
      const glare = new Mesh(screenMesh.geometry.clone(), glareMaterial)
      glare.position.z += 0.004
      glare.renderOrder = 2
      screenMesh.parent?.add(glare)
      screenMesh.userData.__glareAdded = true
      glareMat.current = glareMaterial
    }
  }, [scene, screen])

  useFrame(() => {
    const g = group.current
    if (!g) return

    // Gentle rise into its resting frame across the hero (first quarter).
    const rise = clamp(scrollState.progress / 0.25)
    const targetY = lerp(-1.4, -0.2, rise)

    // Eased pointer parallax on top of any base rotation.
    const targetRotY = pointerState.x * 0.28
    const targetRotX = -pointerState.y * 0.16

    g.position.y = lerp(g.position.y, targetY, 0.08)
    g.rotation.y = lerp(g.rotation.y, targetRotY, 0.07)
    g.rotation.x = lerp(g.rotation.x, targetRotX, 0.07)

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

  return (
    <group ref={group} position={[0, -1.4, 0]} scale={PHONE.scale}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, true)
