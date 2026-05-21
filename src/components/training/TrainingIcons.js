/** Minimal SVG icons for training cards (no emoji). */

const iconProps = { width: 28, height: 28, fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function IconBook(props) {
  return (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function IconPen(props) {
  return (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export function IconHeadphones(props) {
  return (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

export function IconMic(props) {
  return (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
    </svg>
  );
}

export function IconLayers(props) {
  return (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export function IconBrain(props) {
  return (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.2.4 2.3 1 3.2A5.5 5.5 0 0 0 9.5 22" />
      <path d="M14.5 2A5.5 5.5 0 0 1 20 7.5c0 1.2-.4 2.3-1 3.2A5.5 5.5 0 0 1 14.5 22" />
      <path d="M12 2v20" />
    </svg>
  );
}

export function IconPuzzle(props) {
  return (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M19.439 7.85c-.15.54-.6.95-1.16 1.03-.7.1-1.28.68-1.28 1.38 0 .76.62 1.38 1.38 1.38.7 0 1.28-.58 1.38-1.28.08-.56.49-1.01 1.03-1.16.72-.2 1.22-.86 1.22-1.62 0-.9-.73-1.63-1.63-1.63-.76 0-1.42.5-1.62 1.22z" />
      <path d="M10.5 21.5c-.15-.54-.6-.95-1.16-1.03-.7-.1-1.28-.68-1.28-1.38 0-.76.62-1.38 1.38-1.38.7 0 1.28.58 1.38 1.28.08.56.49 1.01 1.03 1.16.72.2 1.22.86 1.22 1.62 0 .9-.73 1.63-1.63 1.63-.76 0-1.42-.5-1.62-1.22z" />
      <path d="M14 2v4M10 6V2M6 10H2M6 14H2M18 10h4M18 14h4M14 18v4M10 18v4" />
    </svg>
  );
}

export function IconTrophy(props) {
  return (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 4H5a2 2 0 0 0 0 4h2M17 4h2a2 2 0 0 1 0 4h-2" />
    </svg>
  );
}

export function IconStar({ filled, ...props }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...props}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SKILL_ICONS = {
  'use-of-english': IconBook,
  writing: IconPen,
  listening: IconHeadphones,
  speaking: IconMic,
  reading: IconBook,
  vocabulary: IconBrain,
  all: IconPuzzle,
  challenge: IconTrophy,
};

export function TrainingSkillIcon({ skillId, className }) {
  const Icon = SKILL_ICONS[skillId] || IconLayers;
  return <span className={className} aria-hidden><Icon /></span>;
}
