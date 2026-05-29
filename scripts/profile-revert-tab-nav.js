const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/perfil/page.js');
let s = fs.readFileSync(pagePath, 'utf8');

s = s.replace(
  "import ProfileGroupAccordions from '@/components/perfil/ProfileGroupAccordions';\n",
  "import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';\nimport ProfileComingSoon from '@/components/perfil/ProfileComingSoon';\n",
);
s = s.replace(
  "import { PROFILE_TABS } from '@/components/perfil/profileTabsConfig';",
  "import { PROFILE_TABS, PROFILE_TAB_LABELS } from '@/components/perfil/profileTabsConfig';",
);

s = s.replace(
  "  const [activeGroupId, setActiveGroupId] = useState('account');\n  const [openSectionIds, setOpenSectionIds] = useState(['overview']);",
  "  const [activeTab, setActiveTab] = useState('overview');",
);

const navBlock = `  const activeTabMeta = PROFILE_TABS.find((t) => t.id === activeTab);
  const studentTabLocked = isStudent && activeTabMeta && !activeTabMeta.studentAllowed;

  const displayName =`;

if (!s.includes('studentTabLocked')) {
  s = s.replace(
    '  const displayName =',
    navBlock,
  );
}

s = s.replace(
  `  const isMisDatosOpen = openSectionIds.includes('mis-datos');

  return (
    <main className={\`shell perfil-page\${isMisDatosOpen ? ' perfil-page--mis-datos' : ''}\`}>
      <ProfileTabsNav activeGroupId={activeGroupId} onGroupChange={setActiveGroupId} />`,
  `  const tabsProps = {
    tabs: PROFILE_TABS,
    activeTab,
    onSelectTab: setActiveTab,
    isStudent,
  };

  return (
    <main className={\`shell perfil-page\${activeTab === 'mis-datos' ? ' perfil-page--mis-datos' : ''}\`}>
      <ProfileTabsNav {...tabsProps} />`,
);

const start = s.indexOf('      <ProfileGroupAccordions');
const end = s.indexOf('      <GlobalStyles />');
if (start >= 0 && end > start) {
  let inner = s.slice(start, end);
  inner = inner.replace(/<ProfileGroupAccordions[\s\S]*?renderSection=\{\(tabId\) => \(\s*<>\s*/m, '');
  inner = inner.replace(/\s*<\/>\s*\)\s*\}\s*\/>\s*$/m, '');
  inner = inner.replace(/\{tabId === /g, '{activeTab === ');
  inner = inner.replace(/tabId === 'exam-dates' \? \(/g, "activeTab === 'exam-dates' ? (");
  s = s.slice(0, start) + `      {studentTabLocked ? (
        <ProfileComingSoon section={PROFILE_TAB_LABELS[activeTab]} />
      ) : (
        <>
${inner}
        </>
      )}

` + s.slice(end);
}

fs.writeFileSync(pagePath, s);
console.log('reverted tab nav');
