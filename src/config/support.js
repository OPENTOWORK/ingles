/** Correo oficial de Dralo. Se puede responder. */
export const DRALO_OFFICIAL_EMAIL = 'support@dralo.es';

/** Bandeja de entrada para nuevos tickets de soporte. */
export const SUPPORT_TICKET_INBOX_EMAIL =
  process.env.SUPPORT_TICKET_TO_EMAIL || DRALO_OFFICIAL_EMAIL;
