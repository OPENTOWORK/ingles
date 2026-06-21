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
        maxSec: 40,
        wordMin: 85,
        wordMax: 130,
        expandMin: 95,
        expandMax: 115,
      };
    case 11:
      return {
        label: 'Listening Part 2 (sentence completion)',
        minSec: 210,
        maxSec: 230,
        wordMin: 500,
        wordMax: 600,
        expandMin: 530,
        expandMax: 570,
      };
    case 12:
      return {
        label: 'Listening Part 3 (multiple matching)',
        minSec: 40,
        maxSec: 50,
        wordMin: 100,
        wordMax: 145,
        expandMin: 105,
        expandMax: 130,
      };
    case 13:
      return {
        label: 'Listening Part 4 (interview)',
        minSec: 225,
        maxSec: 255,
        wordMin: 550,
        wordMax: 680,
        expandMin: 580,
        expandMax: 640,
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
