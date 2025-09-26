// Audio Management System
export class AudioManager {
  constructor() {
    this.audioCache = new Map();
    this.preloadedAudio = new Set();
    this.audioContext = null;
    this.isInitialized = false;
  }

  // Initialize audio context
  async initialize() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
      
      // Resume context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      console.log('Audio context initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  // Preload audio files
  async preloadAudio(audioUrls) {
    const loadPromises = audioUrls.map(url => this.loadAudio(url));
    
    try {
      await Promise.all(loadPromises);
      console.log(`Preloaded ${audioUrls.length} audio files`);
    } catch (error) {
      console.error('Error preloading audio:', error);
    }
  }

  // Load individual audio file
  async loadAudio(url) {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url);
    }

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      const loadPromise = new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          this.audioCache.set(url, audio);
          this.preloadedAudio.add(url);
          resolve(audio);
        }, { once: true });
        
        audio.addEventListener('error', (e) => {
          console.error(`Failed to load audio: ${url}`, e);
          reject(e);
        }, { once: true });
      });

      audio.src = url;
      await loadPromise;
      
      return audio;
    } catch (error) {
      console.error(`Error loading audio ${url}:`, error);
      // Return a fallback audio element
      const fallbackAudio = new Audio();
      fallbackAudio.src = url;
      return fallbackAudio;
    }
  }

  // Get audio element
  async getAudio(url) {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url);
    }
    
    return await this.loadAudio(url);
  }

  // Play audio with controls
  async playAudio(url, options = {}) {
    const {
      volume = 1,
      playbackRate = 1,
      loop = false,
      onEnd = null,
      onError = null
    } = options;

    try {
      const audio = await this.getAudio(url);
      
      // Clone audio to allow multiple simultaneous plays
      const audioClone = audio.cloneNode();
      audioClone.volume = volume;
      audioClone.playbackRate = playbackRate;
      audioClone.loop = loop;
      
      // Set up event listeners
      if (onEnd) {
        audioClone.addEventListener('ended', onEnd, { once: true });
      }
      
      if (onError) {
        audioClone.addEventListener('error', onError, { once: true });
      }
      
      // Play audio
      await audioClone.play();
      
      return {
        audio: audioClone,
        stop: () => {
          audioClone.pause();
          audioClone.currentTime = 0;
        },
        pause: () => audioClone.pause(),
        resume: () => audioClone.play(),
        setVolume: (vol) => { audioClone.volume = Math.max(0, Math.min(1, vol)); },
        setPlaybackRate: (rate) => { audioClone.playbackRate = rate; }
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      onError?.(error);
      throw error;
    }
  }

  // Stop all audio
  stopAllAudio() {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  // Clear cache
  clearCache() {
    this.stopAllAudio();
    this.audioCache.clear();
    this.preloadedAudio.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cachedFiles: this.audioCache.size,
      preloadedFiles: this.preloadedAudio.size,
      cacheSize: this.audioCache.size * 0.1 // Rough estimate in MB
    };
  }

  // Generate audio URLs for exercises
  generateAudioUrls(level, skill, sublevel, exerciseLevel) {
    const baseUrl = '/audio';
    const urls = [];
    
    // Generate URLs for common audio files
    const commonAudioFiles = [
      `${baseUrl}/${level.toLowerCase()}/${skill}/${sublevel}/greetings.mp3`,
      `${baseUrl}/${level.toLowerCase()}/${skill}/${sublevel}/numbers.mp3`,
      `${baseUrl}/${level.toLowerCase()}/${skill}/${sublevel}/colors.mp3`,
      `${baseUrl}/${level.toLowerCase()}/${skill}/${sublevel}/family.mp3`,
      `${baseUrl}/${level.toLowerCase()}/${skill}/${sublevel}/food.mp3`,
      `${baseUrl}/${level.toLowerCase()}/${skill}/${sublevel}/time.mp3`,
      `${baseUrl}/${level.toLowerCase()}/${skill}/${sublevel}/weather.mp3`,
      `${baseUrl}/${level.toLowerCase()}/${skill}/${sublevel}/directions.mp3`
    ];
    
    return commonAudioFiles;
  }

  // Preload audio for specific level/skill
  async preloadLevelAudio(level, skill, sublevel) {
    const audioUrls = this.generateAudioUrls(level, skill, sublevel);
    await this.preloadAudio(audioUrls);
  }

  // Check audio format support
  checkAudioSupport() {
    const audio = document.createElement('audio');
    const formats = {
      mp3: audio.canPlayType('audio/mpeg'),
      wav: audio.canPlayType('audio/wav'),
      ogg: audio.canPlayType('audio/ogg'),
      webm: audio.canPlayType('audio/webm')
    };
    
    return formats;
  }

  // Get best audio format for browser
  getBestAudioFormat() {
    const support = this.checkAudioSupport();
    
    if (support.mp3) return 'mp3';
    if (support.webm) return 'webm';
    if (support.ogg) return 'ogg';
    if (support.wav) return 'wav';
    
    return 'mp3'; // Fallback
  }

  // Convert audio format URL
  convertAudioUrl(url, format) {
    if (!url) return url;
    
    const supportedFormat = this.getBestAudioFormat();
    if (format === supportedFormat) return url;
    
    // Replace extension
    const baseUrl = url.replace(/\.[^/.]+$/, '');
    return `${baseUrl}.${supportedFormat}`;
  }

  // Text-to-speech functionality
  async speakText(text, options = {}) {
    const {
      voice = null,
      rate = 1,
      pitch = 1,
      volume = 1,
      lang = 'en-US'
    } = options;

    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.lang = lang;
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      speechSynthesis.speak(utterance);
    });
  }

  // Get available voices
  getAvailableVoices() {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    
    return speechSynthesis.getVoices().filter(voice => 
      voice.lang.startsWith('en') || voice.lang.startsWith('es')
    );
  }

  // Audio visualization (basic)
  async createAudioVisualizer(url, canvas, options = {}) {
    const {
      barCount = 32,
      barWidth = 10,
      barSpacing = 2,
      barColor = '#3b82f6',
      backgroundColor = '#f8fafc'
    } = options;

    try {
      const audio = await this.getAudio(url);
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = barCount * 2;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        const barWidth = (width / barCount) - barSpacing;
        
        for (let i = 0; i < barCount; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          const x = i * (barWidth + barSpacing);
          const y = height - barHeight;
          
          ctx.fillStyle = barColor;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
        
        requestAnimationFrame(draw);
      };
      
      audio.addEventListener('play', () => draw());
      audio.addEventListener('pause', () => {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      });
      
      return { audio, analyser, stop: () => audio.pause() };
    } catch (error) {
      console.error('Error creating audio visualizer:', error);
      throw error;
    }
  }

  // Audio recording (for speaking exercises)
  async startRecording(options = {}) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          resolve({ audioUrl, audioBlob });
        };
        
        mediaRecorder.onerror = reject;
        mediaRecorder.start();
        
        // Return recording controls
        resolve({
          stop: () => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
          },
          pause: () => mediaRecorder.pause(),
          resume: () => mediaRecorder.resume()
        });
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Helper functions
export const preloadExerciseAudio = async (exercises) => {
  const audioUrls = exercises
    .filter(ex => ex.audioUrl)
    .map(ex => ex.audioUrl);
  
  if (audioUrls.length > 0) {
    await audioManager.preloadAudio(audioUrls);
  }
};

export const playExerciseAudio = async (audioUrl, options = {}) => {
  return await audioManager.playAudio(audioUrl, options);
};

export const speakExerciseText = async (text, options = {}) => {
  return await audioManager.speakText(text, options);
};



