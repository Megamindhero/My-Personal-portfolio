"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/store";

// Strata field: a grid of block columns. Heights come from layered noise,
// rise under the cursor, ripple on click, and recolor when a project is hovered.

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function fbm(x: number, y: number) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < 4; i++) {
    v += amp * noise(x * f, y * f);
    f *= 2;
    amp *= 0.5;
  }
  return v;
}

const tmp = new THREE.Object3D();
const base = new THREE.Color("#2a2321");
const deep = new THREE.Color("#110e0d");
const frog = new THREE.Color("#7fae5b");
const accentNow = new THREE.Color("#f4907f");
const accentTarget = new THREE.Color();
const c = new THREE.Color();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hit = new THREE.Vector3();
const camTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const look = new THREE.Vector3(0, 0, 0);

export default function Field({ size = 56 }: { size?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = size * size;
  const { camera, raycaster, pointer } = useThree();
  const cursor = useRef(new THREE.Vector3(999, 0, 999));
  const cursorSmooth = useRef(new THREE.Vector3(999, 0, 999));
  const heights = useMemo(() => new Float32Array(count), [count]);

  const cells = useMemo(() => {
    const arr: { x: number; z: number; seed: number }[] = [];
    const half = (size - 1) / 2;
    for (let i = 0; i < size; i++)
      for (let j = 0; j < size; j++)
        arr.push({ x: (i - half) * 1.04, z: (j - half) * 1.04, seed: hash(i, j) });
    return arr;
  }, [size]);

  // click → ripple from the cursor position
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("a,button")) return;
      if (cursor.current.x > 900) return;
      sceneState.pulses.push({ x: cursor.current.x, z: cursor.current.z, t: performance.now() / 1000 });
      if (sceneState.pulses.length > 6) sceneState.pulses.shift();
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const now = performance.now() / 1000;
    const s = sceneState.scroll;

    // pointer → ground plane
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) cursor.current.copy(hit);
    cursorSmooth.current.lerp(cursor.current, 1 - Math.pow(0.001, dt));
    const cx = cursorSmooth.current.x, cz = cursorSmooth.current.z;

    accentTarget.set(sceneState.accent);
    accentNow.lerp(accentTarget, 1 - Math.pow(0.02, dt));

    const drift = t * 0.05;
    const amp = 1 + sceneState.focus * 0.35;

    for (let k = 0; k < count; k++) {
      const p = cells[k];
      let h = fbm(p.x * 0.07 + drift, p.z * 0.07 - drift * 0.6);
      h = Math.pow(h, 2.2) * 9 * amp;
      // terraces → geological strata
      h = Math.round(h * 2) / 2 + 0.15;

      const dx = p.x - cx, dz = p.z - cz;
      const d2 = dx * dx + dz * dz;
      const lift = Math.exp(-d2 / 18) * 4.5;

      let wave = 0;
      for (const pu of sceneState.pulses) {
        const age = now - pu.t;
        if (age > 3.5) continue;
        const d = Math.hypot(p.x - pu.x, p.z - pu.z);
        const front = age * 14;
        wave += Math.exp(-((d - front) ** 2) / 4) * (1 - age / 3.5) * 3;
      }

      const target = h + lift + wave;
      heights[k] += (target - heights[k]) * Math.min(1, dt * 7);
      const y = Math.max(0.1, heights[k]);

      tmp.position.set(p.x, y / 2, p.z);
      tmp.scale.set(1, y, 1);
      tmp.updateMatrix();
      m.setMatrixAt(k, tmp.matrix);

      // color: deep → base by height, top strata + cursor glow in accent
      const n = Math.min(1, y / 8);
      c.copy(deep).lerp(base, n);
      const glow = Math.min(0.9, lift / 3.4 + wave / 2.8 + (y > 6.5 ? 0.35 : 0));
      c.lerp(accentNow, glow);
      if (p.seed > 0.988) c.lerp(frog, 0.7);
      m.setColorAt(k, c);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    // camera path driven by scroll
    const ang = 0.6 + s * 1.6 + state.pointer.x * 0.06;
    const radius = 46 - s * 16;
    const height = 30 - s * 18 + state.pointer.y * 1.5;
    camTarget.set(Math.sin(ang) * radius, height, Math.cos(ang) * radius);
    camera.position.lerp(camTarget, 1 - Math.pow(0.05, dt));
    lookTarget.set(0, s * 2, 0);
    look.lerp(lookTarget, 1 - Math.pow(0.05, dt));
    camera.lookAt(look);
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow receiveShadow frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.55} metalness={0.15} />
    </instancedMesh>
  );
}
