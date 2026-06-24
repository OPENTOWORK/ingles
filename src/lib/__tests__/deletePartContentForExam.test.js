import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deletePartContentForExam,
  deletePreguntasByIds,
  partNumberFromParteName,
  resolveParteIdsForLevelPart,
} from '@/lib/levelsExamPersist';

test('partNumberFromParteName parses B2 part labels', () => {
  assert.equal(partNumberFromParteName('Parte 5 B2'), 5);
  assert.equal(partNumberFromParteName('Parte 7 B2'), 7);
  assert.equal(partNumberFromParteName('Other'), null);
});

test('resolveParteIdsForLevelPart returns canonical and alias ids', async () => {
  const canonicalId = '11111111-1111-1111-1111-111111111111';
  const aliasId = '22222222-2222-2222-2222-222222222222';

  const db = {
    from(table) {
      const api = {
        select() {
          return api;
        },
        eq(_col, value) {
          if (table === 'levels_partes' && value === 'Parte 5 B2') {
            api._rows = [{ id: canonicalId, nombre_parte: 'Parte 5 B2' }];
          }
          return api;
        },
        ilike(_col, _pattern) {
          if (table === 'levels_partes') {
            api._rows = [
              { id: canonicalId, nombre_parte: 'Parte 5 B2' },
              { id: aliasId, nombre_parte: 'Parte 5 B2 legacy' },
              { id: '33333333-3333-3333-3333-333333333333', nombre_parte: 'Parte 6 B2' },
            ];
          }
          return api;
        },
        then(resolve) {
          resolve({ data: api._rows || [], error: null });
        },
      };
      return api;
    },
  };

  const ids = await resolveParteIdsForLevelPart(db, 'b2', 5);
  assert.deepEqual(ids.sort(), [aliasId, canonicalId].sort());
});

test('deletePreguntasByIds deletes dependent rows', async () => {
  const preguntaA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const deleted = [];

  const db = {
    from(table) {
      let mode = 'select';
      const api = {
        select() {
          mode = 'select';
          return api;
        },
        eq() {
          return api;
        },
        in(col, values) {
          if (mode === 'select' && table === 'levels_puntuaciones') {
            api._rows = [];
          } else if (mode === 'delete') {
            deleted.push({ table, col, values });
          }
          return api;
        },
        delete() {
          mode = 'delete';
          return api;
        },
        then(resolve) {
          if (mode === 'select' && table === 'levels_puntuaciones') {
            resolve({ data: api._rows || [], error: null });
            return;
          }
          resolve({ data: null, error: null });
        },
      };
      return api;
    },
  };

  await deletePreguntasByIds(db, [preguntaA]);

  const deletedIds = deleted
    .filter((d) => d.table === 'levels_preguntas' && d.col === 'id')
    .flatMap((d) => d.values);
  assert.deepEqual(deletedIds, [preguntaA]);
  assert.equal(deleted.some((d) => d.table === 'levels_respuestas'), true);
  assert.equal(deleted.some((d) => d.table === 'levels_respuestas_abiertas'), true);
  assert.equal(deleted.some((d) => d.table === 'levels_preguntas_audios'), true);
});

test('deletePartContentForExam is idempotent when no rows exist', async () => {
  const db = {
    from(table) {
      let mode = 'select';
      const api = {
        select() {
          mode = 'select';
          return api;
        },
        eq() {
          return api;
        },
        ilike() {
          return api;
        },
        in() {
          return api;
        },
        delete() {
          mode = 'delete';
          return api;
        },
        then(resolve) {
          resolve({ data: [], error: null });
        },
      };
      return api;
    },
  };

  await deletePartContentForExam(db, 'examen-1', 'parte-1', { levelSlug: 'b2', partNumber: 5 });
  await deletePartContentForExam(db, 'examen-1', 'parte-1', { levelSlug: 'b2', partNumber: 5 });
});
