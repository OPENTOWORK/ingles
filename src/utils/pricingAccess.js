import { isAdminRole } from '@/utils/authRoles';

/** La página /precios y enlaces de pricing solo para administradores (por ahora). */
export function canViewPricing(userRole) {
  return isAdminRole(userRole);
}
