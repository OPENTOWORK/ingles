import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildPanelLookupMaps,
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
      {
        id: '4',
        estado: 'pendiente',
        subfase_id: 's1',
        fase_id: 'f2',
      },
    ];
    const { phasesById, subphasesById } = buildPanelLookupMaps(
      [{ id: 'f2', estado: 'en_progreso' }],
      [{ id: 's1', fase_id: 'f2', estado: 'completada' }],
    );
    const phases = [{ id: 'f1', estado: 'completada' }, { id: 'f2', estado: 'en_progreso' }];
    const subphases = [
      { id: 's1', fase_id: 'f2', estado: 'completada' },
      { id: 's2', fase_id: 'f2', estado: 'no_iniciada' },
    ];

    assert.equal(filterPanelTasks(tasks, '', '', phasesById, subphasesById).length, 1);
    assert.deepEqual(
      filterPanelTasks(tasks, 'completada', '', phasesById, subphasesById).map((task) => task.id),
      ['2', '4'],
    );
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

    const inheritedSummary = computePanelSummary(
      [
        { id: '1', estado: 'pendiente', subfase_id: 's1' },
        { id: '2', estado: 'en_progreso', subfase_id: 's1' },
      ],
      [],
      [{ id: 's1', estado: 'completada' }],
    );
    assert.equal(inheritedSummary.total, 0);
    assert.equal(inheritedSummary.completedTasks, 2);
    assert.equal(inheritedSummary.completed, 3);
    assert.equal(summary.completedSubphases, 3);
    assert.equal(summary.completedPhases, 1);
    assert.equal(summary.completed, 5);
  });

  it('shows completed phases when the completada metric filter is active', () => {
    const phases = [
      { id: 'f1', estado: 'completada' },
      { id: 'f2', estado: 'en_progreso' },
    ];
    assert.equal(filterPanelPhases(phases).length, 1);
    assert.equal(filterPanelPhases(phases, 'completada').length, 1);
    assert.deepEqual(
      filterPanelPhases(phases, 'completada').map((phase) => phase.id),
      ['f1'],
    );
  });

  it('maps pendiente tasks to no_iniciada phases and subphases', () => {
    const phases = [
      { id: 'f1', estado: 'no_iniciada' },
      { id: 'f2', estado: 'en_progreso' },
    ];
    const subphases = [
      { id: 's1', fase_id: 'f1', estado: 'no_iniciada' },
      { id: 's2', fase_id: 'f2', estado: 'en_progreso' },
    ];
    assert.deepEqual(
      filterPanelPhases(phases, 'pendiente').map((phase) => phase.id),
      ['f1'],
    );
    assert.deepEqual(
      filterPanelSubphases(subphases, '', 'pendiente').map((subphase) => subphase.id),
      ['s1'],
    );
  });

  it('hides overdue tasks that belong to completed subphases from the vencida filter', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const { phasesById, subphasesById } = buildPanelLookupMaps(
      [],
      [{ id: 's1', estado: 'en_progreso' }],
    );
    const tasks = [
      {
        id: 't1',
        estado: 'pendiente',
        fecha_limite: past,
        subfase_id: 's1',
        subfase: { id: 's1', estado: 'completada' },
      },
      {
        id: 't2',
        estado: 'pendiente',
        fecha_limite: past,
        subfase_id: 's2',
        subfase: { id: 's2', estado: 'en_progreso' },
      },
    ];

    assert.deepEqual(
      filterPanelTasks(tasks, 'vencida', '', phasesById, subphasesById).map((task) => task.id),
      ['t2'],
    );
    assert.equal(filterPanelTasks(tasks, '', '', phasesById, subphasesById).length, 1);
  });

  it('prefers nested task relations over stale panel lookup maps', () => {
    const { phasesById, subphasesById } = buildPanelLookupMaps(
      [{ id: 'f1', estado: 'en_progreso' }],
      [{ id: 's1', fase_id: 'f1', estado: 'en_progreso' }],
    );
    const tasks = [
      {
        id: 't1',
        estado: 'pendiente',
        fase_id: 'f1',
        subfase_id: 's1',
        fase: { id: 'f1', estado: 'completada' },
        subfase: { id: 's1', estado: 'completada' },
      },
    ];

    assert.equal(filterPanelTasks(tasks, '', '', phasesById, subphasesById).length, 0);
    assert.equal(computePanelSummary(tasks, [], []).completedTasks, 1);
  });

  it('filters overdue tasks and phases with overdue children', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const tasks = [
      { id: 't1', estado: 'pendiente', fecha_limite: past, fase_id: 'f2' },
      { id: 't2', estado: 'completada', fecha_limite: past, fase_id: 'f1' },
    ];
    const phases = [
      { id: 'f1', estado: 'en_progreso', fecha_limite: past },
      { id: 'f2', estado: 'en_progreso' },
    ];

    const { phasesById, subphasesById } = buildPanelLookupMaps(phases, []);
    assert.deepEqual(
      filterPanelTasks(tasks, 'vencida', '', phasesById, subphasesById).map((task) => task.id),
      ['t1'],
    );
    assert.deepEqual(
      filterPanelPhases(phases, 'vencida', tasks).map((phase) => phase.id).sort(),
      ['f1', 'f2'],
    );
  });

  it('filters tasks completed on time for the compliance metric', () => {
    const tasks = [
      {
        id: 't1',
        estado: 'completada',
        fecha_limite: '2026-12-01T00:00:00.000Z',
        completada_at: '2026-11-20T00:00:00.000Z',
      },
      {
        id: 't2',
        estado: 'completada',
        fecha_limite: '2026-11-01T00:00:00.000Z',
        completada_at: '2026-11-20T00:00:00.000Z',
      },
    ];

    assert.deepEqual(
      filterPanelTasks(tasks, 'completada', 'a_tiempo').map((task) => task.id),
      ['t1'],
    );
  });
});
