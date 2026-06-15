import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  ShaderMaterial,
  Vector2,
} from "three";

import { HERO_BACKDROP_END } from "../config/choreography";
import { clamp, lerp } from "../lib/lerp";
import { pointerState, scrollState } from "../scroll/scrollStore";

/* ---- tunables ------------------------------------------------------------ */
const STAR_COUNT = 6000;
/** Half-extents of the star volume (world units); z spans near→far behind phone. */
const FIELD = { x: 30, y: 22, zNear: -2, zFar: -34 };
/** Base star size in world units (per-star scale varies on top). */
const BASE_SIZE = 0.055;
/** How far the field shifts with the pointer (depth-scaled per star). */
const POINTER_STRENGTH = 0.6;
/** Vertical drift (world units) across the whole page scroll (depth-scaled). */
const SCROLL_PARALLAX = 50;
/** Peak star brightness (0–1). Lower = calmer, less distracting. */
const STAR_BRIGHTNESS = 0.3;
/* -------------------------------------------------------------------------- */

const vertexShader = /* glsl */ `
  attribute vec3 aOffset;
  attribute float aScale;
  attribute float aParallax;
  attribute float aSeed;

  uniform float uSize;
  uniform vec2 uPointer;
  uniform float uScroll;
  uniform float uTime;

  varying vec2 vLocal;
  varying float vRadius;
  varying float vBright;

  void main() {
    // Depth-scaled parallax: nearer stars shift more, from both pointer (xy)
    // and scroll (y).
    vec3 inst = aOffset;
    inst.xy += uPointer * aParallax;
    inst.y += uScroll * aParallax;

    float size = uSize * aScale;
    vec2 local = position.xy * size;

    vLocal = local;
    vRadius = size * 0.5;

    // Subtle per-star twinkle + brightness varying with size.
    float twinkle = 0.7 + 0.3 * sin(uTime * 1.5 + aSeed * 6.2831);
    vBright = twinkle * (0.6 + 0.4 * aScale);

    gl_Position =
      projectionMatrix * modelViewMatrix * vec4(inst + vec3(local, 0.0), 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;

  varying vec2 vLocal;
  varying float vRadius;
  varying float vBright;

  void main() {
    // Soft round dot.
    float d = length(vLocal);
    float alpha = smoothstep(vRadius, vRadius * 0.35, d) * vBright * uOpacity;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(vec3(1.0), alpha);
  }
`;

function buildGeometry(): InstancedBufferGeometry {
  const geo = new InstancedBufferGeometry();

  // Unit quad (two triangles) reused by every instance.
  geo.setAttribute(
    "position",
    new Float32BufferAttribute(
      [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
      3,
    ),
  );
  geo.setAttribute(
    "uv",
    new Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2),
  );
  geo.setIndex([0, 1, 2, 0, 2, 3]);

  const offsets = new Float32Array(STAR_COUNT * 3);
  const scales = new Float32Array(STAR_COUNT);
  const parallax = new Float32Array(STAR_COUNT);
  const seeds = new Float32Array(STAR_COUNT);

  const depthSpan = FIELD.zNear - FIELD.zFar;
  for (let i = 0; i < STAR_COUNT; i++) {
    const z = FIELD.zNear + Math.random() * (FIELD.zFar - FIELD.zNear);
    offsets[i * 3] = (Math.random() * 2 - 1) * FIELD.x;
    offsets[i * 3 + 1] = (Math.random() * 2 - 1) * FIELD.y;
    offsets[i * 3 + 2] = z;
    scales[i] = 0.5 + Math.random() * 1.2;
    // Nearer stars (z toward zNear) get more parallax.
    parallax[i] = 0.1 + ((z - FIELD.zFar) / depthSpan) * 1.1;
    seeds[i] = Math.random();
  }

  geo.setAttribute("aOffset", new InstancedBufferAttribute(offsets, 3));
  geo.setAttribute("aScale", new InstancedBufferAttribute(scales, 1));
  geo.setAttribute("aParallax", new InstancedBufferAttribute(parallax, 1));
  geo.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
  geo.instanceCount = STAR_COUNT;
  return geo;
}

/**
 * Static starfield behind the phone: soft round white dots with a subtle
 * twinkle and depth-layered pointer parallax. Fades in as the hero video fades
 * out (so the hero shows the video, the feature sections show the stars).
 */
export function Starfield() {
  const meshRef = useRef<Mesh>(null);

  const geometry = useMemo(buildGeometry, []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uSize: { value: BASE_SIZE },
          uPointer: { value: new Vector2() },
          uScroll: { value: 0 },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader,
        fragmentShader,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    const u = material.uniforms;

    u.uPointer.value.x = lerp(
      u.uPointer.value.x,
      pointerState.x * POINTER_STRENGTH,
      0.05,
    );
    u.uPointer.value.y = lerp(
      u.uPointer.value.y,
      pointerState.y * POINTER_STRENGTH,
      0.05,
    );

    // Depth-layered vertical drift across the page (eased), centered so it
    // moves both ways around mid-scroll.
    const scrollTarget = (scrollState.progress - 0.5) * SCROLL_PARALLAX;
    u.uScroll.value = lerp(u.uScroll.value, scrollTarget, 0.08);

    // Fade in across the hero (inverse of the hero video), capped at
    // STAR_BRIGHTNESS so the stars stay a calm backdrop.
    u.uOpacity.value =
      clamp(scrollState.progress / HERO_BACKDROP_END) * STAR_BRIGHTNESS;
    u.uTime.value += delta;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      renderOrder={-1}
      frustumCulled={false}
    />
  );
}
