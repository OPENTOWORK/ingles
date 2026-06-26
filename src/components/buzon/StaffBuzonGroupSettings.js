'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getDisplayName, getStaffRoleLabel } from '@/utils/staffBuzon';
import { buzonApiRequest } from '@/lib/staffBuzonClient';
import styles from './StaffBuzonPanel.module.css';

function extractRoleName(userRow) {
  const embedded = userRow?.Usuarios_y_Perfil_roles;
  if (Array.isArray(embedded)) return embedded[0]?.nombre || '';
  return embedded?.nombre || '';
}

export default function StaffBuzonGroupSettings({
  group,
  staffUsers,
  currentUserId,
  token,
  onClose,
  onUpdated,
  onDeleted,
  onLeft,
}) {
  const isCreator = group.created_by === currentUserId;
  const [name, setName] = useState(group.name || '');
  const [description, setDescription] = useState(group.description || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addMemberId, setAddMemberId] = useState('');

  const staffById = useMemo(() => {
    const map = new Map();
    staffUsers.forEach((user) => map.set(user.id, user));
    return map;
  }, [staffUsers]);

  const members = useMemo(
    () =>
      (group.member_ids || [])
        .map((id) => staffById.get(id))
        .filter(Boolean)
        .sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b), 'es')),
    [group.member_ids, staffById],
  );

  const candidatesToAdd = useMemo(
    () =>
      staffUsers.filter(
        (user) => user.id !== currentUserId && !(group.member_ids || []).includes(user.id),
      ),
    [staffUsers, group.member_ids, currentUserId],
  );

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isCreator || saving) return;
    setSaving(true);
    try {
      const payload = await buzonApiRequest(`/api/buzon/groups/${group.id}`, {
        method: 'PATCH',
        token,
        body: { name: name.trim(), description: description.trim() || null },
      });
      onUpdated(payload.group);
      toast.success('Grupo actualizado');
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const payload = await buzonApiRequest(`/api/buzon/groups/${group.id}/members`, {
        method: 'DELETE',
        token,
        body: { user_id: userId },
      });
      if (payload.left) {
        onLeft();
        toast.success('Has abandonado el grupo');
        return;
      }
      onUpdated(payload.group);
      toast.success('Miembro expulsado');
    } catch (error) {
      toast.error(error.message || 'No se pudo quitar al miembro.');
    }
  };

  const handleAddMember = async () => {
    if (!addMemberId) return;
    try {
      const payload = await buzonApiRequest(`/api/buzon/groups/${group.id}/members`, {
        method: 'POST',
        token,
        body: { user_id: addMemberId },
      });
      setAddMemberId('');
      onUpdated(payload.group);
      toast.success('Miembro añadido');
    } catch (error) {
      toast.error(error.message || 'No se pudo añadir al miembro.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!isCreator || deleting) return;
    if (!window.confirm(`¿Eliminar el grupo «${group.name}»? Se perderán sus mensajes.`)) return;
    setDeleting(true);
    try {
      await buzonApiRequest(`/api/buzon/groups/${group.id}`, {
        method: 'DELETE',
        token,
      });
      onDeleted(group.id);
      toast.success('Grupo eliminado');
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el grupo.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={`${styles.modal} ${styles.groupSettingsModal}`}
        role="dialog"
        aria-labelledby="group-settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeaderRow}>
          <h3 id="group-settings-title">Configuración del grupo</h3>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {isCreator ? (
          <form onSubmit={handleSave}>
            <label className={styles.modalLabel} htmlFor="group-settings-name">
              Nombre
            </label>
            <input
              id="group-settings-name"
              type="text"
              className={styles.modalInput}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
            />

            <label className={styles.modalLabel} htmlFor="group-settings-description">
              Descripción
            </label>
            <textarea
              id="group-settings-description"
              className={styles.modalTextarea}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Para qué sirve este grupo…"
              maxLength={500}
              rows={3}
            />

            <div className={styles.modalActions}>
              <button type="submit" disabled={saving || !name.trim()}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.groupReadonlyMeta}>
            <strong>{group.name}</strong>
            {group.description ? <p>{group.description}</p> : null}
          </div>
        )}

        <p className={styles.modalLabel}>Miembros ({members.length})</p>
        <ul className={styles.memberPicker}>
          {members.map((user) => {
            const canRemove =
              (isCreator && user.id !== currentUserId) ||
              (!isCreator && user.id === currentUserId);
            return (
              <li key={user.id}>
                <div className={styles.memberRow}>
                  <span>
                    <strong>{getDisplayName(user)}</strong>
                    <span className={styles.contactMeta}>
                      {getStaffRoleLabel(extractRoleName(user))}
                      {user.id === group.created_by ? ' · Creador' : ''}
                    </span>
                  </span>
                  {canRemove ? (
                    <button
                      type="button"
                      className={styles.dangerBtn}
                      onClick={() => void handleRemoveMember(user.id)}
                    >
                      {user.id === currentUserId ? 'Salir' : 'Expulsar'}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        {isCreator && candidatesToAdd.length > 0 ? (
          <div className={styles.addMemberRow}>
            <select
              className={styles.presenceSelect}
              value={addMemberId}
              onChange={(event) => setAddMemberId(event.target.value)}
              aria-label="Añadir miembro"
            >
              <option value="">Añadir miembro…</option>
              {candidatesToAdd.map((user) => (
                <option key={user.id} value={user.id}>
                  {getDisplayName(user)} ({getStaffRoleLabel(extractRoleName(user))})
                </option>
              ))}
            </select>
            <button type="button" onClick={() => void handleAddMember()} disabled={!addMemberId}>
              Añadir
            </button>
          </div>
        ) : null}

        {isCreator ? (
          <div className={styles.dangerZone}>
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={() => void handleDeleteGroup()}
              disabled={deleting}
            >
              {deleting ? 'Eliminando…' : 'Eliminar grupo'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
