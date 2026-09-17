'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { loadAdminShellMenuOrder, saveAdminShellMenuOrder } from '@/lib/adminShellNavOrder';
import AdminShellDragHandle from '@/components/admin/AdminShellDragHandle';
import styles from './AdminShell.module.css';

function SortableNavItem({ item, active, collapsed, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.href,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemClass = [
    styles.navItem,
    active ? styles.navItemActive : '',
    isDragging ? styles.navItemDragging : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={setNodeRef} style={style} className={itemClass}>
      {!collapsed ? (
        <button
          type="button"
          className={styles.dragHandle}
          aria-label={`Reordenar ${item.label}`}
          title="Arrastrar para reordenar"
          {...attributes}
          {...listeners}
        >
          <AdminShellDragHandle className={styles.dragHandleIcon} />
        </button>
      ) : null}
      <Link
        href={item.href}
        className={active ? styles.navLinkActive : styles.navLink}
        aria-current={active ? 'page' : undefined}
        title={collapsed ? item.label : undefined}
      >
        <span className={styles.navLabel}>{item.label}</span>
      </Link>
    </div>
  );
}

function NavItemPreview({ item, active }) {
  return (
    <div className={`${styles.navItem} ${styles.navItemOverlay}${active ? ` ${styles.navItemActive}` : ''}`}>
      <span className={styles.dragHandle} aria-hidden>
        <AdminShellDragHandle className={styles.dragHandleIcon} />
      </span>
      <div className={active ? styles.navLinkActive : styles.navLink}>
        <span className={styles.navLabel}>{item.label}</span>
      </div>
    </div>
  );
}

function NavSection({
  section,
  collapsed,
  sortDisabled,
  isAdminNavActive,
  pathname,
  onReorder,
}) {
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const itemIds = useMemo(() => (section.items || []).map((item) => item.href), [section.items]);
  const activeItem = activeId ? section.items.find((item) => item.href === activeId) : null;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = section.items.findIndex((item) => item.href === active.id);
    const newIndex = section.items.findIndex((item) => item.href === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(section.id, arrayMove(section.items, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(String(event.active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.navSection}>
        {!collapsed && section.title ? (
          <p className={styles.navSectionTitle}>{section.title}</p>
        ) : null}
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {(section.items || []).map((item) => (
            <SortableNavItem
              key={item.href}
              item={item}
              active={isAdminNavActive(item.href, pathname)}
              collapsed={collapsed}
              disabled={sortDisabled}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {activeItem ? (
          <NavItemPreview item={activeItem} active={isAdminNavActive(activeItem.href, pathname)} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default function AdminShellNav({
  menuSections = [],
  pathname,
  userRole,
  collapsed,
  isAdminNavActive,
}) {
  const [orderedSections, setOrderedSections] = useState(menuSections);
  const sortDisabled = collapsed;

  useEffect(() => {
    setOrderedSections(loadAdminShellMenuOrder(userRole, menuSections));
  }, [menuSections, userRole]);

  const handleSectionReorder = (sectionId, nextItems) => {
    setOrderedSections((current) => {
      const next = current.map((section) =>
        section.id === sectionId ? { ...section, items: nextItems } : section,
      );
      saveAdminShellMenuOrder(userRole, next);
      return next;
    });
  };

  return (
    <nav className={styles.nav} aria-label="Módulos de administración">
      {orderedSections.map((section) => (
        <NavSection
          key={section.id}
          section={section}
          collapsed={collapsed}
          sortDisabled={sortDisabled}
          isAdminNavActive={isAdminNavActive}
          pathname={pathname}
          onReorder={handleSectionReorder}
        />
      ))}
    </nav>
  );
}
