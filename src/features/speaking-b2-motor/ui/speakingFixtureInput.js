export function createSpeakingFixtureInput({ getNextAudio, autoEndMs = 350 } = {}) {
  let timer = 0;
  let levelTimer = 0;
  let level = 0.15;
  const listeners = new Set();

  const setLevel = (value) => {
    level = value;
    listeners.forEach((fn) => fn(value));
  };

  return {
    fixtureMode: true,
    status: 'idle',
    error: null,
    get level() {
      return level;
    },
    onLevel(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    async startPreview() {
      this.status = 'preview';
      this.error = null;
      clearInterval(levelTimer);
      levelTimer = setInterval(() => {
        setLevel(0.2 + Math.random() * 0.35);
      }, 160);
      return { id: 'fixture-stream' };
    },
    async startRecording() {
      this.status = 'recording';
      return { id: 'fixture-stream' };
    },
    async stopRecording() {
      this.status = 'idle';
      if (typeof getNextAudio !== 'function') return null;
      return getNextAudio();
    },
    release() {
      clearTimeout(timer);
      clearInterval(levelTimer);
      this.status = 'idle';
      setLevel(0);
    },
    attachVad(onSilence) {
      clearTimeout(timer);
      timer = setTimeout(() => onSilence?.(), autoEndMs);
      return () => clearTimeout(timer);
    },
  };
}
