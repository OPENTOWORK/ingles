/** Comprueba si dralo.es está verificado en Resend (envío a cualquier correo). */
export async function isResendDomainReady() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return false;
    const json = await res.json();
    const domain = (json.data || []).find((d) => d.name === 'dralo.es');
    return domain?.status === 'verified';
  } catch {
    return false;
  }
}
