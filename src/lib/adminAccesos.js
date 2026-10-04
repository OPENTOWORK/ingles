const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, max) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (text.length > max) return { tooLong: true, text };
  return text;
}

export function validateAccesoWeb(input, { editing = false } = {}) {
  const nombre = clean(input?.nombre, 120);
  if (nombre && nombre.tooLong) return { ok: false, error: 'El nombre es demasiado largo.' };
  if (!nombre) return { ok: false, error: 'El nombre es obligatorio.' };

  const url = clean(input?.url, 500);
  if (url && url.tooLong) return { ok: false, error: 'La URL es demasiado larga.' };

  const paraQue = clean(input?.paraQue, 500);
  if (paraQue && paraQue.tooLong) return { ok: false, error: 'El texto de para qué sirve es demasiado largo.' };

  const conectadoCon = clean(input?.conectadoCon, 500);
  if (conectadoCon && conectadoCon.tooLong) {
    return { ok: false, error: 'El texto de con qué está conectado es demasiado largo.' };
  }

  const usuario = clean(input?.usuario, 160);
  if (usuario && usuario.tooLong) return { ok: false, error: 'El usuario es demasiado largo.' };

  const correoRaw = clean(input?.correo, 160);
  if (correoRaw && correoRaw.tooLong) return { ok: false, error: 'El correo es demasiado largo.' };
  const correo = correoRaw ? correoRaw.toLowerCase() : '';
  if (correo && !EMAIL_PATTERN.test(correo)) return { ok: false, error: 'El correo no es válido.' };

  const contrasena = String(input?.contrasena ?? '').trim();
  if (contrasena.length > 500) return { ok: false, error: 'La contraseña es demasiado larga.' };

  return {
    ok: true,
    value: {
      nombre,
      url,
      paraQue,
      conectadoCon,
      usuario,
      correo,
      contrasena,
      keepPassword: editing && contrasena === '',
    },
  };
}

export function presentAcceso(row) {
  return {
    id: row.id,
    nombre: row.nombre || '',
    url: row.url || '',
    paraQue: row.para_que || '',
    conectadoCon: row.conectado_con || '',
    usuario: row.usuario || '',
    correo: row.correo || '',
    contrasena: row.contrasena || '',
    updatedAt: row.actualizado_en || null,
  };
}
