// Synthesized chimes (Web Audio API oscillators) rather than bundled
// audio files — no asset to source, license, or host, and it can't
// fail to load over a slow connection.
//
// Browsers start a freshly-created AudioContext in a "suspended" state
// unless resume()/creation happens inside a real user-gesture handler
// (click, tap, keypress). This context used to get lazily created the
// FIRST time a chime fired — which in practice was always from a
// background Firestore snapshot callback (a new order/request coming
// in), never a click. That meant it stayed permanently suspended:
// tones got scheduled on it without error, but nothing was ever
// audible. `unlockAudio()` fixes this by being called from an actual
// click (the PIN pad / staff login) so the context is created *and*
// resumed while a genuine gesture is on the stack; `playChime` also
// opportunistically resumes on every call as a safety net.
let audioCtx;

function getContext() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function unlockAudio() {
  try {
    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();
  } catch (err) {
    console.error("Could not unlock audio:", err);
  }
}

// tones: array of { freq, start, duration } — freq in Hz, start/duration in seconds.
function playChime(tones, { gain = 0.28 } = {}) {
  try {
    const ctx = getContext();
    const run = () => {
      const now = ctx.currentTime;
      tones.forEach(({ freq, start, duration }) => {
        const t0 = now + start;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        osc.connect(g).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + duration + 0.02);
      });
    };
    if (ctx.state === "suspended") {
      ctx.resume().then(run);
    } else {
      run();
    }
  } catch (err) {
    console.error("Could not play the alert chime:", err);
  }
}

// New order: a bright three-note upward run — distinct rhythm/contour
// from the request chime so staff can tell the two apart by ear
// without looking at the screen.
export function playOrderChime() {
  playChime([
    { freq: 659.25, start: 0, duration: 0.16 },
    { freq: 783.99, start: 0.12, duration: 0.16 },
    { freq: 987.77, start: 0.24, duration: 0.28 },
  ]);
}

// "Request a server": the original two-tone descending chime.
export function playRequestChime() {
  playChime([
    { freq: 1174.66, start: 0, duration: 0.32 },
    { freq: 880, start: 0.16, duration: 0.32 },
  ]);
}
