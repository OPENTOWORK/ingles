'use client';

import { useCallback, useEffect, useMemo } from 'react';
import ProfileComingSoon from '@/components/perfil/ProfileComingSoon';
import ProfileSectionAccordion from '@/components/perfil/ProfileSectionAccordion';
import {
  PROFILE_TAB_GROUPS,
  PROFILE_TAB_LABELS,
  PROFILE_TABS,
} from '@/components/perfil/profileTabsConfig';

function firstAllowedTabId(group, isStudent) {
  const tabMap = Object.fromEntries(PROFILE_TABS.map((t) => [t.id, t]));
  return (
    group.tabIds.find((id) => {
      const tab = tabMap[id];
      return tab && (!isStudent || tab.studentAllowed);
    }) || group.tabIds[0]
  );
}

export default function ProfileGroupAccordions({
  groupId,
  openSectionIds,
  onOpenSectionIdsChange,
  isStudent,
  renderSection,
}) {
  const group = PROFILE_TAB_GROUPS.find((g) => g.id === groupId) || PROFILE_TAB_GROUPS[0];
  const tabMap = useMemo(
    () => Object.fromEntries(PROFILE_TABS.map((t) => [t.id, t])),
    [],
  );

  useEffect(() => {
    const allowed = firstAllowedTabId(group, isStudent);
    onOpenSectionIdsChange([allowed]);
  }, [group.id, isStudent, onOpenSectionIdsChange]);

  const toggleSection = useCallback(
    (tabId) => {
      onOpenSectionIdsChange((prev) =>
        prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId],
      );
    },
    [onOpenSectionIdsChange],
  );

  return (
    <div className="profile-accordions">
      {group.tabIds.map((tabId) => {
        const tab = tabMap[tabId];
        if (!tab) return null;
        const locked = isStudent && !tab.studentAllowed;
        const isOpen = openSectionIds.includes(tabId);

        return (
          <ProfileSectionAccordion
            key={tabId}
            id={tabId}
            title={tab.label}
            emoji={tab.emoji}
            locked={locked}
            open={isOpen}
            onToggle={() => toggleSection(tabId)}
          >
            {locked ? (
              <ProfileComingSoon section={PROFILE_TAB_LABELS[tabId]} />
            ) : (
              renderSection(tabId)
            )}
          </ProfileSectionAccordion>
        );
      })}
    </div>
  );
}
