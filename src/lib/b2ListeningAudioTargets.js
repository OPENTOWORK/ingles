/**
 * B2 Listening audio duration + script word-count targets (exam parts 10–13).
 * @param {number} partNumber
 */
export function getB2ListeningAudioTargets(partNumber) {
  switch (Number(partNumber)) {
    case 10:
      return {
        label: 'Listening Part 1 (short extracts)',
        minSec: 30,
        maxSec: 45,
        totalMinSec: 570,
        totalMaxSec: 720,
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
        totalMinSec: 330,
        totalMaxSec: 420,
        wordMin: 270,
        wordMax: 340,
        expandMin: 280,
        expandMax: 320,
      };
    case 12:
      return {
        label: 'Listening Part 3 (multiple matching)',
        minSec: 30,
        maxSec: 45,
        totalMinSec: 480,
        totalMaxSec: 600,
        wordMin: 85,
        wordMax: 125,
        expandMin: 100,
        expandMax: 125,
      };
    case 13:
      return {
        label: 'Listening Part 4 (interview / discussion)',
        minSec: 180,
        maxSec: 240,
        wordMin: 450,
        wordMax: 620,
        expandMin: 480,
        expandMax: 580,
      };
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
