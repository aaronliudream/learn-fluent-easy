
-- 1. Add lineage columns to grammar_points
ALTER TABLE public.grammar_points
  ADD COLUMN IF NOT EXISTS legacy_table TEXT,
  ADD COLUMN IF NOT EXISTS legacy_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_grammar_points_legacy
  ON public.grammar_points(legacy_table, legacy_id)
  WHERE legacy_table IS NOT NULL;

-- 2. Backfill JUNIOR points
INSERT INTO public.grammar_points (slug, stage, grade, category, name, sort_order, legacy_table, legacy_id)
SELECT
  'junior:' || p.code,
  'junior',
  CASE WHEN p.grade IS NULL THEN NULL ELSE '初' || p.grade::text END,
  COALESCE(c.name_cn, '其他'),
  p.title,
  p.sort_order,
  'junior_grammar_points',
  p.id
FROM public.junior_grammar_points p
LEFT JOIN public.junior_grammar_categories c ON c.id = p.category_id
ON CONFLICT (slug) DO NOTHING;

-- 3. Backfill GAOKAO points (re-key existing virtual-language placeholders won't conflict because slugs differ)
INSERT INTO public.grammar_points (slug, stage, grade, category, name, sort_order, legacy_table, legacy_id)
SELECT
  'gaokao:' || p.slug,
  'gaokao',
  m.name_cn,
  COALESCE(c.name_cn, m.name_cn, '其他'),
  p.title,
  p.sort_order,
  'gaokao_grammar_points',
  p.id
FROM public.gaokao_grammar_points p
LEFT JOIN public.gaokao_grammar_modules m ON m.id = p.module_id
LEFT JOIN public.gaokao_grammar_categories c ON c.id = p.category_id
ON CONFLICT (slug) DO NOTHING;

-- 4. Triggers to keep grammar_points in sync with the source-of-truth tables
CREATE OR REPLACE FUNCTION public.sync_junior_grammar_point()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cat TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM public.grammar_points WHERE legacy_table='junior_grammar_points' AND legacy_id = OLD.id;
    RETURN OLD;
  END IF;
  SELECT name_cn INTO v_cat FROM public.junior_grammar_categories WHERE id = NEW.category_id;
  INSERT INTO public.grammar_points (slug, stage, grade, category, name, sort_order, legacy_table, legacy_id)
  VALUES (
    'junior:' || NEW.code, 'junior',
    CASE WHEN NEW.grade IS NULL THEN NULL ELSE '初' || NEW.grade::text END,
    COALESCE(v_cat, '其他'), NEW.title, NEW.sort_order,
    'junior_grammar_points', NEW.id
  )
  ON CONFLICT (slug) DO UPDATE SET
    stage = EXCLUDED.stage, grade = EXCLUDED.grade, category = EXCLUDED.category,
    name = EXCLUDED.name, sort_order = EXCLUDED.sort_order,
    legacy_table = EXCLUDED.legacy_table, legacy_id = EXCLUDED.legacy_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_gaokao_grammar_point()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cat TEXT; v_grade TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    DELETE FROM public.grammar_points WHERE legacy_table='gaokao_grammar_points' AND legacy_id = OLD.id;
    RETURN OLD;
  END IF;
  SELECT name_cn INTO v_grade FROM public.gaokao_grammar_modules WHERE id = NEW.module_id;
  SELECT name_cn INTO v_cat   FROM public.gaokao_grammar_categories WHERE id = NEW.category_id;
  INSERT INTO public.grammar_points (slug, stage, grade, category, name, sort_order, legacy_table, legacy_id)
  VALUES (
    'gaokao:' || NEW.slug, 'gaokao', v_grade,
    COALESCE(v_cat, v_grade, '其他'), NEW.title, NEW.sort_order,
    'gaokao_grammar_points', NEW.id
  )
  ON CONFLICT (slug) DO UPDATE SET
    stage = EXCLUDED.stage, grade = EXCLUDED.grade, category = EXCLUDED.category,
    name = EXCLUDED.name, sort_order = EXCLUDED.sort_order,
    legacy_table = EXCLUDED.legacy_table, legacy_id = EXCLUDED.legacy_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_junior_gp ON public.junior_grammar_points;
CREATE TRIGGER trg_sync_junior_gp
AFTER INSERT OR UPDATE OR DELETE ON public.junior_grammar_points
FOR EACH ROW EXECUTE FUNCTION public.sync_junior_grammar_point();

DROP TRIGGER IF EXISTS trg_sync_gaokao_gp ON public.gaokao_grammar_points;
CREATE TRIGGER trg_sync_gaokao_gp
AFTER INSERT OR UPDATE OR DELETE ON public.gaokao_grammar_points
FOR EACH ROW EXECUTE FUNCTION public.sync_gaokao_grammar_point();
