import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isRoleConfirmedForSession,
  nextRoleConfirmation,
  roleFromConfirmedCache,
  shouldCacheResolvedRole,
} from '@/lib/userRoleResolution.js';

const sessionFor = (id) => ({ user: { id } });

describe('userRoleResolution', () => {
  it('no confirma sin sesión ni mientras la resolución está pendiente', () => {
    assert.equal(isRoleConfirmedForSession(null, null), false);
    assert.equal(isRoleConfirmedForSession(null, 'user-a'), false);
    assert.equal(isRoleConfirmedForSession(sessionFor('user-a'), null), false);
  });

  it('confirma solo para el usuario de la sesión actual', () => {
    assert.equal(isRoleConfirmedForSession(sessionFor('user-a'), 'user-a'), true);
    assert.equal(isRoleConfirmedForSession(sessionFor('user-b'), 'user-a'), false);
  });

  it('no toma un respaldo tras error como rol confirmado', () => {
    assert.deepEqual(
      nextRoleConfirmation({ currentUserId: 'user-a', resolvedForUserId: 'user-a', confirmed: false }),
      { apply: true, confirmedForUserId: null },
    );
  });

  it('aplica la lectura confirmada del usuario vigente', () => {
    assert.deepEqual(
      nextRoleConfirmation({ currentUserId: 'user-a', resolvedForUserId: 'user-a', confirmed: true }),
      { apply: true, confirmedForUserId: 'user-a' },
    );
  });

  it('descarta la respuesta pendiente del usuario anterior tras cambiar de usuario', () => {
    assert.deepEqual(
      nextRoleConfirmation({ currentUserId: 'user-b', resolvedForUserId: 'user-a', confirmed: true }),
      { apply: false, confirmedForUserId: null },
    );
  });

  it('descarta la respuesta pendiente tras cerrar sesión', () => {
    assert.deepEqual(
      nextRoleConfirmation({ currentUserId: null, resolvedForUserId: 'user-a', confirmed: true }),
      { apply: false, confirmedForUserId: null },
    );
  });

  it('una confirmación anterior no sirve para el usuario nuevo', () => {
    const previous = nextRoleConfirmation({
      currentUserId: 'user-a',
      resolvedForUserId: 'user-a',
      confirmed: true,
    });
    assert.equal(isRoleConfirmedForSession(sessionFor('user-b'), previous.confirmedForUserId), false);
  });

  it('una entrada antigua sin confirmed no impide la lectura real', () => {
    assert.equal(roleFromConfirmedCache({ role: 'student', t: Date.now() }), null);
  });

  it('un respaldo tras error no se reutiliza ni se guarda', () => {
    const fallback = { role: 'student', confirmed: false };
    assert.equal(roleFromConfirmedCache(fallback), null);
    assert.equal(shouldCacheResolvedRole(fallback), false);
  });

  it('la lectura confirmada posterior sí cierra la resolución de ese usuario', () => {
    const resolved = { role: 'student', confirmed: true };
    assert.equal(shouldCacheResolvedRole(resolved), true);
    assert.deepEqual(roleFromConfirmedCache(resolved), { role: 'student', confirmed: true });
    assert.equal(
      isRoleConfirmedForSession(sessionFor('user-b'), 'user-a'),
      false,
    );
  });
});
