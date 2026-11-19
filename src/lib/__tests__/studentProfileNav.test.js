import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { isAppNavReady, buildAppNavModel } from '@/config/appNavMenu.js';
import {
  getProfileTabById,
  getVisibleProfileTabs,
  isStudentHiddenProfileTab,
} from '@/components/perfil/profileTabsConfig.js';
import {
  SKILL_ANALYSIS_COMING_SOON,
  STUDENT_PROFILE_SECTIONS,
  buildStudentProfileHistoryUrl,
  isStudentSidebarSection,
  profileHelpHref,
  reduceStudentDrawer,
  resolveProfileShell,
  resolveStudentProfileTab,
  sidebarLinkIndexAfterKey,
  studentDrawerKeyAction,
  studentProfileHref,
} from '@/lib/studentProfileNav.js';
import {
  applyReadingNightBodyClass,
  loadReadingSettings,
  toggleReadingTheme,
} from '@/lib/readingPracticeSettingsStorage.js';
import { clearAllRoleCaches } from '@/utils/authRoles.js';
import { clearSupabaseAuthStorage } from '@/utils/clearSupabaseAuthStorage.js';

const srcRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readSrc = (rel) => fs.readFileSync(path.join(srcRoot, rel), 'utf8');

describe('student profile navigation', () => {
  it('keeps the seven sidebar sections and their addresses', () => {
    assert.equal(isStudentSidebarSection('exam-statistics'), true);
    assert.equal(isStudentSidebarSection('error-tracker'), false);
    assert.equal(isStudentSidebarSection('exam-dates'), false);
    assert.equal(studentProfileHref('overview'), '/profile/');
    assert.equal(studentProfileHref('subscription'), '/profile/?tab=subscription');
  });

  it('opens account details and the referral form without dropping saved tool addresses', () => {
    assert.equal(resolveStudentProfileTab('mis-datos'), 'account');
    assert.equal(resolveStudentProfileTab('settings', { invite: true }), 'subscription');
    assert.equal(resolveStudentProfileTab('error-tracker'), 'error-tracker');
    assert.equal(resolveStudentProfileTab('vocabulary'), 'vocabulary');
    assert.equal(resolveStudentProfileTab('exam-dates'), 'exam-dates');
    assert.equal(resolveStudentProfileTab('not-a-section'), 'overview');
    assert.equal(resolveStudentProfileTab(''), 'overview');
  });

  it('keeps Dralo AI, Pricing and Night mode for staff, and removes them from the student header', () => {
    const student = buildAppNavModel('student', { user: { id: 'student' } });
    const staff = buildAppNavModel('admin', { user: { id: 'staff' } });
    const guest = buildAppNavModel('', null);

    assert.equal(student.showDralo, false);
    assert.equal(student.showPricing, false);
    assert.equal(student.showNightMode, false);
    assert.equal(student.showContact, true);
    assert.equal(student.showLogout, true);

    assert.equal(staff.showDralo, true);
    assert.equal(staff.showPricing, true);
    assert.equal(staff.showNightMode, true);
    assert.equal(staff.showLogout, true);

    assert.equal(guest.showDralo, false);
    assert.equal(guest.showPricing, true);
    assert.equal(guest.showNightMode, true);
    assert.equal(guest.showLogin, true);

    const guestBeforeRoleLoads = buildAppNavModel('student', null);
    assert.equal(guestBeforeRoleLoads.showPricing, true);
    assert.equal(guestBeforeRoleLoads.showNightMode, true);
    assert.equal(guestBeforeRoleLoads.showDralo, false);
    assert.equal(guestBeforeRoleLoads.showLogin, true);

    const guestWithStaleStaffRole = buildAppNavModel('admin', null);
    assert.equal(guestWithStaleStaffRole.showDralo, false);
    assert.equal(guestWithStaleStaffRole.showPricing, true);
    assert.equal(guestWithStaleStaffRole.showNightMode, true);

    const unresolved = buildAppNavModel('', { user: { id: 'pending' } });
    assert.equal(unresolved.showDralo, false);
    assert.equal(isAppNavReady({ user: { id: 'pending' } }, null), false);
    assert.equal(isAppNavReady(null, null), true);
    assert.equal(isAppNavReady({ user: { id: 'pending' } }, 'pending'), true);

    for (const role of ['teacher', 'coordinador', 'soporte', 'informatico', 'Resp.marketing', 'admin']) {
      const staffRole = buildAppNavModel(role, { user: { id: role } });
      assert.equal(staffRole.showDralo, true, role);
      assert.equal(staffRole.showPricing, true, role);
      assert.equal(staffRole.showNightMode, true, role);
      assert.equal(staffRole.showContact, true, role);
      assert.equal(staffRole.showLogout, true, role);
      assert.equal(staffRole.isStudent, false, role);
    }
  });

  it('keeps every student destination addressable and leaves the old tracker alone', () => {
    assert.deepEqual(
      STUDENT_PROFILE_SECTIONS.map((section) => section.label),
      ['Overview', 'Exam Statistics', 'Error Analytics', 'Training Experience', 'Your Account', 'Subscription', 'Settings'],
    );
    for (const section of STUDENT_PROFILE_SECTIONS) {
      assert.equal(resolveStudentProfileTab(section.id), section.id);
      assert.match(studentProfileHref(section.id), /^\/profile\/(\?tab=|$)/);
    }

    assert.equal(resolveStudentProfileTab('settings', { invite: true }), 'subscription');
    assert.equal(resolveStudentProfileTab('', { invite: true }), 'subscription');
    assert.equal(resolveStudentProfileTab('mis-datos', { invite: true }), 'subscription');
    assert.equal(resolveStudentProfileTab('error-tracker', { invite: true }), 'error-tracker');

    const start = 'http://localhost/profile/?tab=settings&invite=1';
    assert.equal(buildStudentProfileHistoryUrl(start, 'subscription'), '/profile/?tab=subscription&invite=1');
    assert.equal(buildStudentProfileHistoryUrl(start, 'overview'), '/profile/');
    assert.equal(buildStudentProfileHistoryUrl(start, 'account'), '/profile/?tab=account');
    assert.equal(
      buildStudentProfileHistoryUrl('http://localhost/profile/?tab=overview&checkout=success', 'exam-statistics'),
      '/profile/?tab=exam-statistics&checkout=success',
    );

    assert.equal(profileHelpHref(), '/contacto/');
    assert.equal(SKILL_ANALYSIS_COMING_SOON, 'Skill analysis coming soon');
    assert.equal(getProfileTabById('error-tracker').label, 'Error Tracker');
    assert.equal(getProfileTabById('error-tracker').studentAllowed, true);
    assert.equal(isStudentHiddenProfileTab('error-tracker', true), false);
    assert.equal(isStudentSidebarSection('error-tracker'), false);
    assert.equal(isStudentSidebarSection('exam-dates'), false);
    assert.equal(isStudentSidebarSection('private-tutor'), false);

    const staffTabs = getVisibleProfileTabs(false).map((tab) => tab.id);
    assert.ok(staffTabs.includes('exam-dates'));
    assert.ok(staffTabs.includes('private-tutor'));
    assert.ok(staffTabs.includes('settings'));

    const pending = resolveProfileShell({
      session: { user: { id: 'student-1' } },
      userRole: 'student',
      roleSettledForUserId: null,
    });
    assert.equal(pending.roleReady, false);
    assert.equal(pending.isStudent, false);
    assert.deepEqual(
      resolveProfileShell({
        session: { user: { id: 'student-1' } },
        userRole: 'student',
        roleSettledForUserId: 'student-1',
      }),
      { roleReady: true, isStudent: true },
    );
    assert.deepEqual(
      resolveProfileShell({
        session: { user: { id: 'staff-1' } },
        userRole: 'admin',
        roleSettledForUserId: 'staff-1',
      }),
      { roleReady: true, isStudent: false },
    );
    assert.equal(
      resolveProfileShell({ session: null, userRole: 'student' }).isStudent,
      false,
    );
  });

  it('opens, moves and closes the mobile profile drawer from the shared controls', () => {
    let drawer = { open: false, isMobile: true };
    drawer = reduceStudentDrawer(drawer, { type: 'toggle' });
    assert.equal(drawer.open, true);
    drawer = reduceStudentDrawer(drawer, { type: 'close' });
    assert.equal(drawer.open, false);
    drawer = reduceStudentDrawer({ open: true, isMobile: true }, { type: 'viewport', isMobile: false });
    assert.equal(drawer.open, false);
    assert.equal(drawer.isMobile, false);

    assert.equal(studentDrawerKeyAction('Escape'), 'close');
    assert.equal(studentDrawerKeyAction('Tab'), 'trap');
    assert.equal(studentDrawerKeyAction('ArrowDown'), 'move');
    assert.equal(sidebarLinkIndexAfterKey(0, 7, 'ArrowDown'), 1);
    assert.equal(sidebarLinkIndexAfterKey(0, 7, 'ArrowUp'), 6);
    assert.equal(sidebarLinkIndexAfterKey(3, 7, 'Home'), 0);
    assert.equal(sidebarLinkIndexAfterKey(3, 7, 'End'), 6);

    const sidebar = readSrc('components/perfil/ProfileStudentSidebar.js');
    assert.match(sidebar, /☰<\/span> Profile/);
    assert.match(sidebar, /reduceStudentDrawer/);
    assert.match(sidebar, /pointerdown/);
    assert.match(sidebar, /aria-expanded=\{open\}/);
    assert.match(sidebar, /inert=\{isMobile && !open \? true : undefined\}/);
    assert.match(sidebar, /aria-current=\{current \? 'page' : undefined\}/);
  });

  it('wires the seven sections to existing flows and keeps Night mode on this browser', () => {
    const sections = readSrc('components/perfil/ProfileStudentSections.js');
    assert.match(sections, /SKILL_ANALYSIS_COMING_SOON/);
    assert.doesNotMatch(sections, /UserErrorTrackerPanel|error-tracker|streak|achievement/i);
    assert.match(sections, /Danger zone/);
    assert.match(sections, /Invite a friend, get 2 months free/);
    assert.match(sections, /profileHelpHref\(\)/);
    assert.match(sections, /ProfileNightModeSetting/);
    assert.match(sections, /Email notifications/);
    assert.match(sections, /Push reminders/);
    assert.match(sections, /type="email"/);
    assert.doesNotMatch(sections, /Review|Resume/);

    const page = readSrc('app/perfil/page.js');
    assert.match(page, /buildStudentProfileHistoryUrl/);
    assert.match(page, /popstate/);
    assert.match(page, /resolveProfileShell/);
    assert.match(page, /UserErrorTrackerPanel/);
    assert.match(page, /activeTab === 'exam-dates'/);
    assert.match(page, /activeTab === 'private-tutor'/);

    const tracker = readSrc('components/profile/UserErrorTrackerPanel.js');
    assert.match(tracker, /title="Error tracker"/);
    assert.doesNotMatch(tracker, /Skill analysis/);

    const storage = new Map();
    const memory = {
      getItem: (key) => (storage.has(key) ? storage.get(key) : null),
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
      key: (index) => [...storage.keys()][index] ?? null,
      get length() {
        return storage.size;
      },
    };
    const classes = new Set();
    const classList = {
      toggle(name, on) {
        if (on) classes.add(name);
        else classes.delete(name);
      },
      contains: (name) => classes.has(name),
    };
    const previous = {
      window: globalThis.window,
      document: globalThis.document,
      localStorage: globalThis.localStorage,
      sessionStorage: globalThis.sessionStorage,
    };
    globalThis.localStorage = memory;
    globalThis.sessionStorage = memory;
    globalThis.window = {
      localStorage: memory,
      sessionStorage: memory,
      dispatchEvent() {},
    };
    globalThis.document = { documentElement: { classList }, body: { classList } };

    try {
      const enabled = toggleReadingTheme();
      assert.equal(enabled.theme, 'night');
      applyReadingNightBodyClass(enabled.theme);
      assert.equal(classList.contains('reading-night-mode'), true);

      clearAllRoleCaches();
      clearSupabaseAuthStorage();
      storage.set('sb-prod-auth-token', 'session');
      clearSupabaseAuthStorage();

      assert.equal(storage.has('sb-prod-auth-token'), false);
      assert.equal(loadReadingSettings().theme, 'night');
      applyReadingNightBodyClass(loadReadingSettings().theme);
      assert.equal(classList.contains('reading-night-mode'), true);

      const restored = toggleReadingTheme();
      applyReadingNightBodyClass(restored.theme);
      assert.equal(restored.theme, 'normal');
      assert.equal(classList.contains('reading-night-mode'), false);
    } finally {
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.localStorage = previous.localStorage;
      globalThis.sessionStorage = previous.sessionStorage;
    }
  });
});
