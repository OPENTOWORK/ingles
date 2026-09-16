import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildStudyFocusByUser,
  classifyStudyPath,
  summarizeStudyFocus,
} from '@/lib/studyFocus.js';

describe('classifyStudyPath', () => {
  it('marks learning routes as study time', () => {
    assert.deepEqual(classifyStudyPath('/niveles/b2/reading'), {
      area: 'Exam practice',
      isStudy: true,
    });
    assert.deepEqual(classifyStudyPath('/exam-practice/b2/'), {
      area: 'Exam practice',
      isStudy: true,
    });
    assert.equal(classifyStudyPath('/teoria/writing').isStudy, true);
    assert.equal(classifyStudyPath('/speaking-lab/b2').isStudy, true);
  });

  it('marks platform navigation as non-study time', () => {
    assert.deepEqual(classifyStudyPath('/perfil'), { area: 'Perfil', isStudy: false });
    assert.equal(classifyStudyPath('/admin/usuarios/123').isStudy, false);
    assert.equal(classifyStudyPath('/blog/como-aprobar-b2').isStudy, false);
    assert.deepEqual(classifyStudyPath('/'), { area: 'Inicio', isStudy: false });
  });

  it('does not treat a prefix collision as a match', () => {
    assert.equal(classifyStudyPath('/trainingzone').area, 'Otras páginas');
  });
});

describe('buildStudyFocusByUser', () => {
  const pageViews = [
    {
      user_id: 'u1',
      path: '/niveles/b2/reading',
      visited_at: '2026-09-10T10:00:00Z',
      duration_seconds: 600,
    },
    {
      user_id: 'u1',
      path: '/perfil',
      visited_at: '2026-09-10T10:15:00Z',
      duration_seconds: 120,
    },
    {
      user_id: 'u2',
      path: '/teoria/writing',
      visited_at: '2026-09-10T11:00:00Z',
      duration_seconds: 300,
    },
  ];

  const sessions = [
    { user_id: 'u1', started_at: '2026-09-10T10:00:00Z', duration_seconds: 1200 },
    { user_id: 'u2', started_at: '2026-09-10T11:00:00Z', duration_seconds: 300 },
  ];

  it('splits study, browsing and unattributed time per user', () => {
    const rows = buildStudyFocusByUser(pageViews, sessions);
    const u1 = rows.find((row) => row.userId === 'u1');

    assert.equal(u1.studySeconds, 600);
    assert.equal(u1.browsingSeconds, 120);
    // 1200 s conectado - 720 s con página activa = 480 s sin actividad atribuible.
    assert.equal(u1.unattributedSeconds, 480);
    assert.equal(u1.focusRatio, 50);
    assert.equal(u1.sessionCount, 1);
  });

  it('never reports negative unattributed time', () => {
    const rows = buildStudyFocusByUser(
      [
        {
          user_id: 'u3',
          path: '/niveles/b2',
          visited_at: '2026-09-10T10:00:00Z',
          duration_seconds: 900,
        },
      ],
      [{ user_id: 'u3', started_at: '2026-09-10T10:00:00Z', duration_seconds: 300 }],
    );

    assert.equal(rows[0].unattributedSeconds, 0);
    assert.equal(rows[0].focusRatio, 100);
  });

  it('honours the date range filter', () => {
    const rows = buildStudyFocusByUser(pageViews, sessions, {
      startDate: '2026-09-11',
      endDate: '2026-09-12',
    });
    assert.equal(rows.length, 0);
  });

  it('ranks the areas where each student spent most time', () => {
    const rows = buildStudyFocusByUser(pageViews, sessions);
    const u1 = rows.find((row) => row.userId === 'u1');

    assert.equal(u1.topAreas[0].area, 'Exam practice');
    assert.equal(u1.topAreas[0].isStudy, true);
    assert.equal(u1.topAreas[1].area, 'Perfil');
    assert.equal(u1.topAreas[1].isStudy, false);
  });
});

describe('summarizeStudyFocus', () => {
  it('aggregates totals across students', () => {
    const rows = buildStudyFocusByUser(
      [
        {
          user_id: 'u1',
          path: '/niveles/b2',
          visited_at: '2026-09-10T10:00:00Z',
          duration_seconds: 600,
        },
        {
          user_id: 'u2',
          path: '/perfil',
          visited_at: '2026-09-10T10:00:00Z',
          duration_seconds: 400,
        },
      ],
      [
        { user_id: 'u1', started_at: '2026-09-10T10:00:00Z', duration_seconds: 600 },
        { user_id: 'u2', started_at: '2026-09-10T10:00:00Z', duration_seconds: 400 },
      ],
    );

    const summary = summarizeStudyFocus(rows);
    assert.equal(summary.trackedUsers, 2);
    assert.equal(summary.studentsWithStudy, 1);
    assert.equal(summary.studySeconds, 600);
    assert.equal(summary.browsingSeconds, 400);
    assert.equal(summary.focusRatio, 60);
  });

  it('returns zeroed totals with no data', () => {
    const summary = summarizeStudyFocus([]);
    assert.equal(summary.trackedUsers, 0);
    assert.equal(summary.focusRatio, 0);
    assert.equal(summary.studyLabel, '0 s');
  });
});
