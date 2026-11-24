import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FUTURE_PROJECTS,
  PROJECT_DELIVERIES,
  formatRoadmapDate,
  projectCalendarEvents,
  roadmapPosition,
} from '@/lib/projectRoadmap';

test('each November project keeps its last delivery date', () => {
  const byId = Object.fromEntries(PROJECT_DELIVERIES.map((project) => [project.id, project.date]));
  assert.deepEqual(byId, {
    listening: '2026-11-11',
    'error-tracking': '2026-11-22',
    'ruoe-b1': '2026-11-30',
    placement: '2026-11-30',
    'exam-strategies': '2026-12-16',
    redes: '2027-01-08',
  });
  assert.equal(formatRoadmapDate('2027-01-08'), '8 ene 2027');
});

test('markers stay in order inside the delivery window', () => {
  const positions = PROJECT_DELIVERIES.map((project) => roadmapPosition(project.date));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.ok(positions[0] > 0);
  assert.equal(positions.at(-1), 100);
});

test('dated projects land on the marketing calendar, including orientative ones', () => {
  const in2026 = projectCalendarEvents(2026);
  const tracker = in2026.find((event) => event.name === 'Error Tracking');
  assert.equal(tracker.month, 11);
  assert.equal(tracker.day, 22);
  assert.equal(tracker.kind, 'Fijada');
  assert.equal(tracker.category, 'proyecto');
  assert.equal(in2026.filter((event) => event.day === 30 && event.month === 11).length, 2);
  const strategies = in2026.find((event) => event.name === 'Exam Strategies');
  assert.equal(strategies.kind, 'Orientativa');
  assert.equal(strategies.day, 16);
  assert.equal(projectCalendarEvents(2027).some((event) => event.name === 'Contenido Redes'), true);
  assert.equal(in2026.some((event) => event.name === 'Contenido Redes'), false);
});

test('the future vision includes the B2 guide and the guides for the other levels', () => {
  const names = FUTURE_PROJECTS.map((project) => project.name);
  assert.ok(names.includes('Guía B2'));
  assert.ok(names.includes('Guías A2, B1, C1 y C2'));
  assert.equal(new Set(names).size, names.length);
});
