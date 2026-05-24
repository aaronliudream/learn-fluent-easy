/**
 * @deprecated Use gaokaoContent / pep-bundle.json. Re-export for legacy imports.
 */
import pepBundle from "@/data/gaokao/pep-bundle.json";
import type { GrammarQuestion } from "@/components/grammar/GrammarQuestionCard";

export const GAOKAO_GRAMMAR_QUESTIONS = pepBundle.grammarQuestions as Record<string, GrammarQuestion[]>;
