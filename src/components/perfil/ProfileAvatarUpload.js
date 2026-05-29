'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * @param {{
 *   avatarUrl?: string | null,
 *   displayName?: string,
 *   onSelectFile: (file: File) => void | Promise<void>,
 *   uploading?: boolean,
 *   error?: string,
 *   size?: number,
 *   className?: string,
 * }} props
 */
export default function ProfileAvatarUpload({
  avatarUrl = null,
  displayName = '',
  onSelectFile,
  uploading = false,
  error = '',
  size = 88,
  className = '',
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const initials = (displayName || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '?';

  const shownUrl = previewUrl || avatarUrl || null;

  useEffect(() => {
    if (!avatarUrl || !previewUrl) return;
    URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [avatarUrl, previewUrl]);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });

    try {
      await onSelectFile(file);
    } catch {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  };

  return (
    <div className={`profile-avatar${className ? ` ${className}` : ''}`.trim()}>
      <button
        type="button"
        className="profile-avatar__button"
        style={{ width: size, height: size }}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={shownUrl ? 'Change profile photo' : 'Upload profile photo'}
        title="Click to change your photo"
      >
        {shownUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shownUrl} alt="" className="profile-avatar__img" />
        ) : (
          <span className="profile-avatar__placeholder" aria-hidden>
            {initials}
          </span>
        )}
        <span className="profile-avatar__overlay">
          {uploading ? '…' : '📷'}
        </span>
      </button>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="profile-avatar__input"
        onChange={handleChange}
        disabled={uploading}
      />
      {error ? (
        <p className="profile-avatar__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
