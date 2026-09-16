import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  accumulateSession,
  buildFactualSummary,
  buildStudyReport,
  buildStudySummaryPrompt,
  buildTrackRecord,
  computeStudyStreak,
  normalizeFocusDelta,
} from '@/lib/studySession.js';

/** Fecha local a las 10:00 con un desplazamiento de días respecto a `now`. */
function daysAgo(now, days) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

describe('normalizeFocusDelta', () => {
  it('caps each counter so a tampered client cannot inflate the session', () => {
    const delta = normalizeFocusDelta({
      focusSeconds: 99999,
      awaySeconds: -40,
      idleSeconds: 'abc',
      awayEvents: 5000,
      areas: { 'Exam practice': 99999 },
    });

    assert.equal(delta.focusSeconds, 300);
    assert.equal(delta.awaySeconds, 0);
    assert.equal(delta.idleSeconds, 0);
    assert.equal(delta.awayEvents, 100);
    assert.equal(delta.areas['Exam practice'], 300);
  });

  it('drops malformed area payloads', () => {
    assert.deepEqual(normalizeFocusDelta({ areas: ['nope'] }).areas, {});
    assert.deepEqual(normalizeFocusDelta({ areas: { ['x'.repeat(61)]: 30 } }).areas, {});
  });
});

describe('accumulateSession', () => {
  it('adds deltas and keeps the longest away streak', () => {
    const first = accumulateSession(
      {},
      { focusSeconds: 30, awaySeconds: 0, areas: { Training: 30 } },
    );
    const second = accumulateSession(first, {
      focusSeconds: 20,
      awaySeconds: 10,
      awayEvents: 1,
      longestAwaySeconds: 10,
      areas: { Training: 20, 'Exam practice': 5 },
    });
    const third = accumulateSession(second, {
      awaySeconds: 4,
      awayEvents: 1,
      longestAwaySeconds: 4,
    });

    assert.equal(third.focus_seconds, 50);
    assert.equal(third.away_seconds, 14);
    assert.equal(third.away_count, 2);
    // La racha más larga no se sobrescribe con una posterior más corta.
    assert.equal(third.longest_away_seconds, 10);
    assert.deepEqual(third.areas, { Training: 50, 'Exam practice': 5 });
  });
});

describe('buildStudyReport', () => {
  it('derives ratio, ranking and quality band', () => {
    const report = buildStudyReport({
      id: 's1',
      focus_seconds: 2700,
      away_seconds: 200,
      idle_seconds: 100,
      away_count: 4,
      longest_away_seconds: 120,
      areas: { 'Exam practice': 1800, Training: 900 },
    });

    assert.equal(report.totalSeconds, 3000);
    assert.equal(report.focusRatio, 90);
    assert.equal(report.quality.key, 'excelente');
    assert.equal(report.topArea, 'Exam practice');
    assert.equal(report.areas.length, 2);
  });

  it('bands a distracted session as dispersa', () => {
    const report = buildStudyReport({ focus_seconds: 300, away_seconds: 900 });
    assert.equal(report.focusRatio, 25);
    assert.equal(report.quality.key, 'dispersa');
  });

  it('handles an empty session without dividing by zero', () => {
    const report = buildStudyReport({});
    assert.equal(report.focusRatio, 0);
    assert.equal(report.totalSeconds, 0);
    assert.deepEqual(report.areas, []);
  });
});

describe('buildFactualSummary', () => {
  it('states when the student never left the page', () => {
    const summary = buildFactualSummary(buildStudyReport({ focus_seconds: 600 }));
    assert.match(summary, /No salió de la página/);
  });

  it('reports the number of exits and the longest pause', () => {
    const summary = buildFactualSummary(
      buildStudyReport({
        focus_seconds: 600,
        away_seconds: 180,
        away_count: 3,
        longest_away_seconds: 120,
      }),
    );
    assert.match(summary, /3 veces/);
    assert.match(summary, /pausa más larga: 2 min/);
  });
});

describe('computeStudyStreak', () => {
  const now = new Date('2026-09-16T20:00:00');

  it('counts consecutive days ending today', () => {
    const sessions = [0, 1, 2].map((offset) => ({ started_at: daysAgo(now, offset) }));
    assert.equal(computeStudyStreak(sessions, now), 3);
  });

  it('keeps the streak alive when today has no session yet', () => {
    const sessions = [1, 2].map((offset) => ({ started_at: daysAgo(now, offset) }));
    assert.equal(computeStudyStreak(sessions, now), 2);
  });

  it('breaks the streak after two missed days', () => {
    const sessions = [2, 3].map((offset) => ({ started_at: daysAgo(now, offset) }));
    assert.equal(computeStudyStreak(sessions, now), 0);
  });

  it('ignores duplicated sessions on the same day', () => {
    const sessions = [
      { started_at: daysAgo(now, 0) },
      { started_at: daysAgo(now, 0) },
      { started_at: daysAgo(now, 1) },
    ];
    assert.equal(computeStudyStreak(sessions, now), 2);
  });

  it('returns zero with no sessions', () => {
    assert.equal(computeStudyStreak([], now), 0);
  });
});

describe('buildTrackRecord', () => {
  it('aggregates focus time, average ratio and streak', () => {
    const now = new Date('2026-09-16T20:00:00');
    const record = buildTrackRecord(
      [
        {
          started_at: daysAgo(now, 0),
          focus_seconds: 1800,
          away_seconds: 200,
          resumen: 'Buen ritmo.',
          resumen_bullets: { source: 'ai' },
        },
        { started_at: daysAgo(now, 1), focus_seconds: 600, away_seconds: 600 },
      ],
      now,
    );

    assert.equal(record.totals.sessionCount, 2);
    assert.equal(record.totals.focusSeconds, 2400);
    assert.equal(record.totals.streakDays, 2);
    assert.equal(record.totals.bestFocusRatio, 90);
    assert.equal(record.totals.avgFocusRatio, 70);
    assert.equal(record.entries[0].resumen, 'Buen ritmo.');
    assert.equal(record.entries[0].resumenSource, 'ai');
  });

  it('returns empty totals with no sessions', () => {
    const record = buildTrackRecord([]);
    assert.deepEqual(record.entries, []);
    assert.equal(record.totals.avgFocusRatio, 0);
    assert.equal(record.totals.streakDays, 0);
  });
});

describe('buildStudySummaryPrompt', () => {
  it('forbids inventing external browsing in the instructions', () => {
    const prompt = buildStudySummaryPrompt(buildStudyReport({ focus_seconds: 600 }), {
      studentName: 'Ana',
    });
    assert.match(prompt, /Alumno: Ana\./);
    assert.match(prompt, /No menciones a qué otras webs/);
  });
});
