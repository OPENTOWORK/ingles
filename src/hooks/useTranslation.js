'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from '@/utils/translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  return { t, language };
};
















