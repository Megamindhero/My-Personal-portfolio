"use client";

import { useRef, useState } from "react";
import confetti from "canvas-confetti";
import { sceneState } from "@/lib/store";
import { celebrate } from "@/lib/ambient";

const COLORS = ["#f4907f", "#7fae5b", "#f4ede4", "#ffb347", "#8b2a1e"];

export default function Certificate({ proof }: { proof: string }) {
  const card = useRef<HTMLButtonElement>(null);
  const [burst, setBurst] = useState(0);

  const tilt = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 10}deg`);
    el.style.setProperty("--ry", `${x * 14}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const reset = () => {
    card.current?.style.setProperty("--rx", "0deg");
    card.current?.style.setProperty("--ry", "0deg");
  };

  const pop = (e: React.MouseEvent) => {
    const x = e.clientX / window.innerWidth || 0.5;
    const y = e.clientY / window.innerHeight || 0.5;
    const mobile = window.innerWidth < 760;
    const base = {
      colors: COLORS,
      disableForReducedMotion: true,
      zIndex: 60,
      scalar: mobile ? 0.9 : 1.1,
    };
    let lion: confetti.Shape | undefined;
    try {
      lion = confetti.shapeFromText({ text: "🦁", scalar: 2 });
    } catch {}

    // burst from the tap
    confetti({ ...base, particleCount: mobile ? 70 : 120, spread: 80, startVelocity: 42, origin: { x, y } });
    // side cannons
    setTimeout(() => {
      confetti({ ...base, particleCount: mobile ? 40 : 70, angle: 60, spread: 60, origin: { x: 0, y: 0.85 } });
      confetti({ ...base, particleCount: mobile ? 40 : 70, angle: 120, spread: 60, origin: { x: 1, y: 0.85 } });
    }, 160);
    // a few lions
    if (lion)
      setTimeout(() => {
        confetti({ ...base, shapes: [lion!], scalar: 2, particleCount: mobile ? 6 : 10, spread: 100, startVelocity: 30, origin: { x, y } });
      }, 280);

    // the 3D field cheers too
    sceneState.pulses.push({ x: 0, z: 0, t: performance.now() / 1000 });
    if (sceneState.pulses.length > 6) sceneState.pulses.shift();
    celebrate();
    navigator.vibrate?.([20, 40, 30]);
    setBurst((b) => b + 1);
  };

  return (
    <div className="cert-wrap">
      <button
        ref={card}
        type="button"
        className="cert reveal"
        onPointerMove={tilt}
        onPointerLeave={reset}
        onClick={pop}
        aria-label="Safary Certificate of Achievement in Crypto Marketing. Tap to celebrate."
      >
        <img src="/safary-certificate.jpg" alt="Safary Certificate of Achievement awarded to Josep Kingsley, 4 October 2025" width={1032} height={730} />
        <span className="cert-shine" />
        <span className="cert-tap mono" key={burst}>
          {burst ? "Again? Tap away" : "Tap to celebrate"}
        </span>
      </button>
      <div className="cert-meta reveal">
        <p className="cert-title">Safary Certification in Crypto Marketing</p>
        <p className="mono dim">First cohort · 4 October 2025</p>
        <a className="mono cert-proof" href={proof} target="_blank" rel="noreferrer">
          Proof on X ↗
        </a>
      </div>
    </div>
  );
}
