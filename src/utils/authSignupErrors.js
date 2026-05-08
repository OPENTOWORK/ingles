/** Mensaje legible para errores típicos de Supabase Auth en registro. */
export function mapSignupErrorMessage(rawMessage = '') {
  const m = String(rawMessage).toLowerCase();
  if (m.includes('email rate limit') || m.includes('rate limit exceeded')) {
    return 'El envío de correos de confirmación está saturado. Inténtalo más tarde o contacta con soporte. (Si gestionas el proyecto: en Supabase activa SMTP propio o desactiva “Confirm email” temporalmente.)';
  }
  if (m.includes('already registered') || m.includes('user already')) {
    return 'Ya existe una cuenta con este email. Inicia sesión o usa “¿Has olvidado tu contraseña?”.';
  }
  if (m.includes('password')) {
    return rawMessage;
  }
  return rawMessage || 'No se pudo completar el registro.';
}
