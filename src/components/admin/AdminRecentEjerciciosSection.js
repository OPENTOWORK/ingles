'use client';

import { useMemo, useState } from 'react';
import AdminRowActionsMenu from '@/components/admin/AdminRowActionsMenu';
import styles from './AdminEjerciciosPanel.module.css';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function filterRows(rows, filters) {
  const q = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.group && (row.theoryPart?.group || 'Sin vincular') !== filters.group) return false;
    if (filters.partHref && row.theoryPart?.href !== filters.partHref) return false;
    if (filters.nivelId && row.id_nivel !== filters.nivelId) return false;
    if (filters.skillId && row.id_skills !== filters.skillId) return false;
    if (filters.tipoId && row.id_tipo_preguntas !== filters.tipoId) return false;
    if (filters.answerMode && row.answerMode !== filters.answerMode) return false;
    if (!q) return true;
    const hay = [
      row.pregunta,
      row.descripcion,
      row.theoryPart?.label,
      row.theoryPart?.group,
      row.nivel?.nombre,
      row.skill?.nombre,
      row.tipo?.Nombre,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

function groupFilteredRows(rows) {
  const byGroup = new Map();
  for (const row of rows) {
    const groupName = row.theoryPart?.group || 'Sin vincular';
    if (!byGroup.has(groupName)) byGroup.set(groupName, new Map());
    const parts = byGroup.get(groupName);
    const href = row.theoryPart?.href || '__none__';
    if (!parts.has(href)) {
      parts.set(href, {
        href,
        label: row.theoryPart?.label || 'Sin tema asignado',
        rows: [],
      });
    }
    parts.get(href).rows.push(row);
  }
  return [...byGroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([groupName, partsMap]) => ({
      groupName,
      parts: [...partsMap.values()].sort((a, b) => a.label.localeCompare(b.label, 'es')),
    }));
}

function ExerciseRow({
  row,
  selected,
  onToggleSelect,
  rowBusyId,
  savingEdit,
  onEdit,
  onDelete,
}) {
  return (
    <tr className={selected ? styles.rowSelected : undefined}>
      <td className={styles.colCheck}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(row.id)}
          aria-label={`Seleccionar ejercicio ${row.theoryPart?.label || row.id}`}
        />
      </td>
      <td>{formatDate(row.created_at)}</td>
      <td>{row.nivel?.nombre ? String(row.nivel.nombre).toUpperCase() : '—'}</td>
      <td>{row.skill?.nombre || '—'}</td>
      <td className={styles.meta}>
        {row.tipo?.Nombre || '—'}
        {row.tipo?.Descripcion ? (
          <>
            <br />
            <span className={styles.meta}>{row.tipo.Descripcion}</span>
          </>
        ) : null}
      </td>
      <td>
        <span
          className={`${styles.badge} ${
            row.answerMode === 'open' ? styles.badgeOpen : styles.badgeClosed
          }`}
        >
          {row.answerMode === 'open' ? 'Abierta' : 'Cerrada'}
        </span>
      </td>
      <td className={styles.preguntaPreview}>
        <strong>{row.pregunta || '—'}</strong>
        {row.descripcion ? (
          <div className={styles.meta} style={{ marginTop: 4 }}>
            {row.descripcion}
          </div>
        ) : null}
      </td>
      <td className={styles.colActions}>
        <AdminRowActionsMenu
          itemLabel={row.theoryPart?.label || 'ejercicio'}
          disabled={rowBusyId === row.id || savingEdit}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
        />
      </td>
    </tr>
  );
}

