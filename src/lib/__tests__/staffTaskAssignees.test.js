import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildAssigneeTaskChart,
  formatTaskAssigneeLabel,
  parseTaskAssigneeIds,
  taskIncludesAssignee,
} from '@/lib/staffTaskAssignees';
import { filterTasksClientSide, validateTaskPayload } from '@/lib/staffTaskHelpers';

const ANA = '11111111-1111-4111-8111-111111111111';
const LUIS = '22222222-2222-4222-8222-222222222222';

describe('parseTaskAssigneeIds', () => {
  it('acepta varias personas y quita duplicados', () => {
    assert.deepEqual(parseTaskAssigneeIds({ asignados_ids: [ANA, LUIS, ANA, 'no-es-uuid'] }), [ANA, LUIS]);
  });

  it('usa la persona única si no llega la lista', () => {
    assert.deepEqual(parseTaskAssigneeIds({ asignado_id: LUIS, asignados_ids: [] }), [LUIS]);
  });
});

describe('validateTaskPayload', () => {
  it('exige al menos una persona', () => {
    const result = validateTaskPayload({ titulo: 'Revisar', asignados_ids: [] });
    assert.equal(result.ok, false);
  });

  it('guarda la primera persona también en el campo antiguo', () => {
    const result = validateTaskPayload({
      titulo: 'Revisar',
      asignados_ids: [LUIS, ANA],
    });
    assert.equal(result.ok, true);
    assert.equal(result.data.asignado_id, LUIS);
    assert.deepEqual(result.data.asignados_ids, [LUIS, ANA]);
  });
});

describe('filterTasksClientSide', () => {
  it('encuentra la tarea si la persona está entre las asignadas', () => {
    const tasks = [{ titulo: 'A', asignado_id: ANA, asignados_ids: [ANA, LUIS], estado: 'pendiente' }];
    assert.equal(filterTasksClientSide(tasks, { assigneeId: LUIS }).length, 1);
    assert.equal(taskIncludesAssignee(tasks[0], ANA), true);
  });
});

describe('formatTaskAssigneeLabel', () => {
  it('junta los nombres', () => {
    const label = formatTaskAssigneeLabel({
      asignados: [
        { nombre: 'Ana' },
        { nombre: 'Luis' },
      ],
    });
    assert.equal(label, 'Ana, Luis');
  });
});

describe('buildAssigneeTaskChart', () => {
  it('cuenta la tarea para cada persona', () => {
    const rows = buildAssigneeTaskChart([
      {
        estado: 'pendiente',
        asignados: [
          { id: ANA, nombre: 'Ana' },
          { id: LUIS, nombre: 'Luis' },
        ],
      },
    ]);
    assert.deepEqual(
      rows.map((row) => row.name).sort(),
      ['Ana', 'Luis'],
    );
    assert.equal(rows.every((row) => row.pendientes === 1), true);
  });
});
