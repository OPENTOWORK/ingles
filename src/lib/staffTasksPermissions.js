import {
  canAccessAdminTeacherPanelView,
  isAdminRole,
  isCoordinatorRole,
  isTeacherRole,
  normalizeRoleName,
} from '@/utils/authRoles';

export function canManageStaffPhases(userRole = '') {
  return isAdminRole(userRole);
}

export function canManageAllStaffTasks(userRole = '') {
  return isAdminRole(userRole) || isCoordinatorRole(userRole);
}

export function canPickAnyAssignee(userRole = '') {
  return canAccessAdminTeacherPanelView(userRole) || !isTeacherRole(userRole);
}

export function isSelfOnlyTasksView(_userRole = '') {
  return false;
}

export function canDeleteStaffTask(userRole = '') {
  return isAdminRole(userRole);
}

export function canCancelStaffTask(userRole = '') {
  return !isAdminRole(userRole);
}

export function getStaffDepartmentLabel(roleName = '') {
  const role = normalizeRoleName(roleName);
  const labels = {
    admin: 'Administración',
    administrador: 'Administración',
    coordinador: 'Coordinación',
    coordinator: 'Coordinación',
    teacher: 'Profesorado',
    profesor: 'Profesorado',
    soporte: 'Soporte',
    support: 'Soporte',
    informatico: 'Informática',
    it: 'Informática',
    centro_empresa: 'Centro/Empresa',
    clases_grupos: 'Clases/Grupos',
  };
  return labels[role] || roleName || 'Staff';
}

export function isDevEnvironment() {
  return process.env.NODE_ENV === 'development';
}

export function shouldShowSchemaSetupHint(tablesReady) {
  return tablesReady === false && isDevEnvironment();
}
