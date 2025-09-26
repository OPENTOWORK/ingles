'use client';
import { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ 
  audioUrl, 
  transcript, 
  showTranscript = false,
  onPlayStart,
  onPlayEnd,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);
    const handleError = () => {
      setError('Error loading audio');
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      onPlayEnd?.();
    });

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
    };
  }, [onPlayEnd]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
        onPlayStart?.();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Error playing audio');
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    audioRef.current.playbackRate = newRate;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={`audio-error ${className}`} style={{
        padding: '1rem',
        backgroundColor: '#fee2e2',
        border: '1px solid #fca5a5',
        borderRadius: '8px',
        color: '#dc2626',
        textAlign: 'center'
      }}>
        <p>⚠️ {error}</p>
        {transcript && (
          <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            <strong>Transcript:</strong> {transcript}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`audio-player ${className}`} style={{
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #e2e8f0'
    }}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Main Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          style={{
            backgroundColor: isPlaying ? '#ef4444' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
        </button>

        <div style={{ flex: 1 }}>
          <div 
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#e2e8f0',
              borderRadius: '3px',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={handleSeek}
          >
            <div style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              borderRadius: '3px',
              transition: 'width 0.1s ease'
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#64748b',
            marginTop: '0.25rem'
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Advanced Controls */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Volume Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: '80px' }}
          />
        </div>

        {/* Speed Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>⚡</span>
          <select
            value={playbackRate}
            onChange={handlePlaybackRateChange}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '0.8rem'
            }}
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>

        {/* Replay Button */}
        <button
          onClick={() => {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            setIsPlaying(true);
          }}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        >
          🔄 Replay
        </button>
      </div>

      {/* Transcript Toggle */}
      {transcript && (
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            {showTranscript ? '🙈 Hide' : '👁️ Show'} Transcript
          </button>
          {showTranscript && (
            <div style={{
              marginTop: '0.5rem',
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#374151',
              border: '1px solid #e5e7eb'
            }}>
              <strong>Transcript:</strong> {transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;



