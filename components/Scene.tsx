"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { useEffect, useState } from "react";
import Field from "./Field";

export default function Scene() {
  const [mobile, setMobile] = useState(false);
  const [source, setSource] = useState<HTMLElement | undefined>();

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 760px)").matches);
    setSource(document.documentElement);
  }, []);

  if (!source) return null;

  return (
    <div className="scene" aria-hidden>
      <Canvas
        eventSource={source}
        eventPrefix="client"
        shadows="percentage"
        dpr={[1, mobile ? 1.5 : 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [30, 30, 36], fov: 34, near: 0.1, far: 300 }}
      >
        <color attach="background" args={["#0a0a09"]} />
        <fog attach="fog" args={["#0a0a09", 40, 110]} />
        <ambientLight intensity={0.35} />
        <hemisphereLight args={["#fffbe8", "#0a0a09", 0.4]} />
        <directionalLight
          position={[22, 34, 12]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
          shadow-bias={-0.0004}
        />
        <Field size={mobile ? 36 : 56} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} mipmapBlur />
          <Noise opacity={0.04} />
          <Vignette offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
