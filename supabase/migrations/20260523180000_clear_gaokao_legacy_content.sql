-- Clear legacy 高中 grammar/reading content. App now uses src/data/gaokao (人教版 PEP).
-- Vocab and other gaokao modules are unchanged.

DELETE FROM public.gaokao_reading_article_vocab;
DELETE FROM public.gaokao_reading_article_questions;
DELETE FROM public.gaokao_reading_diagnostics;
DELETE FROM public.gaokao_reading_sessions;
DELETE FROM public.gaokao_reading_articles;

DELETE FROM public.gaokao_reading_questions;
DELETE FROM public.gaokao_reading_passages;

DELETE FROM public.gaokao_grammar_questions;
DELETE FROM public.gaokao_grammar_points;
DELETE FROM public.gaokao_grammar_categories;
DELETE FROM public.gaokao_grammar_modules;

COMMENT ON TABLE public.gaokao_grammar_points IS 'Deprecated for content; high-school grammar served from bundled PEP JSON until re-seeded.';
