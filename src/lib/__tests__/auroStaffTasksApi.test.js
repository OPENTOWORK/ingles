import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import {
  buildStaffTasksAssistantBrief,
  compactTaskForAssistant,
} from '@/lib/staffTasksAuroFormat.js';
import { verifyAuroApiKey } from '@/lib/verifyAuroApiKey.js';

describe('auro staff tasks api', () => {
  const originalKey = process.env.DRALO_AURO_API_KEY;

  beforeEach(() => {
    process.env.DRALO_AURO_API_KEY = 'test-auro-secret';
  });

  afterEach(() => {
    process.env.DRALO_AURO_API_KEY = originalKey;
  });

  it('accepts bearer and x-auro-api-key headers', () => {
    const bearerReq = {
      headers: {
        get(name) {
          if (name === 'authorization') return 'Bearer test-auro-secret';
          return '';
        },
      },
    };
    const headerReq = {
      headers: {
        get(name) {
          if (name === 'x-auro-api-key') return 'test-auro-secret';
          return '';
        },
      },
    };

    assert.equal(verifyAuroApiKey(bearerReq).ok, true);
    assert.equal(verifyAuroApiKey(headerReq).ok, true);
    assert.equal(verifyAuroApiKey({ headers: { get: () => '' } }).status, 401);
  });

  it('builds a readable brief with pending tasks', () => {
    const brief = buildStaffTasksAssistantBrief({
      summary: { total: 2, pending: 1, inProgress: 1, overdue: 0, blocked: 0, completed: 3, completedTasks: 1, completedSubphases: 1, completedPhases: 1 },
      pendingTasks: [
        { titulo: 'Revisar exámenes', asignado: 'Ana', fecha_limite: '2026-09-15T00:00:00.000Z' },
      ],
      overdueTasks: [],
      completedTasks: [],
      phases: [{ id: 'f1' }],
      subphases: [{ id: 's1' }, { id: 's2' }],
    });

    assert.match(brief, /Tareas pendientes activas/);
    assert.match(brief, /Revisar exámenes/);
    assert.match(brief, /Subfases visibles: 2/);
  });

  it('compacts enriched tasks for assistant consumption', () => {
    const compact = compactTaskForAssistant({
      id: 't1',
      titulo: 'Generar contenido',
      estado: 'pendiente',
      displayEstado: 'vencida',
      prioridad: 'media',
      fecha_limite: '2026-09-01T00:00:00.000Z',
      asignado: { nombre: 'Luis' },
      fase: { nombre: 'Marketing' },
      subfase: { nombre: 'Blog' },
      isOverdue: true,
      timeRemaining: 'Vencida hace 11 días',
      cumplimiento: 'vencida',
    });

    assert.equal(compact.asignado, 'Luis');
    assert.equal(compact.fase, 'Marketing');
    assert.equal(compact.isOverdue, true);
  });
});
