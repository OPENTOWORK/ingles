/** Must match server expectations for elevated routes (admin, CMS). */
export const ADMIN_EMAIL = 'direccion@opentowork.com';

export function normalizeEmail(email = ''): string {
  return email.trim().toLowerCase();
}
