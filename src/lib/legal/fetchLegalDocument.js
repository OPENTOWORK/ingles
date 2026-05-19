import { supabase } from '@/utils/supabaseClient';
import { getLegalDocument } from '@/lib/legal/legalDocuments';

/**
 * Carga un documento legal desde Supabase `politicas` o JSON local (fallback).
 */
export async function fetchLegalDocument(slug) {
  const local = getLegalDocument(slug);
  if (!local) return null;

  try {
    const { data, error } = await supabase
      .from('politicas')
      .select('slug, titulo, categoria, orden, actualizado, intro, secciones')
      .eq('slug', slug)
      .eq('publicado', true)
      .maybeSingle();

    if (error || !data?.secciones) {
      return local;
    }

    return {
      slug: data.slug,
      title: data.titulo || local.title,
      category: data.categoria || local.category,
      updatedAt: data.actualizado || local.updatedAt,
      introParagraphs: data.intro
        ? [data.intro]
        : local.introParagraphs,
      sections: Array.isArray(data.secciones) ? data.secciones : local.sections,
      fromDatabase: true,
    };
  } catch {
    return local;
  }
}
