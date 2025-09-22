'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (lang) => {
    const pathWithoutLang = pathname.replace(/^\/(en|es)/, '');
    router.push(`/${lang}${pathWithoutLang}`);
  };

  return (
    <div style={{ marginLeft: "1rem", display: "flex", gap: "0.5rem" }}>
      <button onClick={() => changeLanguage('es')}>🇪🇸</button>
      <button onClick={() => changeLanguage('en')}>🇬🇧</button>
    </div>
  );
}
