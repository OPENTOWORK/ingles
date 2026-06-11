import { MASCOT_LOGO_VARIANT, MASCOT_VARIANTS } from '@/config/mascotAssets';
import { sitePublicPath } from '@/utils/sitePublicPath';

/** Mascot PNG ids suitable as profile avatars (excludes logo with text). */
export const PROFILE_MASCOT_AVATAR_VARIANTS = MASCOT_VARIANTS.filter(
  (v) => v !== MASCOT_LOGO_VARIANT,
);

export function pickRandomMascotVariant() {
  const pool = PROFILE_MASCOT_AVATAR_VARIANTS;
  return pool[Math.floor(Math.random() * pool.length)] ?? 6;
}

export function normalizeMascotVariant(variant, fallback = 6) {
  const n = Number(variant);
  return PROFILE_MASCOT_AVATAR_VARIANTS.includes(n) ? n : fallback;
}

export function getMascotAvatarPath(variant) {
  const v = normalizeMascotVariant(variant);
  return sitePublicPath(`/mascot/${v}.png`);
}

/** True when `foto_url` is a user-uploaded photo (not a default mascot path). */
export function isCustomProfilePhotoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.includes('/mascot/')) return false;
  return true;
}

export function resolveProfileAvatarDisplay({ fotoUrl, mascotVariant } = {}) {
  if (isCustomProfilePhotoUrl(fotoUrl)) {
    return { displayUrl: fotoUrl.trim(), isDefaultMascot: false, mascotVariant: null };
  }
  const variant = mascotVariant != null ? normalizeMascotVariant(mascotVariant) : null;
  if (variant == null) {
    return { displayUrl: null, isDefaultMascot: false, mascotVariant: null };
  }
  return {
    displayUrl: getMascotAvatarPath(variant),
    isDefaultMascot: true,
    mascotVariant: variant,
  };
}
