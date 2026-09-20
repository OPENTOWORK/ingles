-- Cierre de acceso directo a los datos financieros desde el cliente.
--
-- Las tablas fin_* tienen RLS activo y cero políticas, es decir, deniegan todo a
-- `anon` y `authenticated`: el único camino es la API de servidor, que comprueba
-- rol y permisos en `withFinanceAuth`.
--
-- Las vistas, en cambio, se crearon con los permisos por defecto de PostgREST y
-- con `security_invoker = false`, lo que las convertía en una puerta trasera:
-- cualquier sesión podía leer facturas, NIF de clientes y apuntes contables
-- consultando `fin_invoice_overview` o `fin_ledger_view` directamente.
--
-- Se corrige por partida doble: la vista pasa a evaluar el RLS del que consulta
-- y además se retiran los privilegios de los roles de cliente.

alter view public.fin_invoice_overview set (security_invoker = true);
alter view public.fin_ledger_view set (security_invoker = true);

revoke all on public.fin_invoice_overview from anon, authenticated, public;
revoke all on public.fin_ledger_view from anon, authenticated, public;

-- Helpers internos: solo los usa el propio backend a través de las RPC.
revoke all on function public.fin_next_entry_number(uuid) from public, anon, authenticated;
revoke all on function public.fin_freeze_party_snapshot(uuid) from public, anon, authenticated;
