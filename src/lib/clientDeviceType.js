/** @typedef {'mobile' | 'tablet' | 'desktop'} ClientDeviceType */

/**
 * Detecta el tipo de dispositivo en el navegador (solo cliente).
 * @returns {ClientDeviceType}
 */
export function detectClientDeviceType() {
  if (typeof navigator === 'undefined') return 'desktop';

  const ua = navigator.userAgent || '';

  // iPadOS 13+ suele reportar MacIntel con touch.
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    return 'tablet';
  }

  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) {
    return 'tablet';
  }

  if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

/** @param {string | null | undefined} deviceType */
export function isValidClientDeviceType(deviceType) {
  return deviceType === 'mobile' || deviceType === 'tablet' || deviceType === 'desktop';
}
