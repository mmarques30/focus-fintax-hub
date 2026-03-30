
ALTER TABLE public.leads ADD COLUMN token uuid DEFAULT gen_random_uuid() UNIQUE;
UPDATE public.leads SET token = gen_random_uuid() WHERE token IS NULL;
ALTER TABLE public.leads ALTER COLUMN token SET NOT NULL;

CREATE OR REPLACE FUNCTION public.get_diagnostico_by_token(_token uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'lead', row_to_json(l),
    'relatorio', row_to_json(r)
  ) INTO result
  FROM leads l
  LEFT JOIN relatorios_leads r ON r.lead_id = l.id
  WHERE l.token = _token
  ORDER BY r.criado_em DESC
  LIMIT 1;
  
  RETURN result;
END;
$$;
