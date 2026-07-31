// A synthesized two-tone chime (Web Audio API oscillators) rather than
// a bundled audio file — no asset to source, license, or host, and it
// can't fail to load over a slow connection. Lazily creates the
// AudioContext on first use so it initializes after a real user
// gesture (logging in via the PIN pad, clicking a tab) has already
// happened, which browsers require before audio can play.
let audioCtx;

export function playRequestChime() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    [880, 1174.66].forEach((freq, i) => {
      const start = now + i * 0.16;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.34);
    });
  } catch (err) {
    console.error("Could not play the server-request alert chime:", err);
  }
}
