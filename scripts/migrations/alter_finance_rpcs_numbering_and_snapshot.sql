-- Aplica sobre las RPC ya creadas en create_finance_core.sql dos correcciones
-- que no cambian su interfaz, por lo que se reescriben in situ a partir de su
-- propia definición en lugar de duplicar aquí cientos de líneas de cuerpo.
--
-- 1) Numeración de asientos serializada: `max(entry_number) + 1` sin bloqueo
--    permite que dos transacciones simultáneas elijan el mismo número y una
--    falle contra el índice único (fiscal_year_id, entry_number). Se sustituye
--    por `fin_next_entry_number`, que bloquea la fila del ejercicio.
--
-- 2) Congelación del snapshot fiscal del tercero al emitir la factura: el
--    momento en el que la factura adquiere valor fiscal es la emisión, no el
--    borrador, así que si el snapshot sigue vacío se rellena entonces.
--
-- Requiere: create_finance_numbering_guard.sql

do $mig$
declare
  v_name text;
  v_def text;
  v_new text;
begin
  foreach v_name in array array['fin_issue_invoice', 'fin_register_payment', 'fin_create_journal_entry'] loop
    select pg_get_functiondef(p.oid) into v_def
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = v_name;

    v_new := regexp_replace(
      v_def,
      'select coalesce\(max\(entry_number\),\s*0\)\s*\+\s*1 into (\w+) from public\.fin_journal_entries where fiscal_year_id = ([\w\.]+);',
      '\1 := public.fin_next_entry_number(\2);',
      'g');

    if v_new = v_def then
      raise exception 'No se ha podido aplicar la numeración serializada en %', v_name;
    end if;

    execute v_new;
  end loop;
end $mig$;

do $mig$
declare
  v_def text;
  v_new text;
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'fin_issue_invoice';

  v_new := replace(v_def,
    '  v_seq := v_series.next_number;',
    '  if v_invoice.party_snapshot is null or v_invoice.party_snapshot = ''{}''::jsonb then' || chr(10) ||
    '    v_invoice.party_snapshot := public.fin_freeze_party_snapshot(v_invoice.party_id);' || chr(10) ||
    '  end if;' || chr(10) || chr(10) ||
    '  v_seq := v_series.next_number;');

  v_new := replace(v_new,
    'update public.fin_invoices set invoice_number = v_number,',
    'update public.fin_invoices set party_snapshot = v_invoice.party_snapshot, invoice_number = v_number,');

  if v_new = v_def then
    raise exception 'No se ha podido aplicar la congelación del snapshot en fin_issue_invoice';
  end if;

  execute v_new;
end $mig$;
