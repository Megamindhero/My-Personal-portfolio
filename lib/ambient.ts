// Generative ambient bed, built live with the Web Audio API (no audio files).
// Slow evolving pad + air + reverb. Clicking the field plucks a note.

type Voice = { oscs: OscillatorNode[]; gain: GainNode };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wet: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let voices: Voice[] = [];
let extras: AudioScheduledSourceNode[] = [];
let chordTimer: ReturnType<typeof setInterval> | null = null;
let buf: Uint8Array<ArrayBuffer> | null = null;
let running = false;

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// D major 9 → B minor 11 → G major 7 → A sus
const CHORDS = [
  [38, 45, 54, 61, 64],
  [35, 42, 50, 57, 64],
  [31, 43, 50, 54, 59],
  [33, 45, 50, 52, 59],
];
const SCALE = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83]; // D major pentatonic

function impulse(c: AudioContext, seconds = 5, decay = 2.6) {
  const len = c.sampleRate * seconds;
  const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return b;
}

export function isAmbientOn() {
  return running;
}

export async function startAmbient() {
  if (running) return;
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  await ctx.resume();
  const c = ctx;
  const now = c.currentTime;

  master = c.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.55, now + 4);

  analyser = c.createAnalyser();
  analyser.fftSize = 256;
  buf = new Uint8Array(analyser.frequencyBinCount);

  const verb = c.createConvolver();
  verb.buffer = impulse(c);
  wet = c.createGain();
  wet.gain.value = 0.7;
  const dry = c.createGain();
  dry.gain.value = 0.45;

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  lp.Q.value = 0.6;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.035;
  const lfoAmt = c.createGain();
  lfoAmt.gain.value = 450;
  lfo.connect(lfoAmt).connect(lp.frequency);
  lfo.start();
  extras.push(lfo);

  lp.connect(dry).connect(master);
  lp.connect(verb).connect(wet).connect(master);
  master.connect(analyser).connect(c.destination);

  // pad voices
  voices = CHORDS[0].map((n, i) => {
    const g = c.createGain();
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(i === 0 ? 0.12 : 0.07, now + 3 + i);
    const oscs = [-6, 6].map((det, k) => {
      const o = c.createOscillator();
      o.type = k ? "triangle" : "sine";
      o.frequency.value = hz(n);
      o.detune.value = det;
      o.connect(g);
      o.start();
      return o;
    });
    // slow breathing per voice
    const breath = c.createOscillator();
    breath.frequency.value = 0.03 + i * 0.013;
    const ba = c.createGain();
    ba.gain.value = 0.03;
    breath.connect(ba).connect(g.gain);
    breath.start();
    extras.push(breath);
    g.connect(lp);
    return { oscs, gain: g };
  });

  // air: filtered noise
  const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const nd = nb.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = nb;
  noise.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.4;
  const ng = c.createGain();
  ng.gain.value = 0.012;
  noise.connect(bp).connect(ng).connect(verb);
  noise.start();
  extras.push(noise);

  let idx = 0;
  chordTimer = setInterval(() => {
    if (!ctx) return;
    idx = (idx + 1) % CHORDS.length;
    const t = ctx.currentTime;
    CHORDS[idx].forEach((n, i) => voices[i]?.oscs.forEach((o) => o.frequency.setTargetAtTime(hz(n), t, 2.2)));
  }, 14000);

  running = true;
}

export function stopAmbient() {
  if (!running || !ctx || !master) return;
  const c = ctx;
  const m = master;
  m.gain.cancelScheduledValues(c.currentTime);
  m.gain.setTargetAtTime(0, c.currentTime, 0.6);
  const old = [...voices.flatMap((v) => v.oscs), ...extras];
  setTimeout(() => {
    old.forEach((o) => {
      try {
        o.stop();
      } catch {}
    });
    m.disconnect();
  }, 3000);
  voices = [];
  extras = [];
  if (chordTimer) clearInterval(chordTimer);
  chordTimer = null;
  running = false;
}

// x in 0..1 → note across the pentatonic scale
export function pluck(x: number) {
  if (!running || !ctx || !wet || !master) return;
  const c = ctx;
  const n = SCALE[Math.max(0, Math.min(SCALE.length - 1, Math.floor(x * SCALE.length)))];
  const t = c.currentTime;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.16, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
  [0, 12].forEach((oct, k) => {
    const o = c.createOscillator();
    o.type = k ? "sine" : "triangle";
    o.frequency.value = hz(n + oct);
    o.connect(g);
    o.start(t);
    o.stop(t + 3);
  });
  const send = c.createGain();
  send.gain.value = 0.9;
  g.connect(master);
  g.connect(send).connect(wet);
}

// 0..1 loudness, read by the 3D field
export function level() {
  if (!analyser || !buf || !running) return 0;
  analyser.getByteTimeDomainData(buf);
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128;
    sum += v * v;
  }
  return Math.min(1, Math.sqrt(sum / buf.length) * 6);
}

// little rising arpeggio for celebrations (only when sound is on)
export function celebrate() {
  if (!running) return;
  [0, 2, 4, 6, 9].forEach((i, k) => setTimeout(() => pluck((i + 0.5) / SCALE.length), k * 90));
}
