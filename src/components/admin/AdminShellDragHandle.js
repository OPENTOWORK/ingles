export default function AdminShellDragHandle({ className = '' }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="4.5" cy="3" r="1.1" />
      <circle cx="9.5" cy="3" r="1.1" />
      <circle cx="4.5" cy="7" r="1.1" />
      <circle cx="9.5" cy="7" r="1.1" />
      <circle cx="4.5" cy="11" r="1.1" />
      <circle cx="9.5" cy="11" r="1.1" />
    </svg>
  );
}
