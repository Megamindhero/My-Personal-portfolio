// Tiny mutable store shared between the DOM and the WebGL scene.
// Mutations here never trigger React renders; the scene reads it every frame.
import { ACCENT } from "./data";

export const sceneState = {
  accent: ACCENT,
  scroll: 0, // 0..1 page progress
  pulses: [] as { x: number; z: number; t: number }[],
  focus: 0, // 0 idle, 1 a project is hovered
  level: 0, // ambient loudness, makes the field breathe
};

export function setAccent(hex: string | null) {
  sceneState.accent = hex ?? ACCENT;
  sceneState.focus = hex ? 1 : 0;
}
