import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  computePanelSummary,
  filterPanelPhases,
  filterPanelSubphases,
  filterPanelTasks,
} from '@/lib/staffTaskHelpers.js';

describe('staff task panel summary', () => {
  it('hides completed tasks, phases and subphases from the main panel lists', () => {
    const tasks = [
      { id: '1', estado: 'pendiente' },
      { id: '2', estado: 'completada' },
      { id: '3', estado: 'cancelada' },
    ];
    const phases = [{ id: 'f1', estado: 'completada' }, { id: 'f2', estado: 'en_progreso' }];
    const subphases = [
      { id: 's1', fase_id: 'f2', estado: 'completada' },
      { id: 's2', fase_id: 'f2', estado: 'no_iniciada' },
    ];

    assert.equal(filterPanelTasks(tasks).length, 1);
    assert.equal(filterPanelPhases(phases).length, 1);
    assert.equal(filterPanelSubphases(subphases).length, 1);
  });

  it('counts completed tasks, subphases and phases in the summary card', () => {
    const summary = computePanelSummary(
      [
        { id: '1', estado: 'pendiente' },
        { id: '2', estado: 'en_progreso' },
        { id: '3', estado: 'completada' },
      ],
      [{ id: 'f1', estado: 'completada' }],
      [
        { id: 's1', estado: 'completada' },
        { id: 's2', estado: 'completada' },
        { id: 's3', estado: 'completada' },
      ],
    );

    assert.equal(summary.total, 2);
    assert.equal(summary.completedTasks, 1);
    assert.equal(summary.completedSubphases, 3);
    assert.equal(summary.completedPhases, 1);
    assert.equal(summary.completed, 5);
  });
});
