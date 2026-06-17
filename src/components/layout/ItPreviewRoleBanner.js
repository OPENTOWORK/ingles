'use client';

export default function ItPreviewRoleBanner({ option }) {
  if (!option) return null;

  return (
    <div
      className="it-preview-role-banner"
      role="status"
      aria-live="polite"
    >
      Vista previa de rol: <strong>{option.label}</strong> — solo menú y layout; los permisos reales
      siguen siendo los de tu sesión.
    </div>
  );
}
