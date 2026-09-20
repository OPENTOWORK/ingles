/**
 * Congela los datos fiscales del tercero en el momento de la factura.
 * La factura emitida debe conservar los datos vigentes en su fecha, aunque el
 * cliente cambie después de razón social o domicilio.
 */
export function buildPartySnapshot(party = {}) {
  return {
    legal_name: party.legal_name || '',
    trade_name: party.trade_name || '',
    tax_id: party.tax_id || '',
    address_line: party.address_line || '',
    postal_code: party.postal_code || '',
    city: party.city || '',
    province: party.province || '',
    country: party.country || 'ES',
    email: party.email || '',
    phone: party.phone || '',
  };
}

/** Dirección postal legible a partir de un snapshot o de un tercero. */
export function formatPartyAddress(source = {}) {
  const parts = [
    source.address_line,
    [source.postal_code, source.city].filter(Boolean).join(' '),
    source.province,
    source.country && source.country !== 'ES' ? source.country : null,
  ].filter((part) => String(part || '').trim());

  return parts.join(' · ');
}
