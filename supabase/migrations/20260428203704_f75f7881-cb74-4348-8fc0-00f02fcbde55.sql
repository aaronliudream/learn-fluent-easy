CREATE TABLE public.generated_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  level INTEGER NOT NULL,
  unit INTEGER NOT NULL,
  lesson INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, level, unit, lesson)
);

ALTER TABLE public.generated_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated lessons"
ON public.generated_lessons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated lessons"
ON public.generated_lessons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated lessons"
ON public.generated_lessons FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated lessons"
ON public.generated_lessons FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_generated_lessons_user ON public.generated_lessons(user_id, level, unit, lesson);

CREATE TRIGGER update_generated_lessons_updated_at
BEFORE UPDATE ON public.generated_lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();