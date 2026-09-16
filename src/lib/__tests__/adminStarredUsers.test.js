import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isStarredTeamMember, resolveStarredTeamUserIds } from '@/lib/adminStarredUsers.js';

describe('isStarredTeamMember', () => {
  const starred = new Set(['abc-123']);

  it('coerces ids to string before comparing', () => {
    assert.equal(isStarredTeamMember(starred, 'abc-123'), true);
    assert.equal(isStarredTeamMember(starred, 'other'), false);
    assert.equal(isStarredTeamMember(null, 'abc-123'), false);
  });
});

describe('resolveStarredTeamUserIds', () => {
  it('reads starred ids from Usuarios_y_Perfil_users and normalizes them', async () => {
    const db = {
      from(table) {
        return {
          select() {
            return this;
          },
          eq(column, value) {
            assert.equal(column, 'destacado_equipo');
            assert.equal(value, true);
            if (table === 'Usuarios_y_Perfil_users') {
              return Promise.resolve({
                data: [{ id: '11111111-1111-1111-1111-111111111111' }],
                error: null,
              });
            }
            return Promise.resolve({ data: null, error: { code: '42P01' } });
          },
        };
      },
    };

    const ids = await resolveStarredTeamUserIds(db);
    assert.equal(ids.size, 1);
    assert.equal(ids.has('11111111-1111-1111-1111-111111111111'), true);
  });
});
