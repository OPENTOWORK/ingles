import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canAccessTaskConversation,
  countUnreadTaskMessages,
  isTaskConversationOpen,
  normalizeTaskMessageBody,
} from '@/lib/staffTaskConversation.rules.js';

const TASK = {
  id: 't1',
  asignado_id: 'user-a',
  created_by: 'user-b',
  estado: 'en_progreso',
};

describe('isTaskConversationOpen', () => {
  it('stays open while the task is active', () => {
    assert.equal(isTaskConversationOpen({ estado: 'pendiente' }), true);
    assert.equal(isTaskConversationOpen({ estado: 'en_revision' }), true);
  });

  it('closes when the task is completed or cancelled', () => {
    assert.equal(isTaskConversationOpen({ estado: 'completada' }), false);
    assert.equal(isTaskConversationOpen({ estado: 'cancelada' }), false);
  });
});

describe('canAccessTaskConversation', () => {
  it('lets the assignee, creator and admin-side staff in', () => {
    assert.equal(canAccessTaskConversation({ userId: 'user-a', roleName: 'teacher', task: TASK }), true);
    assert.equal(canAccessTaskConversation({ userId: 'user-b', roleName: 'teacher', task: TASK }), true);
    assert.equal(
      canAccessTaskConversation({ userId: 'user-x', roleName: 'coordinador', task: TASK }),
      true,
    );
    assert.equal(canAccessTaskConversation({ userId: 'user-x', roleName: 'admin', task: TASK }), true);
  });

  it('blocks unrelated staff', () => {
    assert.equal(canAccessTaskConversation({ userId: 'user-x', roleName: 'teacher', task: TASK }), false);
  });
});

describe('normalizeTaskMessageBody', () => {
  it('trims and accepts non-empty text', () => {
    assert.deepEqual(normalizeTaskMessageBody('  Hola  '), { ok: true, body: 'Hola' });
  });

  it('rejects blank or overlong messages', () => {
    assert.equal(normalizeTaskMessageBody('   ').ok, false);
    assert.equal(normalizeTaskMessageBody('a'.repeat(4001)).ok, false);
  });
});

describe('countUnreadTaskMessages', () => {
  it('ignores your own messages and only counts what arrived after last_read_at', () => {
    const messages = [
      { sender_id: 'user-b', created_at: '2026-09-16T10:00:00Z' },
      { sender_id: 'user-a', created_at: '2026-09-16T10:05:00Z' },
      { sender_id: 'user-b', created_at: '2026-09-16T10:10:00Z' },
    ];
    assert.equal(countUnreadTaskMessages(messages, '2026-09-16T10:06:00Z', 'user-a'), 1);
    assert.equal(countUnreadTaskMessages(messages, null, 'user-a'), 2);
  });
});
