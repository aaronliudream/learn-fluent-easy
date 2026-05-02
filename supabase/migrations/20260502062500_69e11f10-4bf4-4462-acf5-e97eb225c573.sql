CREATE OR REPLACE FUNCTION public._elo_delta(_my integer, _opp integer, _score double precision, _k integer DEFAULT 32)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT round(_k * (_score - 1.0 / (1.0 + power(10::double precision, (_opp - _my) / 400.0))))::integer
$$;