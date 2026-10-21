'use client';

import ExamListeningAudioPlayer from '@/components/b2/ExamListeningAudioPlayer';
import SiteMascot from '@/components/SiteMascot';

const CLIPS = [
  {
    id: 'p01-part1',
    title: 'Part 1',
    src: '/listening-preview/p01-part1.mp3',
    note: 'Cada extracto: narración, master, 3 segundos de silencio y otra vez el master. Al final, 10 segundos y «That\'s the end of part 1».',
  },
  {
    id: 'p01-part2',
    title: 'Part 2',
    src: '/listening-preview/p01-part2.mp3',
    note: 'Intro, un minuto para mirar, master, «repeat» y otra vez el master. Al final, «That\'s the end of part 2».',
  },
  {
    id: 'p01-part3',
    title: 'Part 3',
    src: '/listening-preview/p01-part3.mp3',
    note: 'Intro, 30 segundos, los cinco extractos con 3 segundos entre ellos, «repeat» y otra vez los cinco. Al final, «That\'s the end of part 3».',
  },
  {
    id: 'p01-part4',
    title: 'Part 4',
    src: '/listening-preview/p01-part4.mp3',
    note: 'Intro, un minuto para mirar, master, «repeat» y otra vez el master. Al final, «That\'s the end of part 4».',
  },
];

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
              <span className="levels-b2-practice__title-headline">Listening · prueba de audio</span>
            </h1>
          </div>
          <div className="levels-b2-practice__mascot" aria-hidden>
            <SiteMascot variant={10} width={128} alt="" />
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {CLIPS.map((clip) => (
            <div className="levels-listening-question-card" key={clip.id}>
              <p className="levels-listening-question-card__title">{clip.title}</p>
              <p className="levels-listening-context-line">{clip.note}</p>
              <p className="levels-listening-audio-label">Audio</p>
              <ExamListeningAudioPlayer
                src={clip.src}
                examMode
                allowSeek
                lang="es"
                clipKey={clip.src}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
