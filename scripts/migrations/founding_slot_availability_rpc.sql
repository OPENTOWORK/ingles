-- Contador público de plazas founding: lectura atómica vía RPC (sin caché de filas).
CREATE OR REPLACE FUNCTION public.get_public_founding_slot_availability()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total', 50,
    'claimed', (SELECT count(*)::int FROM public.founding_member_grants),
    'remaining', GREATEST(0, 50 - (SELECT count(*)::int FROM public.founding_member_grants)),
    'soldOut', (SELECT count(*)::int FROM public.founding_member_grants) >= 50
  );
$$;

REVOKE ALL ON FUNCTION public.get_public_founding_slot_availability() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_founding_slot_availability() TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
