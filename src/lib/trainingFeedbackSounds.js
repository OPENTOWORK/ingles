let context;

function getContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!context) context = new AudioContext();
  return context;
}

function tone(ctx, { type = 'sine', from, to, start, duration, volume = 0.08 }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  if (to != null) osc.frequency.linearRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playTrainingAnswerSound(correct) {
  const ctx = getContext();
  if (!ctx) return;
  ctx.resume();
  const now = ctx.currentTime;
  if (correct) {
    tone(ctx, { from: 523.25, start: now, duration: 0.12, volume: 0.07 });
    tone(ctx, { from: 659.25, start: now + 0.1, duration: 0.16, volume: 0.07 });
    return;
  }
  tone(ctx, { type: 'triangle', from: 311, to: 185, start: now, duration: 0.28, volume: 0.06 });
}

export function playTrainingFinishSound(stars) {
  const ctx = getContext();
  if (!ctx) return;
  ctx.resume();
  const now = ctx.currentTime;
  if (stars >= 2) {
    tone(ctx, { from: 523.25, start: now, duration: 0.14, volume: 0.08 });
    tone(ctx, { from: 659.25, start: now + 0.12, duration: 0.14, volume: 0.08 });
    tone(ctx, { from: 783.99, start: now + 0.24, duration: 0.28, volume: 0.08 });
    return;
  }
  tone(ctx, { type: 'triangle', from: 392, start: now, duration: 0.16, volume: 0.06 });
  tone(ctx, { type: 'triangle', from: 349.23, start: now + 0.14, duration: 0.22, volume: 0.06 });
}
