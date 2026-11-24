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

test('teachers see only the teacher module and the calendar', () => {
  const teacher = labels('profesor');
  assert.deepEqual(
    teacher.map((item) => item.label),
    ['Profesor', 'Calendario'],
  );
  assert.ok(teacher.every((item) => item.locked === false));
  assert.equal(teacher.find((item) => item.label === 'Buzón y reuniones'), undefined);
  assert.equal(teacher.find((item) => item.label === 'Analíticas'), undefined);
  assert.equal(shouldShowAdminShell('/teacher', 'profesor'), true);
  assert.equal(shouldShowAdminShell('/teacher/calendario', 'teacher'), true);
  assert.equal(shouldShowAdminShell('/buzon', 'teacher'), true);
  assert.equal(shouldShowAdminShell('/exam-practice/b2', 'profesor'), false);
});

test('other roles see every module, locked without permission', () => {
  const support = labels('soporte');
  assert.ok(support.length > 5);
  assert.equal(support.find((item) => item.label === 'Buzón y reuniones').locked, false);
  assert.equal(support.find((item) => item.label === 'Tareas').locked, false);
  assert.equal(support.find((item) => item.label === 'Analíticas').locked, true);
  assert.equal(support.find((item) => item.label === 'Facturación').locked, true);
  assert.equal(support.find((item) => item.label === 'Visualización de la app').section, 'Informática');
  assert.equal(support.find((item) => item.label === 'Visualización de la app').locked, true);
  assert.equal(shouldShowAdminShell('/soporte', 'soporte'), true);
});

test('admin sees the same modules unlocked', () => {
  const admin = labels('admin');
  assert.ok(admin.every((item) => item.locked === false));
  const plan = admin.find((item) => item.label === 'Plan de marketing');
  assert.equal(plan?.section, 'Comercial');
  assert.equal(plan?.locked, false);
  assert.equal(labels('marketing').find((item) => item.label === 'Plan de marketing').locked, false);
  assert.equal(labels('soporte').find((item) => item.label === 'Plan de marketing').locked, true);
  assert.equal(shouldShowAdminShell('/paneles', 'admin'), true);
  assert.equal(shouldShowAdminShell('/admin/plan-marketing', 'admin'), true);
});

test('permission overrides unlock a module', () => {
  const support = labels('soporte', { soporte: ['buzon', 'blog'] });
  assert.equal(support.find((item) => item.label === 'Blog').locked, false);
  assert.equal(support.find((item) => item.label === 'Tareas').locked, true);
});

test('teacher permission overrides do not restore the admin index', () => {
  const teacher = labels('profesor', { profesor: ['buzon', 'blog'] });
  assert.deepEqual(
    teacher.map((item) => item.label),
    ['Profesor', 'Calendario'],
  );
});
