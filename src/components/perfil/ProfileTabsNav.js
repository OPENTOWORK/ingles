'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PROFILE_TAB_GROUPS,
  PROFILE_TABS,
  getProfileGroupForTab,
} from '@/components/perfil/profileTabsConfig';

/**
 * Category groups + pill submenus (Overview, My details, …).
 */
export default function ProfileTabsNav({
  tabs = PROFILE_TABS,
  activeTab,
  onSelectTab,
  isStudent,
  className = '',
  ariaLabel = 'Profile sections',
}) {
  const tabMap = useMemo(
    () => Object.fromEntries(tabs.map((t) => [t.id, t])),
    [tabs],
  );

  const [activeGroupId, setActiveGroupId] = useState(() =>
    getProfileGroupForTab(activeTab).id,
  );

  useEffect(() => {
    setActiveGroupId(getProfileGroupForTab(activeTab).id);
  }, [activeTab]);

  const activeGroup =
    PROFILE_TAB_GROUPS.find((g) => g.id === activeGroupId) || PROFILE_TAB_GROUPS[0];

  const visibleTabs = activeGroup.tabIds
    .map((id) => tabMap[id])
    .filter(Boolean);

  const handleSelectGroup = (groupId) => {
    const group = PROFILE_TAB_GROUPS.find((g) => g.id === groupId);
    if (!group) return;
    setActiveGroupId(groupId);
    if (group.tabIds.includes(activeTab)) return;
    const firstAllowed =
      group.tabIds.find((id) => {
        const tab = tabMap[id];
        return tab && (!isStudent || tab.studentAllowed);
      }) || group.tabIds[0];
    if (firstAllowed) onSelectTab(firstAllowed);
  };

  return (
    <nav
      className={`perfil-tabs-bar perfil-tabs-bar--grouped${className ? ` ${className}` : ''}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="perfil-tabs-groups" role="tablist" aria-label="Profile categories">
        {PROFILE_TAB_GROUPS.map((group) => {
          const isActiveGroup = group.id === activeGroupId;
          const hasActiveTab = group.tabIds.includes(activeTab);
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={isActiveGroup}
              className={`perfil-tabs-group${isActiveGroup ? ' perfil-tabs-group--active' : ''}${hasActiveTab && !isActiveGroup ? ' perfil-tabs-group--has-selection' : ''}`}
              onClick={() => handleSelectGroup(group.id)}
            >
              <span className="perfil-tabs-group__title">{group.title}</span>
              <span className="perfil-tabs-group__meta">{group.tabIds.length} sections</span>
            </button>
          );
        })}
      </div>

      <p className="perfil-tabs-group-desc">{activeGroup.description}</p>

      <div className="perfil-tabs-items" role="tablist" aria-label={activeGroup.title}>
        {visibleTabs.map((tab) => {
          const locked = isStudent && !tab.studentAllowed;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`perfil-tab-item${isActive ? ' perfil-tab-item--active' : ''}${locked ? ' perfil-tab-item--locked' : ''}`}
              onClick={() => onSelectTab(tab.id)}
              aria-disabled={locked || undefined}
              title={locked ? 'Coming soon' : undefined}
            >
              {tab.emoji ? (
                <span className="perfil-tab-item__icon" aria-hidden>
                  {tab.emoji}
                </span>
              ) : null}
              <span className="perfil-tab-item__label">{tab.label}</span>
              {locked ? (
                <span className="perfil-tab-item__badge">Soon</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
