import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminShellMenuSections, shouldShowAdminShell } from '@/config/appNavMenu';

function labels(role, overrides) {
  return getAdminShellMenuSections(role, overrides).flatMap((section) =>
    (section.items || []).map((item) => ({
      label: item.label,
      locked: item.locked,
      section: section.title,
    })),
  );
}

test('students do not see the admin shell', () => {
  assert.equal(getAdminShellMenuSections('student').length, 0);
  assert.equal(getAdminShellMenuSections('alumno').length, 0);
  assert.equal(shouldShowAdminShell('/admin', 'student'), false);
  assert.equal(shouldShowAdminShell('/buzon', 'alumno'), false);
  assert.equal(shouldShowAdminShell('/admin', ''), false);
});

test('other roles see every module, locked without permission', () => {
  const teacher = labels('profesor');
  assert.ok(teacher.length > 5);
  assert.equal(teacher.find((item) => item.label === 'Buzón y reuniones').locked, false);
  assert.equal(teacher.find((item) => item.label === 'Tareas').locked, false);
  assert.equal(teacher.find((item) => item.label === 'Analíticas').locked, true);
  assert.equal(teacher.find((item) => item.label === 'Facturación').locked, true);
  assert.equal(shouldShowAdminShell('/teacher', 'profesor'), true);
  assert.equal(shouldShowAdminShell('/buzon', 'teacher'), true);
  assert.equal(shouldShowAdminShell('/exam-practice/b2', 'profesor'), false);
});

test('admin sees the same modules unlocked', () => {
  const admin = labels('admin');
  assert.ok(admin.every((item) => item.locked === false));
  assert.equal(shouldShowAdminShell('/paneles', 'admin'), true);
});

test('permission overrides unlock a module', () => {
  const teacher = labels('profesor', { profesor: ['buzon', 'blog'] });
  assert.equal(teacher.find((item) => item.label === 'Blog').locked, false);
  assert.equal(teacher.find((item) => item.label === 'Tareas').locked, true);
});