function ExerciseTable({
  rows,
  selectedIds,
  onToggleSelect,
  rowBusyId,
  savingEdit,
  onEdit,
  onDelete,
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.colCheck} aria-label="Seleccionar" />
          <th>Fecha</th>
          <th>Nivel</th>
          <th>Skill</th>
          <th>Tipo</th>
          <th>Respuesta</th>
          <th>Pregunta</th>
          <th className={styles.colActions}>
            <span className="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <ExerciseRow
            key={row.id}
            row={row}
            selected={selectedIds.has(row.id)}
            onToggleSelect={onToggleSelect}
            rowBusyId={rowBusyId}
            savingEdit={savingEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}

const EMPTY_FILTERS = {
  group: '',
  partHref: '',
  nivelId: '',
  skillId: '',
  tipoId: '',
  answerMode: '',
  search: '',
};

export default function AdminRecentEjerciciosSection({
  recent = [],
  levels = [],
  skills = [],
  tipos = [],
  theoryParts = [],
  rowBusyId = null,
  savingEdit = false,
  bulkDeleting = false,
  onEdit,
  onDelete,
  onBulkDelete,
}) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState('folders');
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const filterOptions = useMemo(() => {
    const groups = new Set();
    const parts = new Map();
    for (const row of recent) {
      const g = row.theoryPart?.group || 'Sin vincular';
      groups.add(g);
      if (row.theoryPart?.href) {
        parts.set(row.theoryPart.href, {
          href: row.theoryPart.href,
          label: row.theoryPart.label,
          group: g,
        });
      }
    }
    for (const part of theoryParts) {
      parts.set(part.href, part);
      groups.add(part.group);
    }
    return {
      groups: [...groups].sort((a, b) => a.localeCompare(b, 'es')),
      parts: [...parts.values()].sort((a, b) => a.label.localeCompare(b.label, 'es')),
    };
  }, [recent, theoryParts]);

  const filtered = useMemo(() => filterRows(recent, filters), [recent, filters]);
  const grouped = useMemo(() => groupFilteredRows(filtered), [filtered]);

  const partsForGroupFilter = useMemo(() => {
    if (!filters.group) return filterOptions.parts;
    return filterOptions.parts.filter(
      (p) => (p.group || 'Sin vincular') === filters.group,
    );
  }, [filterOptions.parts, filters.group]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const setFilter = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'group') next.partHref = '';
      return next;
    });
  };

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  const handleBulkDelete = () => {
    const ids = [...selectedIds].filter((id) => filtered.some((r) => r.id === id));
    if (!ids.length) return;
    onBulkDelete(ids, clearSelection);
  };

  return (
    <section className={styles.recentSection}>
      <div className={styles.recentHead}>
        <div>
          <h2 className={styles.sectionTitle}>Ejercicios recientes</h2>
          <p className={styles.sectionDesc}>
            {recent.length} en lista · {filtered.length} visibles tras filtros
          </p>
        </div>
        <div className={styles.viewToggle} role="group" aria-label="Vista">
          <button
            type="button"
            className={`${styles.viewBtn}${viewMode === 'folders' ? ` ${styles.viewBtnActive}` : ''}`}
            onClick={() => setViewMode('folders')}
          >
            Carpetas
          </button>
          <button
            type="button"
            className={`${styles.viewBtn}${viewMode === 'table' ? ` ${styles.viewBtnActive}` : ''}`}
            onClick={() => setViewMode('table')}
          >
            Tabla
          </button>
        </div>
      </div>

      <div className={styles.filterBar}>
        <label className={styles.filterField}>
          <span className={styles.fieldLabel}>Carpeta</span>
          <select
            value={filters.group}
            onChange={(e) => setFilter('group', e.target.value)}
          >
            <option value="">Todas</option>
            {filterOptions.groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span className={styles.fieldLabel}>Tema / parte</span>
          <select
            value={filters.partHref}
            onChange={(e) => setFilter('partHref', e.target.value)}
          >
            <option value="">Todos</option>
            {partsForGroupFilter.map((p) => (
              <option key={p.href} value={p.href}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span className={styles.fieldLabel}>Nivel</span>
          <select
            value={filters.nivelId}
            onChange={(e) => setFilter('nivelId', e.target.value)}
          >
            <option value="">Todos</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {String(l.nombre).toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span className={styles.fieldLabel}>Skill</span>
          <select
            value={filters.skillId}
            onChange={(e) => setFilter('skillId', e.target.value)}
          >
            <option value="">Todos</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span className={styles.fieldLabel}>Tipo</span>
          <select
            value={filters.tipoId}
            onChange={(e) => setFilter('tipoId', e.target.value)}
          >
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span className={styles.fieldLabel}>Respuesta</span>
          <select
            value={filters.answerMode}
            onChange={(e) => setFilter('answerMode', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="closed">Cerrada</option>
            <option value="open">Abierta</option>
          </select>
        </label>
        <label className={`${styles.filterField} ${styles.filterFieldSearch}`}>
          <span className={styles.fieldLabel}>Buscar</span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Pregunta, descripción, tema…"
          />
        </label>
        <button type="button" className={styles.btn} onClick={resetFilters}>
          Limpiar filtros
        </button>
      </div>

      <div className={styles.bulkBar}>
        <label className={styles.selectAllLabel}>
          <input
            type="checkbox"
            checked={allFilteredSelected}
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  someSelected && !allFilteredSelected && filtered.length > 0;
              }
            }}
            onChange={toggleSelectAllFiltered}
            disabled={!filtered.length}
          />
          <span>
            Seleccionar visibles ({filtered.length})
          </span>
        </label>
        {someSelected ? (
          <>
            <span className={styles.bulkCount}>{selectedIds.size} seleccionados</span>
            <button type="button" className={styles.btn} onClick={clearSelection}>
              Quitar selección
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDanger}`}
              disabled={bulkDeleting}
              onClick={handleBulkDelete}
            >
              {bulkDeleting ? 'Eliminando…' : `Eliminar seleccionados (${selectedIds.size})`}
            </button>
          </>
        ) : (
          <span className={styles.bulkHint}>
            Marca ejercicios para eliminarlos en lote
          </span>
        )}
      </div>

      {!filtered.length ? (
        <p className={styles.empty}>
          {recent.length
            ? 'Ningún ejercicio coincide con los filtros.'
            : 'Aún no hay ejercicios. Crea el primero con los filtros de arriba.'}
        </p>
      ) : viewMode === 'table' ? (
        <div className={styles.tableWrap}>
          <ExerciseTable
            rows={filtered}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            rowBusyId={rowBusyId}
            savingEdit={savingEdit}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ) : (
        <div className={styles.folderList}>
          {grouped.map(({ groupName, parts }) => (
            <details key={groupName} className={styles.folder} open>
              <summary className={styles.folderSummary}>
                <span className={styles.folderIcon} aria-hidden>
                  📁
                </span>
                <span className={styles.folderTitle}>{groupName}</span>
                <span className={styles.folderCount}>
                  {parts.reduce((n, p) => n + p.rows.length, 0)} ejercicios ·{' '}
                  {parts.length} temas
                </span>
              </summary>
              <div className={styles.folderBody}>
                {parts.map((part) => (
                  <details key={part.href} className={styles.subfolder} open>
                    <summary className={styles.subfolderSummary}>
                      <span className={styles.subfolderIcon} aria-hidden>
                        📄
                      </span>
                      <span>{part.label}</span>
                      <span className={styles.folderCount}>{part.rows.length}</span>
                    </summary>
                    <div className={styles.tableWrap}>
                      <ExerciseTable
                        rows={part.rows}
                        selectedIds={selectedIds}
                        onToggleSelect={toggleSelect}
                        rowBusyId={rowBusyId}
                        savingEdit={savingEdit}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
