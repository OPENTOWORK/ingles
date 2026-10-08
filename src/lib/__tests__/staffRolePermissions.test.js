import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDefaultPermissionKeysForRole,
  permissionKeysToMenuItems,
  resolvePermissionKeysForRole,
  resolveStaffRolePermissionKey,
  roleHasStaffPermission,
  roleMayEnterModule,
} from '@/lib/staffRolePermissions';

test('resolveStaffRolePermissionKey maps role aliases', () => {
  assert.equal(resolveStaffRolePermissionKey('Resp.marketing'), 'marketing');
  assert.equal(resolveStaffRolePermissionKey('coordinador'), 'coordinador');
  assert.equal(resolveStaffRolePermissionKey('profesor'), 'profesor');
});

test('resolvePermissionKeysForRole uses overrides when present', () => {
  const overrides = { profesor: ['buzon', 'blog'] };
  assert.deepEqual(resolvePermissionKeysForRole('profesor', overrides), ['buzon', 'blog']);
});

test('resolvePermissionKeysForRole falls back to defaults', () => {
  const keys = resolvePermissionKeysForRole('soporte', {});
  assert.ok(keys.includes('soporte'));
  assert.ok(keys.includes('buzon'));
});

test('roleMayEnterModule accepts any granted module and blocks students', () => {
  const overrides = { marketing: ['admin', 'soporte', 'planObjetivos'] };
  assert.equal(roleMayEnterModule('Resp.marketing', ['admin', 'soporte'], overrides), true);
  assert.equal(roleMayEnterModule('Resp.marketing', 'ejercicios', overrides), false);
  assert.equal(roleMayEnterModule('student', 'admin', overrides), false);
  assert.equal(roleMayEnterModule('admin', 'facturacion', {}), true);
});

test('roleHasStaffPermission follows the tareas grant and blocks students', () => {
  const overrides = { marketing: ['buzon', 'tareas', 'blog'] };
  assert.equal(roleHasStaffPermission('Resp.marketing', 'tareas', overrides), true);
  assert.equal(roleHasStaffPermission('student', 'tareas', overrides), false);
  assert.equal(roleHasStaffPermission('alumno', 'tareas', { alumno: ['tareas'] }), false);
  assert.equal(roleHasStaffPermission('marketing', 'tareas', {}), false);
});

test('permissionKeysToMenuItems builds menu entries', () => {
  const items = permissionKeysToMenuItems(getDefaultPermissionKeysForRole('marketing'));
  assert.ok(items.some((item) => item.href === '/admin/marketing'));
  assert.ok(items.some((item) => item.href === '/admin/blog'));
});
