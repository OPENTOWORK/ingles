export const STAFF_DEPARTMENTS = [
  { value: 'Administración', label: 'Administración' },
  { value: 'Coordinación', label: 'Coordinación' },
  { value: 'Profesorado', label: 'Profesorado' },
  { value: 'Soporte', label: 'Soporte' },
  { value: 'Informática', label: 'Informática' },
];

export const EMPTY_MEETING_FORM = {
  titulo: '',
  fecha: '',
  hora: '',
  departamentos: [],
  puntos_dia: [{ text: '' }],
  notas: '',
};

export function normalizePuntosDia(raw = []) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (typeof item === 'string') {
        return { text: item.trim(), orden: index };
      }
      return {
        text: String(item?.text || '').trim(),
        orden: typeof item?.orden === 'number' ? item.orden : index,
      };
    })
    .filter((p) => p.text);
}

export function normalizeDepartamentos(raw = []) {
  if (!Array.isArray(raw)) return [];
  return raw.map((d) => String(d).trim()).filter(Boolean);
}

export function formatMeetingDate(fecha, hora) {
  if (!fecha) return '—';
  const date = new Date(`${fecha}T${hora || '12:00:00'}`);
  if (Number.isNaN(date.getTime())) {
    return fecha;
  }
  const datePart = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  if (!hora) return datePart;
  const timePart = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
}
