/**
 * B2 Listening audio duration + script word-count targets (exam parts 10–13).
 * @param {number} partNumber
 */
export function getB2ListeningAudioTargets(partNumber) {
  switch (Number(partNumber)) {
    case 10:
      return {
        label: 'Listening Part 1 (short extracts)',
        minSec: 33,
        maxSec: 38,
        totalMinSec: 270,
        totalMaxSec: 300,
        wordMin: 80,
        wordMax: 98,
        expandMin: 85,
        expandMax: 95,
      };
    case 11:
      return {
        label: 'Listening Part 2 (sentence completion)',
        minSec: 150,
        maxSec: 210,
        wordMin: 380,
        wordMax: 520,
        expandMin: 430,
        expandMax: 500,
      };
    case 12:
      return {
        label: 'Listening Part 3 (multiple matching)',
        minSec: 30,
        maxSec: 35,
        totalMinSec: 180,
        totalMaxSec: 240,
        wordMin: 70,
        wordMax: 95,
        expandMin: 75,
        expandMax: 90,
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
