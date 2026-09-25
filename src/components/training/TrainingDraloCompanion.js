'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sitePublicPath } from '@/utils/sitePublicPath';
import styles from './TrainingDraloCompanion.module.css';

const STORAGE_KEY = 'dralo-training-companion-pos';
const WIDTH = 168;
const HEIGHT = 200;

const POSES = {
  idle: [{ src: '/mascot/poses/think.png', line: '' }],
  correct: [
    { src: '/mascot/poses/cheer.png', line: 'Yes!' },
    { src: '/mascot/poses/clap.png', line: 'Nice!' },
  ],
  wrong: [
    { src: '/mascot/poses/sad.png', line: 'Not quite' },
    { src: '/mascot/poses/oops.png', line: 'Oops' },
    { src: '/mascot/poses/shrug.png', line: 'Hmm' },
  ],
  wave: [{ src: '/mascot/poses/clap.png', line: 'Hi!' }],
};

function poseKey(mood, wave) {
  if (wave) return 'wave';
  if (mood === 'correct' || mood === 'wrong') return mood;
  return 'idle';
}

function pickPose(pool, previousSrc) {
  const options = pool.filter((item) => item.src !== previousSrc);
  const list = options.length ? options : pool;
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(x, y) {
  const maxX = Math.max(8, window.innerWidth - WIDTH - 8);
  const maxY = Math.max(72, window.innerHeight - HEIGHT - 8);
  return {
    x: Math.min(maxX, Math.max(8, x)),
    y: Math.min(maxY, Math.max(72, y)),
  };
}

function defaultPosition() {
  const gutter = Math.max(16, (window.innerWidth - 680) / 2);
  return clamp(Math.round(gutter / 2 - WIDTH / 2), Math.round(window.innerHeight * 0.22));
}

function readStoredPosition() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return null;
    return clamp(parsed.x, parsed.y);
  } catch {
    return null;
  }
}

export default function TrainingDraloCompanion({
  mood = 'idle',
  dock = false,
  prompt = '',
  reactionKey = 0,
}) {
  const [pos, setPos] = useState(null);
  const [wave, setWave] = useState(false);
  const [lineOn, setLineOn] = useState(false);
  const [frame, setFrame] = useState(POSES.idle[0]);
  const frameRef = useRef(POSES.idle[0]);
  const dragRef = useRef(null);
  const waveTimer = useRef(0);

  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  useEffect(() => {
    setPos(readStoredPosition() || defaultPosition());
  }, []);

  useEffect(() => {
    const onResize = () => setPos((current) => (current ? clamp(current.x, current.y) : current));
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(waveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (mood !== 'correct' && mood !== 'wrong') {
      setLineOn(false);
      return undefined;
    }
    setLineOn(true);
    setWave(false);
    const timer = window.setTimeout(() => setLineOn(false), 1600);
    return () => window.clearTimeout(timer);
  }, [mood, reactionKey]);

  useEffect(() => {
    const key = poseKey(mood, wave);
    setFrame(pickPose(POSES[key], frameRef.current.src));
  }, [mood, wave, reactionKey]);

  const onPointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    const node = event.currentTarget;
    node.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      startX: pos.x,
      startY: pos.y,
      moved: false,
    };
  }, [pos]);

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.originX;
    const dy = event.clientY - drag.originY;
    if (Math.hypot(dx, dy) > 4) drag.moved = true;
    const next = clamp(drag.startX + dx, drag.startY + dy);
    setPos(next);
  }, []);

  const finishDrag = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.moved) {
      const next = clamp(drag.startX + (event.clientX - drag.originX), drag.startY + (event.clientY - drag.originY));
      setPos(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore private mode */
      }
      return;
    }
    if (mood !== 'idle') return;
    setWave(true);
    window.clearTimeout(waveTimer.current);
    waveTimer.current = window.setTimeout(() => setWave(false), 1400);
  }, [mood]);

  if (!pos) return null;

  const pose = poseKey(mood, wave);
  const showingPrompt = pose === 'idle' && Boolean(prompt);
  const caption = pose === 'wave' || lineOn ? frame.line : showingPrompt ? prompt : '';

  return (
    <div
      className={`${styles.companion} ${dock ? styles.dock : ''} ${styles[pose]}`}
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      role="img"
      aria-label={prompt ? `Dralo says: ${prompt}` : 'Dralo. Drag to move him.'}
    >
      {caption ? (
        <p className={`${styles.bubble} ${showingPrompt ? styles.prompt : ''}`}>{caption}</p>
      ) : null}
      <img
        className={styles.sprite}
        src={sitePublicPath(frame.src)}
        alt=""
        width={WIDTH}
        height={HEIGHT}
        draggable={false}
      />
    </div>
  );
}
