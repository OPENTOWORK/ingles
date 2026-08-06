/**
 * B2 Listening audio duration + script word-count targets (exam parts 10–13).
 *
 * `minSec`/`maxSec` describe a single clip; `totalMinSec`/`totalMaxSec` describe the
 * assembled recording (intro + pass 1 + pause + pass 2), which is what gets stored.
 * @param {number} partNumber
 */
export function getB2ListeningAudioTargets(partNumber) {
  switch (Number(partNumber)) {
    case 10:
      return {
        label: 'Listening Part 1 (short extracts)',
        minSec: 30,
        maxSec: 50,
        totalMinSec: 570,
        totalMaxSec: 960,
        wordMin: 95,
        wordMax: 140,
        expandMin: 100,
        expandMax: 125,
      };
    case 11:
      return {
        label: 'Listening Part 2 (sentence completion — interview)',
        minSec: 130,
        maxSec: 175,
        totalMinSec: 300,
        totalMaxSec: 480,
        wordMin: 300,
        wordMax: 420,
        expandMin: 350,
        expandMax: 400,
      };
    case 12:
      return {
        label: 'Listening Part 3 (multiple matching)',
        minSec: 30,
        maxSec: 50,
        totalMinSec: 400,
        totalMaxSec: 650,
        wordMin: 85,
        wordMax: 125,
        expandMin: 100,
        expandMax: 125,
      };
    case 13:
      return {
        label: 'Listening Part 4 (interview / discussion)',
        minSec: 180,
        maxSec: 300,
        totalMinSec: 380,
        totalMaxSec: 700,
        wordMin: 450,
        wordMax: 620,
        expandMin: 480,
        expandMax: 580,
      };
    default:
      return null;
  }
}

/**
 * Montaje canónico de las grabaciones B2 (mismo patrón que el Examen 1):
 * intro compartida → pausa → pasada 1 → pausa → pasada 2.
 * El JSON generado puede sobrescribir estos valores, pero nunca depende de ellos.
 * @param {number} partNumber
 */
export function getB2ListeningAudioAssembly(partNumber) {
  const targets = getB2ListeningAudioTargets(partNumber);
  if (!targets) return null;

  const base = {
    introPauseSec: 5,
    betweenExtractPauseSec: 3,
    passes: 2,
    totalDurationTargetSec: { min: targets.totalMinSec, max: targets.totalMaxSec },
  };

  switch (Number(partNumber)) {
    case 10:
      return { ...base, introFromSupabase: 'b2/shared/listening-part-1-intro.mp3', betweenPassesPauseSec: 10 };
    case 11:
      return { ...base, introFromSupabase: 'b2/shared/listening-part-2-intro.mp3', betweenPassesPauseSec: 10 };
    case 12:
      return { ...base, introFromSupabase: 'b2/shared/listening-part-3-intro.mp3', betweenPassesPauseSec: 15 };
    case 13:
      return { ...base, introFromSupabase: 'b2/shared/listening-part-4-intro.mp3', betweenPassesPauseSec: 25 };
    default:
      return null;
  }
}

export function formatDurationSec(sec) {
  if (!Number.isFinite(sec)) return '?';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
