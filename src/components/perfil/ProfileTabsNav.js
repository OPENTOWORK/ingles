'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bot,
  Brain,
  Calendar,
  CalendarDays,
  Gamepad2,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Link2,
  Settings,
  Target,
  Trophy,
  TrendingUp,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import {
  PROFILE_TAB_GROUPS,
  getProfileGroupForTab,
  getVisibleProfileTabGroups,
  getVisibleProfileTabs,
  getVisibleTabsInGroup,
} from '@/components/perfil/profileTabsConfig';

const TAB_ICONS = {
  overview: LayoutDashboard,
  'mis-datos': User,
  'exam-dates': Calendar,
  'private-tutor': GraduationCap,
  progress: TrendingUp,
  achievements: Trophy,
  goals: Target,
  integrated: Link2,
  'study-tools': Wrench,
  'study-planner': CalendarDays,
  'ai-tools': Bot,
  'error-tracker': Brain,
  analytics: BarChart3,
  settings: Settings,
  social: Users,
  community: Globe,
  gamification: Gamepad2,
};

/**
 * Category groups + pill submenus (Overview, My details, …).
 */
export default function ProfileTabsNav({
  tabs = getVisibleProfileTabs(),
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

  const visibleGroups = useMemo(
    () => getVisibleProfileTabGroups(isStudent),
    [isStudent],
  );

  const [activeGroupId, setActiveGroupId] = useState(() =>
    getProfileGroupForTab(activeTab, isStudent).id,
  );

  useEffect(() => {
    setActiveGroupId(getProfileGroupForTab(activeTab, isStudent).id);
  }, [activeTab, isStudent]);

  useEffect(() => {
    if (visibleGroups.some((group) => group.id === activeGroupId)) return;
    setActiveGroupId(visibleGroups[0]?.id || 'account');
  }, [visibleGroups, activeGroupId]);

  const activeGroup =
    visibleGroups.find((g) => g.id === activeGroupId) || visibleGroups[0] || PROFILE_TAB_GROUPS[0];

  const visibleTabs = getVisibleTabsInGroup(activeGroup, isStudent).filter((tab) => tabMap[tab.id]);

  const handleSelectGroup = (groupId) => {
    const group = visibleGroups.find((g) => g.id === groupId);
    if (!group) return;
    setActiveGroupId(groupId);
    const visibleIds = getVisibleTabsInGroup(group, isStudent).map((tab) => tab.id);
    if (visibleIds.includes(activeTab)) return;
    const firstAllowed =
      getVisibleTabsInGroup(group, isStudent).find((tab) => {
        if (!tabMap[tab.id]) return false;
        return !isStudent || tab.studentAllowed;
      })?.id || getVisibleTabsInGroup(group, isStudent)[0]?.id;
    if (firstAllowed) onSelectTab(firstAllowed);
  };

  return (
    <nav
      className={`perfil-tabs-bar perfil-tabs-bar--grouped${className ? ` ${className}` : ''}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="perfil-tabs-groups" role="tablist" aria-label="Profile categories">
        {visibleGroups.map((group) => {
          const isActiveGroup = group.id === activeGroupId;
          const hasActiveTab = getVisibleTabsInGroup(group, isStudent).some((t) => t.id === activeTab);
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
              <span className="perfil-tabs-group__meta">
                {getVisibleTabsInGroup(group, isStudent).length} sections
              </span>
            </button>
          );
        })}
      </div>

      <p className="perfil-tabs-group-desc">{activeGroup.description}</p>

      <div className="perfil-tabs-items" role="tablist" aria-label={activeGroup.title}>
        {visibleTabs.map((tab) => {
          const locked = isStudent && !tab.studentAllowed;
          const isActive = activeTab === tab.id;
          const TabIcon = TAB_ICONS[tab.id];
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
              {TabIcon ? (
                <span className="perfil-tab-item__icon" aria-hidden>
                  <TabIcon size={16} strokeWidth={2} />
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
