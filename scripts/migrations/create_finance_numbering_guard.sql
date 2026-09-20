-- Numeración de asientos a prueba de concurrencia y congelación de los datos
-- fiscales del tercero en el momento de emitir la factura.
--
-- Complementa create_finance_core.sql:
--  * `fin_next_entry_number` serializa la asignación del número de asiento
--    bloqueando la fila del ejercicio, de modo que dos operaciones simultáneas
--    (emitir factura, registrar cobro, asiento manual) no compitan por el mismo
--    número y provoquen un fallo del índice único (fiscal_year_id, entry_number).
--  * `fin_freeze_party_snapshot` congela razón social, NIF y dirección en la
--    factura al emitirla, que es el momento en el que adquiere valor fiscal.

create or replace function public.fin_next_entry_number(p_fiscal_year_id uuid)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_next integer;
begin
  -- El bloqueo de la fila del ejercicio serializa a todos los que numeran asientos.
  perform 1 from public.fin_fiscal_years where id = p_fiscal_year_id for update;

  select coalesce(max(entry_number), 0) + 1
    into v_next
    from public.fin_journal_entries
   where fiscal_year_id = p_fiscal_year_id;

  return v_next;
end; $$;

comment on function public.fin_next_entry_number(uuid) is
  'Siguiente número de asiento del ejercicio, serializado mediante bloqueo de la fila del ejercicio.';

create or replace function public.fin_freeze_party_snapshot(p_party_id uuid)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'party_id', p.id,
    'kind', p.kind,
    'legal_name', p.legal_name,
    'trade_name', p.trade_name,
    'tax_id', p.tax_id,
    'address_line', p.address_line,
    'postal_code', p.postal_code,
    'city', p.city,
    'province', p.province,
    'country', p.country,
    'email', p.email,
    'phone', p.phone,
    'payment_method', p.payment_method,
    'frozen_at', to_jsonb(now())
  ))
  from public.fin_parties p
  where p.id = p_party_id;
$$;

comment on function public.fin_freeze_party_snapshot(uuid) is
  'Datos fiscales del tercero congelados en la factura al emitirla.';

revoke all on function public.fin_next_entry_number(uuid) from anon, authenticated;
revoke all on function public.fin_freeze_party_snapshot(uuid) from anon, authenticated;
