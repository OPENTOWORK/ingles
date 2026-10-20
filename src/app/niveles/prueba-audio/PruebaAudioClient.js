'use client';

import ExamListeningAudioPlayer from '@/components/b2/ExamListeningAudioPlayer';
import SiteMascot from '@/components/SiteMascot';

const AUDIO_SRC = '/listening-preview/p02-part2.mp3';

export default function PruebaAudioClient() {
  return (
    <main className="main-content" style={{ maxWidth: 880, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <div
        className="levels-b2-practice levels-b2-practice--skill-compact"
        data-skill-theme="listening"
      >
        <header className="levels-b2-practice__header">
          <div className="levels-b2-practice__title-block">
            <div className="levels-b2-practice__title-meta">
              <span className="levels-b2-practice__title-level">B2</span>
            </div>
            <h1 className="levels-b2-practice__title">
              <span className="levels-b2-practice__title-headline">Listening · Part 2</span>
            </h1>
          </div>
          <div className="levels-b2-practice__mascot" aria-hidden>
            <SiteMascot variant={10} width={128} alt="" />
          </div>
        </header>

        <div className="levels-listening-question-card">
          <p className="levels-listening-question-card__title">Part 2</p>
          <p className="levels-listening-context-line">
            Un solo audio: intro, master, «repeat» y otra vez el master. Hay 5 segundos de silencio entre cada pieza.
          </p>
          <p className="levels-listening-audio-label">Audio</p>
          <ExamListeningAudioPlayer
            src={AUDIO_SRC}
            examMode
            allowSeek
            lang="es"
            clipKey={AUDIO_SRC}
          />
        </div>
      </div>
    </main>
  );
}
