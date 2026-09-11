'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styles from './StaffTasksKanban.module.css';

function columnDroppableId(estado) {
  return `column:${estado}`;
}

function parseColumnEstado(droppableId) {
  const raw = String(droppableId || '');
  return raw.startsWith('column:') ? raw.slice(7) : null;
}

function KanbanColumn({ column, items, renderCard }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDroppableId(column.id) });

  return (
    <section
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.columnOver : ''}`}
      aria-label={column.label}
    >
      <header className={styles.columnHead} style={column.headStyle}>
        <h4 className={styles.columnTitle}>{column.label}</h4>
        <p className={styles.columnCount}>{items.length} elemento{items.length === 1 ? '' : 's'}</p>
      </header>
      <div className={styles.columnBody}>
        {items.length === 0 ? (
          <p className={styles.emptyColumn}>Arrastra aquí</p>
        ) : (
          items.map((item) => (
            <KanbanDraggableCard key={item.id} item={item}>
              {renderCard(item)}
            </KanbanDraggableCard>
          ))
        )}
      </div>
    </section>
  );
}

function KanbanDraggableCard({ item, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: isDragging ? 2 : undefined }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      {...listeners}
      {...attributes}
    >
      {children}
    </article>
  );
}

/**
 * @param {{
 *   columns: Array<{ id: string, label: string, headStyle?: object }>,
 *   items: Array<{ id: string, estado: string }>,
 *   getEstado?: (item: object) => string,
 *   renderCard: (item: object) => React.ReactNode,
 *   onMove: (item: object, newEstado: string) => void | Promise<void>,
 *   disabled?: boolean,
 * }} props
 */
export default function StaffTasksKanbanBoard({
  columns,
  items,
  getEstado = (item) => item.estado,
  renderCard,
  onMove,
  disabled = false,
}) {
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const grouped = useMemo(() => {
    const map = Object.fromEntries(columns.map((col) => [col.id, []]));
    items.forEach((item) => {
      const estado = getEstado(item);
      if (map[estado]) map[estado].push(item);
      else if (columns[0]) map[columns[0].id].push(item);
    });
    return map;
  }, [columns, items, getEstado]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over || disabled) return;

    let newEstado = parseColumnEstado(over.id);
    if (!newEstado) {
      const overItem = items.find((row) => row.id === over.id);
      if (overItem) newEstado = getEstado(overItem);
    }
    if (!newEstado) return;

    const item = active.data.current?.item || items.find((row) => row.id === active.id);
    if (!item || getEstado(item) === newEstado) return;

    await onMove(item, newEstado);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(event) => {
        const item = event.active.data.current?.item;
        if (item) setActiveItem(item);
      }}
      onDragCancel={() => setActiveItem(null)}
      onDragEnd={(event) => void handleDragEnd(event)}
    >
      <div className={styles.board}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            items={grouped[column.id] || []}
            renderCard={renderCard}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {activeItem ? (
          <div className={styles.cardOverlay}>{renderCard(activeItem)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export { styles as kanbanStyles };
