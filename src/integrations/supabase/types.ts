export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_slang: {
        Row: {
          created_at: string
          example: string
          example_cn: string
          fetch_date: string
          id: string
          meaning_cn: string
          meaning_en: string
          phrase: string
          source_hint: string | null
        }
        Insert: {
          created_at?: string
          example: string
          example_cn: string
          fetch_date?: string
          id?: string
          meaning_cn: string
          meaning_en: string
          phrase: string
          source_hint?: string | null
        }
        Update: {
          created_at?: string
          example?: string
          example_cn?: string
          fetch_date?: string
          id?: string
          meaning_cn?: string
          meaning_en?: string
          phrase?: string
          source_hint?: string | null
        }
        Relationships: []
      }
      dialogue_key_phrases: {
        Row: {
          content_hash: string
          created_at: string
          dialogue_key: string
          id: string
          phrases: Json
        }
        Insert: {
          content_hash: string
          created_at?: string
          dialogue_key: string
          id?: string
          phrases: Json
        }
        Update: {
          content_hash?: string
          created_at?: string
          dialogue_key?: string
          id?: string
          phrases?: Json
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      expression_reviews: {
        Row: {
          created_at: string
          due_at: string
          ease: number
          id: string
          interval_days: number
          lapses: number
          last_reviewed_at: string | null
          phrase: string
          phrase_cn: string | null
          source_key: string | null
          source_line_cn: string | null
          source_line_en: string | null
          streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_at?: string
          ease?: number
          id?: string
          interval_days?: number
          lapses?: number
          last_reviewed_at?: string | null
          phrase: string
          phrase_cn?: string | null
          source_key?: string | null
          source_line_cn?: string | null
          source_line_en?: string | null
          streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_at?: string
          ease?: number
          id?: string
          interval_days?: number
          lapses?: number
          last_reviewed_at?: string | null
          phrase?: string
          phrase_cn?: string | null
          source_key?: string | null
          source_line_cn?: string | null
          source_line_en?: string | null
          streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gaokao_ability_estimates: {
        Row: {
          cefr: string | null
          id: string
          last_session_id: string | null
          mastery_pct: number | null
          scope_id: string | null
          scope_type: string
          theta: number
          theta_se: number
          updated_at: string
          user_id: string
          weakest_kp_ids: Json | null
        }
        Insert: {
          cefr?: string | null
          id?: string
          last_session_id?: string | null
          mastery_pct?: number | null
          scope_id?: string | null
          scope_type: string
          theta?: number
          theta_se?: number
          updated_at?: string
          user_id: string
          weakest_kp_ids?: Json | null
        }
        Update: {
          cefr?: string | null
          id?: string
          last_session_id?: string | null
          mastery_pct?: number | null
          scope_id?: string | null
          scope_type?: string
          theta?: number
          theta_se?: number
          updated_at?: string
          user_id?: string
          weakest_kp_ids?: Json | null
        }
        Relationships: []
      }
      gaokao_cloze_blanks: {
        Row: {
          blank_no: number
          correct_answer: string
          created_at: string
          difficulty: number
          explanation_a: string | null
          explanation_b: string | null
          explanation_c: string | null
          explanation_d: string | null
          general_explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          passage_id: string
          pos_tag: string | null
          skill_method: string | null
          skill_tag: string | null
        }
        Insert: {
          blank_no: number
          correct_answer: string
          created_at?: string
          difficulty?: number
          explanation_a?: string | null
          explanation_b?: string | null
          explanation_c?: string | null
          explanation_d?: string | null
          general_explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          passage_id: string
          pos_tag?: string | null
          skill_method?: string | null
          skill_tag?: string | null
        }
        Update: {
          blank_no?: number
          correct_answer?: string
          created_at?: string
          difficulty?: number
          explanation_a?: string | null
          explanation_b?: string | null
          explanation_c?: string | null
          explanation_d?: string | null
          general_explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          passage_id?: string
          pos_tag?: string | null
          skill_method?: string | null
          skill_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_cloze_blanks_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "gaokao_cloze_passages"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_cloze_passages: {
        Row: {
          article_analysis: string | null
          blank_count: number
          body_with_placeholders: string
          chapter_name: string | null
          chapter_no: number
          created_at: string
          difficulty: number
          exam_points: string | null
          genre: string | null
          id: string
          is_published: boolean
          passage_no: number
          recommended_minutes: number
          sort_order: number
          source_book: string
          source_book_label: string
          title: string
          topic: string | null
          topic_group: string | null
          translation_zh: string | null
          updated_at: string
          vocab_notes: string | null
          word_count: number | null
        }
        Insert: {
          article_analysis?: string | null
          blank_count?: number
          body_with_placeholders: string
          chapter_name?: string | null
          chapter_no?: number
          created_at?: string
          difficulty?: number
          exam_points?: string | null
          genre?: string | null
          id?: string
          is_published?: boolean
          passage_no: number
          recommended_minutes?: number
          sort_order?: number
          source_book?: string
          source_book_label?: string
          title: string
          topic?: string | null
          topic_group?: string | null
          translation_zh?: string | null
          updated_at?: string
          vocab_notes?: string | null
          word_count?: number | null
        }
        Update: {
          article_analysis?: string | null
          blank_count?: number
          body_with_placeholders?: string
          chapter_name?: string | null
          chapter_no?: number
          created_at?: string
          difficulty?: number
          exam_points?: string | null
          genre?: string | null
          id?: string
          is_published?: boolean
          passage_no?: number
          recommended_minutes?: number
          sort_order?: number
          source_book?: string
          source_book_label?: string
          title?: string
          topic?: string | null
          topic_group?: string | null
          translation_zh?: string | null
          updated_at?: string
          vocab_notes?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      gaokao_cloze_sessions: {
        Row: {
          answers: Json
          correct_count: number
          created_at: string
          duration_seconds: number | null
          id: string
          passage_id: string
          score_pct: number | null
          started_at: string
          status: string
          submitted_at: string | null
          total_blanks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          correct_count?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          passage_id: string
          score_pct?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_blanks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          correct_count?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          passage_id?: string
          score_pct?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_blanks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_cloze_sessions_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "gaokao_cloze_passages"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_diagnostic_sessions: {
        Row: {
          answered_question_ids: Json
          completed_at: string | null
          correct_count: number
          duration_seconds: number | null
          final_cefr: string | null
          id: string
          module_scores: Json | null
          questions_answered: number
          response_log: Json
          scope_id: string | null
          session_type: string
          started_at: string
          status: string
          theta: number
          theta_se: number
          user_id: string
          weakest_kp_ids: Json | null
        }
        Insert: {
          answered_question_ids?: Json
          completed_at?: string | null
          correct_count?: number
          duration_seconds?: number | null
          final_cefr?: string | null
          id?: string
          module_scores?: Json | null
          questions_answered?: number
          response_log?: Json
          scope_id?: string | null
          session_type?: string
          started_at?: string
          status?: string
          theta?: number
          theta_se?: number
          user_id: string
          weakest_kp_ids?: Json | null
        }
        Update: {
          answered_question_ids?: Json
          completed_at?: string | null
          correct_count?: number
          duration_seconds?: number | null
          final_cefr?: string | null
          id?: string
          module_scores?: Json | null
          questions_answered?: number
          response_log?: Json
          scope_id?: string | null
          session_type?: string
          started_at?: string
          status?: string
          theta?: number
          theta_se?: number
          user_id?: string
          weakest_kp_ids?: Json | null
        }
        Relationships: []
      }
      gaokao_grammar_categories: {
        Row: {
          code: string
          created_at: string
          description_cn: string | null
          difficulty: number
          exam_frequency: string | null
          id: string
          module_id: string
          name_cn: string
          name_en: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          description_cn?: string | null
          difficulty?: number
          exam_frequency?: string | null
          id?: string
          module_id: string
          name_cn: string
          name_en: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          description_cn?: string | null
          difficulty?: number
          exam_frequency?: string | null
          id?: string
          module_id?: string
          name_cn?: string
          name_en?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_grammar_categories_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "gaokao_grammar_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_grammar_modules: {
        Row: {
          code: string
          created_at: string
          description_cn: string | null
          emoji: string | null
          id: string
          name_cn: string
          name_en: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          description_cn?: string | null
          emoji?: string | null
          id?: string
          name_cn: string
          name_en: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          description_cn?: string | null
          emoji?: string | null
          id?: string
          name_cn?: string
          name_en?: string
          sort_order?: number
        }
        Relationships: []
      }
      gaokao_grammar_points: {
        Row: {
          category_id: string | null
          common_mistake: string | null
          created_at: string
          difficulty: number
          exam_frequency: string | null
          explanation: string | null
          id: string
          irt_avg_difficulty: number | null
          kp_id: string | null
          module_id: string | null
          parent_id: string | null
          prerequisite: string | null
          question_count: number
          slug: string
          sort_order: number
          source_code: string | null
          title: string
          typical_example: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          common_mistake?: string | null
          created_at?: string
          difficulty?: number
          exam_frequency?: string | null
          explanation?: string | null
          id?: string
          irt_avg_difficulty?: number | null
          kp_id?: string | null
          module_id?: string | null
          parent_id?: string | null
          prerequisite?: string | null
          question_count?: number
          slug: string
          sort_order?: number
          source_code?: string | null
          title: string
          typical_example?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          common_mistake?: string | null
          created_at?: string
          difficulty?: number
          exam_frequency?: string | null
          explanation?: string | null
          id?: string
          irt_avg_difficulty?: number | null
          kp_id?: string | null
          module_id?: string | null
          parent_id?: string | null
          prerequisite?: string | null
          question_count?: number
          slug?: string
          sort_order?: number
          source_code?: string | null
          title?: string
          typical_example?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_grammar_points_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gaokao_grammar_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaokao_grammar_points_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "gaokao_grammar_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaokao_grammar_points_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "gaokao_grammar_points"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_grammar_questions: {
        Row: {
          blank_index: number | null
          bloom_level: number | null
          correct_answer: string
          created_at: string
          difficulty: number
          distractor_analysis: string | null
          explanation: string
          id: string
          irt_difficulty: number | null
          irt_discrimination: number | null
          irt_guessing: number | null
          kp_ids: Json | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          passage: string | null
          point_id: string
          question_type: string
          source_label: string | null
          source_qid: string | null
          stem: string
        }
        Insert: {
          blank_index?: number | null
          bloom_level?: number | null
          correct_answer: string
          created_at?: string
          difficulty?: number
          distractor_analysis?: string | null
          explanation: string
          id?: string
          irt_difficulty?: number | null
          irt_discrimination?: number | null
          irt_guessing?: number | null
          kp_ids?: Json | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          passage?: string | null
          point_id: string
          question_type?: string
          source_label?: string | null
          source_qid?: string | null
          stem: string
        }
        Update: {
          blank_index?: number | null
          bloom_level?: number | null
          correct_answer?: string
          created_at?: string
          difficulty?: number
          distractor_analysis?: string | null
          explanation?: string
          id?: string
          irt_difficulty?: number | null
          irt_discrimination?: number | null
          irt_guessing?: number | null
          kp_ids?: Json | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          passage?: string | null
          point_id?: string
          question_type?: string
          source_label?: string | null
          source_qid?: string | null
          stem?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_grammar_questions_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "gaokao_grammar_points"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_reading_article_questions: {
        Row: {
          article_id: string
          correct_answer: string
          created_at: string
          difficulty: number
          distractor_pattern: string | null
          error_tags: Json
          explanation_a: string | null
          explanation_b: string | null
          explanation_c: string | null
          explanation_d: string | null
          general_explanation: string | null
          id: string
          key_sentence: string | null
          locate_paragraph: number | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_type: string
          question_type_cn: string | null
          skill_focus: string | null
          sort_order: number
          stem: string
        }
        Insert: {
          article_id: string
          correct_answer: string
          created_at?: string
          difficulty?: number
          distractor_pattern?: string | null
          error_tags?: Json
          explanation_a?: string | null
          explanation_b?: string | null
          explanation_c?: string | null
          explanation_d?: string | null
          general_explanation?: string | null
          id?: string
          key_sentence?: string | null
          locate_paragraph?: number | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_type: string
          question_type_cn?: string | null
          skill_focus?: string | null
          sort_order?: number
          stem: string
        }
        Update: {
          article_id?: string
          correct_answer?: string
          created_at?: string
          difficulty?: number
          distractor_pattern?: string | null
          error_tags?: Json
          explanation_a?: string | null
          explanation_b?: string | null
          explanation_c?: string | null
          explanation_d?: string | null
          general_explanation?: string | null
          id?: string
          key_sentence?: string | null
          locate_paragraph?: number | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_type?: string
          question_type_cn?: string | null
          skill_focus?: string | null
          sort_order?: number
          stem?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_reading_article_questions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "gaokao_reading_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_reading_article_vocab: {
        Row: {
          article_id: string
          category: string
          created_at: string
          example_cn: string | null
          example_en: string | null
          id: string
          importance: number
          meaning_cn: string
          meaning_en: string | null
          phonetic: string | null
          pos: string | null
          sort_order: number
          word: string
        }
        Insert: {
          article_id: string
          category?: string
          created_at?: string
          example_cn?: string | null
          example_en?: string | null
          id?: string
          importance?: number
          meaning_cn: string
          meaning_en?: string | null
          phonetic?: string | null
          pos?: string | null
          sort_order?: number
          word: string
        }
        Update: {
          article_id?: string
          category?: string
          created_at?: string
          example_cn?: string | null
          example_en?: string | null
          id?: string
          importance?: number
          meaning_cn?: string
          meaning_en?: string | null
          phonetic?: string | null
          pos?: string | null
          sort_order?: number
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_reading_article_vocab_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "gaokao_reading_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_reading_articles: {
        Row: {
          argumentation_logic: string | null
          avg_sentence_length: number | null
          avg_word_length: number | null
          body: string
          cefr_level: string | null
          core_question_types: string | null
          created_at: string
          difficulty: number
          exam_strategies: string | null
          genre: string
          genre_label: string | null
          grade_band: string
          id: string
          is_published: boolean
          lexile_score: number | null
          paragraph_structure: string | null
          readability_grade: number | null
          recommended_minutes: number
          sort_order: number
          source_label: string | null
          specific_topic: string
          sub_band: string | null
          theme_context: string
          title: string
          topic_connection: string | null
          topic_group: string
          updated_at: string
          useful_sentences: Json | null
          word_count: number
          writing_techniques: string | null
        }
        Insert: {
          argumentation_logic?: string | null
          avg_sentence_length?: number | null
          avg_word_length?: number | null
          body: string
          cefr_level?: string | null
          core_question_types?: string | null
          created_at?: string
          difficulty?: number
          exam_strategies?: string | null
          genre: string
          genre_label?: string | null
          grade_band: string
          id?: string
          is_published?: boolean
          lexile_score?: number | null
          paragraph_structure?: string | null
          readability_grade?: number | null
          recommended_minutes?: number
          sort_order?: number
          source_label?: string | null
          specific_topic: string
          sub_band?: string | null
          theme_context: string
          title: string
          topic_connection?: string | null
          topic_group: string
          updated_at?: string
          useful_sentences?: Json | null
          word_count: number
          writing_techniques?: string | null
        }
        Update: {
          argumentation_logic?: string | null
          avg_sentence_length?: number | null
          avg_word_length?: number | null
          body?: string
          cefr_level?: string | null
          core_question_types?: string | null
          created_at?: string
          difficulty?: number
          exam_strategies?: string | null
          genre?: string
          genre_label?: string | null
          grade_band?: string
          id?: string
          is_published?: boolean
          lexile_score?: number | null
          paragraph_structure?: string | null
          readability_grade?: number | null
          recommended_minutes?: number
          sort_order?: number
          source_label?: string | null
          specific_topic?: string
          sub_band?: string | null
          theme_context?: string
          title?: string
          topic_connection?: string | null
          topic_group?: string
          updated_at?: string
          useful_sentences?: Json | null
          word_count?: number
          writing_techniques?: string | null
        }
        Relationships: []
      }
      gaokao_reading_diagnostics: {
        Row: {
          article_id: string
          confidence: number | null
          correct_answer: string
          created_at: string
          error_tags: Json
          id: string
          is_correct: boolean
          question_id: string
          question_type: string
          reading_seconds: number | null
          reading_wpm: number | null
          skill_focus: string | null
          time_spent_seconds: number | null
          user_answer: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          confidence?: number | null
          correct_answer: string
          created_at?: string
          error_tags?: Json
          id?: string
          is_correct: boolean
          question_id: string
          question_type: string
          reading_seconds?: number | null
          reading_wpm?: number | null
          skill_focus?: string | null
          time_spent_seconds?: number | null
          user_answer?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          confidence?: number | null
          correct_answer?: string
          created_at?: string
          error_tags?: Json
          id?: string
          is_correct?: boolean
          question_id?: string
          question_type?: string
          reading_seconds?: number | null
          reading_wpm?: number | null
          skill_focus?: string | null
          time_spent_seconds?: number | null
          user_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gaokao_reading_knowledge_points: {
        Row: {
          category_code: string
          category_name: string
          created_at: string
          difficulty: number | null
          exam_frequency: string | null
          example: string | null
          extra: Json | null
          grade_band: string
          id: string
          level1: string | null
          level2: string | null
          level3: string
          pitfall: string | null
          prerequisite: string | null
          source_id: string
          strategy: string | null
        }
        Insert: {
          category_code: string
          category_name: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          example?: string | null
          extra?: Json | null
          grade_band?: string
          id?: string
          level1?: string | null
          level2?: string | null
          level3: string
          pitfall?: string | null
          prerequisite?: string | null
          source_id: string
          strategy?: string | null
        }
        Update: {
          category_code?: string
          category_name?: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          example?: string | null
          extra?: Json | null
          grade_band?: string
          id?: string
          level1?: string | null
          level2?: string | null
          level3?: string
          pitfall?: string | null
          prerequisite?: string | null
          source_id?: string
          strategy?: string | null
        }
        Relationships: []
      }
      gaokao_reading_passages: {
        Row: {
          body: string
          created_at: string
          difficulty: number
          id: string
          structure_analysis: string | null
          title: string
          topic: string | null
          word_count: number | null
        }
        Insert: {
          body: string
          created_at?: string
          difficulty?: number
          id?: string
          structure_analysis?: string | null
          title: string
          topic?: string | null
          word_count?: number | null
        }
        Update: {
          body?: string
          created_at?: string
          difficulty?: number
          id?: string
          structure_analysis?: string | null
          title?: string
          topic?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      gaokao_reading_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation_a: string | null
          explanation_b: string | null
          explanation_c: string | null
          explanation_d: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          passage_id: string
          question_type: string
          sort_order: number
          stem: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation_a?: string | null
          explanation_b?: string | null
          explanation_c?: string | null
          explanation_d?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          passage_id: string
          question_type?: string
          sort_order?: number
          stem: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation_a?: string | null
          explanation_b?: string | null
          explanation_c?: string | null
          explanation_d?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          passage_id?: string
          question_type?: string
          sort_order?: number
          stem?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_reading_questions_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "gaokao_reading_passages"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_reading_seed_questions: {
        Row: {
          correct_answer: string
          created_at: string
          distractor_analysis: string | null
          explanation: string | null
          grade_band: string
          id: string
          irt_difficulty: number | null
          options: Json
          passage: string
          question_type: string
          related_kp: string | null
          source: string | null
          source_id: string
          stem: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          distractor_analysis?: string | null
          explanation?: string | null
          grade_band?: string
          id?: string
          irt_difficulty?: number | null
          options: Json
          passage: string
          question_type: string
          related_kp?: string | null
          source?: string | null
          source_id: string
          stem: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          distractor_analysis?: string | null
          explanation?: string | null
          grade_band?: string
          id?: string
          irt_difficulty?: number | null
          options?: Json
          passage?: string
          question_type?: string
          related_kp?: string | null
          source?: string | null
          source_id?: string
          stem?: string
        }
        Relationships: []
      }
      gaokao_reading_sessions: {
        Row: {
          annotations: Json | null
          answers: Json
          article_id: string
          correct_count: number
          created_at: string
          duration_seconds: number | null
          id: string
          score_pct: number | null
          started_at: string
          status: string
          submitted_at: string | null
          total_questions: number
          type_breakdown: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annotations?: Json | null
          answers?: Json
          article_id: string
          correct_count?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          score_pct?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_questions?: number
          type_breakdown?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annotations?: Json | null
          answers?: Json
          article_id?: string
          correct_count?: number
          created_at?: string
          duration_seconds?: number | null
          id?: string
          score_pct?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          total_questions?: number
          type_breakdown?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_reading_sessions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "gaokao_reading_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_reading_signal_words: {
        Row: {
          category: string
          created_at: string
          difficulty: number | null
          exam_frequency: string | null
          id: string
          remark: string | null
          semantic: string | null
          source_id: string
          usage_note: string | null
          word: string
        }
        Insert: {
          category: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          id?: string
          remark?: string | null
          semantic?: string | null
          source_id: string
          usage_note?: string | null
          word: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          id?: string
          remark?: string | null
          semantic?: string | null
          source_id?: string
          usage_note?: string | null
          word?: string
        }
        Relationships: []
      }
      gaokao_reading_topics: {
        Row: {
          big_topic: string
          created_at: string
          difficulty: number | null
          exam_angle: string | null
          exam_frequency: string | null
          high_freq_words: string | null
          id: string
          remark: string | null
          source_id: string
          sub_topic: string | null
        }
        Insert: {
          big_topic: string
          created_at?: string
          difficulty?: number | null
          exam_angle?: string | null
          exam_frequency?: string | null
          high_freq_words?: string | null
          id?: string
          remark?: string | null
          source_id: string
          sub_topic?: string | null
        }
        Update: {
          big_topic?: string
          created_at?: string
          difficulty?: number | null
          exam_angle?: string | null
          exam_frequency?: string | null
          high_freq_words?: string | null
          id?: string
          remark?: string | null
          source_id?: string
          sub_topic?: string | null
        }
        Relationships: []
      }
      gaokao_user_attempts: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          question_type: string
          time_spent_seconds: number | null
          user_answer: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          question_type: string
          time_spent_seconds?: number | null
          user_answer?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          question_type?: string
          time_spent_seconds?: number | null
          user_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gaokao_user_mastery: {
        Row: {
          correct_count: number
          created_at: string
          difficulty: number
          due_at: string | null
          id: string
          item_id: string
          item_type: string
          lapses: number
          last_grade: number | null
          last_latency_ms: number | null
          last_result: string | null
          last_seen_at: string | null
          mastery_level: number
          mastery_matrix: Json
          next_review_at: string | null
          reached_master_at: string | null
          retention_check_at: string | null
          stability: number
          updated_at: string
          user_id: string
          wrong_count: number
        }
        Insert: {
          correct_count?: number
          created_at?: string
          difficulty?: number
          due_at?: string | null
          id?: string
          item_id: string
          item_type: string
          lapses?: number
          last_grade?: number | null
          last_latency_ms?: number | null
          last_result?: string | null
          last_seen_at?: string | null
          mastery_level?: number
          mastery_matrix?: Json
          next_review_at?: string | null
          reached_master_at?: string | null
          retention_check_at?: string | null
          stability?: number
          updated_at?: string
          user_id: string
          wrong_count?: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          difficulty?: number
          due_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          lapses?: number
          last_grade?: number | null
          last_latency_ms?: number | null
          last_result?: string | null
          last_seen_at?: string | null
          mastery_level?: number
          mastery_matrix?: Json
          next_review_at?: string | null
          reached_master_at?: string | null
          retention_check_at?: string | null
          stability?: number
          updated_at?: string
          user_id?: string
          wrong_count?: number
        }
        Relationships: []
      }
      gaokao_user_mistakes: {
        Row: {
          correct_answer: string | null
          created_at: string
          id: string
          is_resolved: boolean
          is_starred: boolean
          item_id: string
          last_wrong_at: string
          module: string
          next_review_at: string
          parent_id: string | null
          parent_label: string | null
          snapshot: Json
          updated_at: string
          user_answer: string | null
          user_id: string
          wrong_count: number
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean
          is_starred?: boolean
          item_id: string
          last_wrong_at?: string
          module: string
          next_review_at?: string
          parent_id?: string | null
          parent_label?: string | null
          snapshot?: Json
          updated_at?: string
          user_answer?: string | null
          user_id: string
          wrong_count?: number
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          id?: string
          is_resolved?: boolean
          is_starred?: boolean
          item_id?: string
          last_wrong_at?: string
          module?: string
          next_review_at?: string
          parent_id?: string | null
          parent_label?: string | null
          snapshot?: Json
          updated_at?: string
          user_answer?: string | null
          user_id?: string
          wrong_count?: number
        }
        Relationships: []
      }
      gaokao_vocab: {
        Row: {
          accent: string | null
          cet_level: string | null
          created_at: string
          exam_frequency: number | null
          example_cn: string | null
          example_en: string | null
          freq_rank: number | null
          frequency_band: number
          gaokao_level: number | null
          id: string
          is_hot_topic: boolean | null
          meaning_cn: string
          meaning_en: string | null
          phonetic: string | null
          pos: string | null
          sort_order: number
          star_level: number
          sub_theme: string | null
          synonyms: Json | null
          tags: Json | null
          theme: string | null
          word: string
        }
        Insert: {
          accent?: string | null
          cet_level?: string | null
          created_at?: string
          exam_frequency?: number | null
          example_cn?: string | null
          example_en?: string | null
          freq_rank?: number | null
          frequency_band?: number
          gaokao_level?: number | null
          id?: string
          is_hot_topic?: boolean | null
          meaning_cn: string
          meaning_en?: string | null
          phonetic?: string | null
          pos?: string | null
          sort_order?: number
          star_level?: number
          sub_theme?: string | null
          synonyms?: Json | null
          tags?: Json | null
          theme?: string | null
          word: string
        }
        Update: {
          accent?: string | null
          cet_level?: string | null
          created_at?: string
          exam_frequency?: number | null
          example_cn?: string | null
          example_en?: string | null
          freq_rank?: number | null
          frequency_band?: number
          gaokao_level?: number | null
          id?: string
          is_hot_topic?: boolean | null
          meaning_cn?: string
          meaning_en?: string | null
          phonetic?: string | null
          pos?: string | null
          sort_order?: number
          star_level?: number
          sub_theme?: string | null
          synonyms?: Json | null
          tags?: Json | null
          theme?: string | null
          word?: string
        }
        Relationships: []
      }
      gaokao_vocab_themes: {
        Row: {
          code: string
          created_at: string
          description_cn: string | null
          emoji: string
          is_hot: boolean
          name_cn: string
          name_en: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          description_cn?: string | null
          emoji: string
          is_hot?: boolean
          name_cn: string
          name_en: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          description_cn?: string | null
          emoji?: string
          is_hot?: boolean
          name_cn?: string
          name_en?: string
          sort_order?: number
        }
        Relationships: []
      }
      generated_lessons: {
        Row: {
          content: Json
          created_at: string
          id: string
          lesson: number
          level: number
          unit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          lesson: number
          level: number
          unit: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          lesson?: number
          level?: number
          unit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          lesson_key: string | null
          metadata: Json | null
          quiz_correct: number | null
          quiz_total: number | null
          study_minutes: number | null
          user_id: string
          vocab_count: number | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          lesson_key?: string | null
          metadata?: Json | null
          quiz_correct?: number | null
          quiz_total?: number | null
          study_minutes?: number | null
          user_id: string
          vocab_count?: number | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          lesson_key?: string | null
          metadata?: Json | null
          quiz_correct?: number | null
          quiz_total?: number | null
          study_minutes?: number | null
          user_id?: string
          vocab_count?: number | null
        }
        Relationships: []
      }
      line_rewrites: {
        Row: {
          created_at: string
          id: string
          normalized: string
          original: string
          rewrites: Json
          target_lang: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          normalized: string
          original: string
          rewrites: Json
          target_lang?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          normalized?: string
          original?: string
          rewrites?: Json
          target_lang?: string
          updated_at?: string
        }
        Relationships: []
      }
      phrase_explanations: {
        Row: {
          created_at: string
          explanation: Json
          id: string
          normalized: string
          phrase: string
          source_lang: string
          target_lang: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explanation: Json
          id?: string
          normalized: string
          phrase: string
          source_lang?: string
          target_lang?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explanation?: Json
          id?: string
          normalized?: string
          phrase?: string
          source_lang?: string
          target_lang?: string
          updated_at?: string
        }
        Relationships: []
      }
      placement_results: {
        Row: {
          ability: number
          ai_report: Json | null
          by_section: Json
          cefr: string
          created_at: string
          duration_seconds: number | null
          id: string
          question_log: Json
          recommended_level: number
          updated_at: string
          user_id: string
          weakest: string[]
          weighted: number
        }
        Insert: {
          ability: number
          ai_report?: Json | null
          by_section: Json
          cefr: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          question_log?: Json
          recommended_level: number
          updated_at?: string
          user_id: string
          weakest?: string[]
          weighted: number
        }
        Update: {
          ability?: number
          ai_report?: Json | null
          by_section?: Json
          cefr?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          question_log?: Json
          recommended_level?: number
          updated_at?: string
          user_id?: string
          weakest?: string[]
          weighted?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          last_weekly_report_at: string | null
          leaderboard_alias: string | null
          leaderboard_opt_in: boolean
          preferred_language: string | null
          target_language: string
          updated_at: string
          user_id: string
          weekly_report_enabled: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          last_weekly_report_at?: string | null
          leaderboard_alias?: string | null
          leaderboard_opt_in?: boolean
          preferred_language?: string | null
          target_language?: string
          updated_at?: string
          user_id: string
          weekly_report_enabled?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          last_weekly_report_at?: string | null
          leaderboard_alias?: string | null
          leaderboard_opt_in?: boolean
          preferred_language?: string | null
          target_language?: string
          updated_at?: string
          user_id?: string
          weekly_report_enabled?: boolean
        }
        Relationships: []
      }
      saved_phrases: {
        Row: {
          context_text: string | null
          created_at: string
          id: string
          normalized: string
          phrase: string
          source: string | null
          user_id: string
        }
        Insert: {
          context_text?: string | null
          created_at?: string
          id?: string
          normalized: string
          phrase: string
          source?: string | null
          user_id: string
        }
        Update: {
          context_text?: string | null
          created_at?: string
          id?: string
          normalized?: string
          phrase?: string
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      slang_mastery: {
        Row: {
          correct_count: number
          created_at: string
          id: string
          idiom_id: number
          last_correct_at: string | null
          last_result: string | null
          updated_at: string
          user_id: string
          wrong_count: number
        }
        Insert: {
          correct_count?: number
          created_at?: string
          id?: string
          idiom_id: number
          last_correct_at?: string | null
          last_result?: string | null
          updated_at?: string
          user_id: string
          wrong_count?: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          idiom_id?: number
          last_correct_at?: string | null
          last_result?: string | null
          updated_at?: string
          user_id?: string
          wrong_count?: number
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_code: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_code: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_code?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_coins: {
        Row: {
          balance: number
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mistakes: {
        Row: {
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          is_resolved: boolean
          is_starred: boolean
          last_wrong_at: string
          module: string
          next_review_at: string
          question: string
          snapshot: Json
          source_key: string
          source_label: string | null
          updated_at: string
          user_answer: string | null
          user_id: string
          wrong_count: number
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          is_resolved?: boolean
          is_starred?: boolean
          last_wrong_at?: string
          module: string
          next_review_at?: string
          question: string
          snapshot?: Json
          source_key: string
          source_label?: string | null
          updated_at?: string
          user_answer?: string | null
          user_id: string
          wrong_count?: number
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          is_resolved?: boolean
          is_starred?: boolean
          last_wrong_at?: string
          module?: string
          next_review_at?: string
          question?: string
          snapshot?: Json
          source_key?: string
          source_label?: string | null
          updated_at?: string
          user_answer?: string | null
          user_id?: string
          wrong_count?: number
        }
        Relationships: []
      }
      vocab_game_scores: {
        Row: {
          best_combo: number
          created_at: string
          difficulty: number | null
          duration_ms: number
          game_type: string
          hits: number
          id: string
          metadata: Json | null
          misses: number
          score: number
          theme: string | null
          user_id: string
        }
        Insert: {
          best_combo?: number
          created_at?: string
          difficulty?: number | null
          duration_ms?: number
          game_type: string
          hits?: number
          id?: string
          metadata?: Json | null
          misses?: number
          score?: number
          theme?: string | null
          user_id: string
        }
        Update: {
          best_combo?: number
          created_at?: string
          difficulty?: number | null
          duration_ms?: number
          game_type?: string
          hits?: number
          id?: string
          metadata?: Json | null
          misses?: number
          score?: number
          theme?: string | null
          user_id?: string
        }
        Relationships: []
      }
      word_duel_matches: {
        Row: {
          created_at: string
          duration_ms: number
          id: string
          is_bot: boolean
          is_draw: boolean
          metadata: Json
          player_a: string
          player_b: string
          questions: Json
          rating_a_after: number | null
          rating_a_before: number | null
          rating_b_after: number | null
          rating_b_before: number | null
          rating_delta_a: number | null
          rating_delta_b: number | null
          rounds: number
          score_a: number
          score_b: number
          winner: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number
          id?: string
          is_bot?: boolean
          is_draw?: boolean
          metadata?: Json
          player_a: string
          player_b: string
          questions?: Json
          rating_a_after?: number | null
          rating_a_before?: number | null
          rating_b_after?: number | null
          rating_b_before?: number | null
          rating_delta_a?: number | null
          rating_delta_b?: number | null
          rounds?: number
          score_a?: number
          score_b?: number
          winner?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number
          id?: string
          is_bot?: boolean
          is_draw?: boolean
          metadata?: Json
          player_a?: string
          player_b?: string
          questions?: Json
          rating_a_after?: number | null
          rating_a_before?: number | null
          rating_b_after?: number | null
          rating_b_before?: number | null
          rating_delta_a?: number | null
          rating_delta_b?: number | null
          rounds?: number
          score_a?: number
          score_b?: number
          winner?: string | null
        }
        Relationships: []
      }
      word_duel_queue: {
        Row: {
          joined_at: string
          match_seed: string | null
          matched_with: string | null
          rating: number
          user_id: string
        }
        Insert: {
          joined_at?: string
          match_seed?: string | null
          matched_with?: string | null
          rating: number
          user_id: string
        }
        Update: {
          joined_at?: string
          match_seed?: string | null
          matched_with?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      word_duel_ratings: {
        Row: {
          best_streak: number
          created_at: string
          current_streak: number
          draws: number
          losses: number
          matches_played: number
          peak_rating: number
          rating: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          draws?: number
          losses?: number
          matches_played?: number
          peak_rating?: number
          rating?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          draws?: number
          losses?: number
          matches_played?: number
          peak_rating?: number
          rating?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      word_quest_attempts: {
        Row: {
          completed_at: string
          hints_used: number
          id: string
          perfect: boolean
          quest_date: string
          score: number
          stage_results: Json
          stages_passed: number
          target_vocab_id: string | null
          target_word: string
          total_duration_ms: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          hints_used?: number
          id?: string
          perfect?: boolean
          quest_date: string
          score?: number
          stage_results?: Json
          stages_passed?: number
          target_vocab_id?: string | null
          target_word: string
          total_duration_ms?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          hints_used?: number
          id?: string
          perfect?: boolean
          quest_date?: string
          score?: number
          stage_results?: Json
          stages_passed?: number
          target_vocab_id?: string | null
          target_word?: string
          total_duration_ms?: number
          user_id?: string
        }
        Relationships: []
      }
      workplace_practice: {
        Row: {
          attempts: number
          cat_key: string
          created_at: string
          dialogue_id: string
          dictation_score: number
          dictation_total: number
          id: string
          last_payload: Json | null
          mastery: number
          roleplay_score: number
          roleplay_turns: number
          updated_at: string
          user_id: string
          vocab_score: number
          vocab_total: number
        }
        Insert: {
          attempts?: number
          cat_key: string
          created_at?: string
          dialogue_id: string
          dictation_score?: number
          dictation_total?: number
          id?: string
          last_payload?: Json | null
          mastery?: number
          roleplay_score?: number
          roleplay_turns?: number
          updated_at?: string
          user_id: string
          vocab_score?: number
          vocab_total?: number
        }
        Update: {
          attempts?: number
          cat_key?: string
          created_at?: string
          dialogue_id?: string
          dictation_score?: number
          dictation_total?: number
          id?: string
          last_payload?: Json | null
          mastery?: number
          roleplay_score?: number
          roleplay_turns?: number
          updated_at?: string
          user_id?: string
          vocab_score?: number
          vocab_total?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _elo_delta:
        | {
            Args: { _k?: number; _my: number; _opp: number; _score: number }
            Returns: number
          }
        | {
            Args: { _k?: number; _my: number; _opp: number; _score: number }
            Returns: number
          }
      award_coins: {
        Args: { _amount: number }
        Returns: {
          balance: number
          total_earned: number
        }[]
      }
      cancel_duel_queue: { Args: never; Returns: undefined }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      find_duel_opponent: {
        Args: { _rating_range?: number }
        Returns: {
          is_bot: boolean
          match_seed: string
          opponent_alias: string
          opponent_id: string
          opponent_rating: number
        }[]
      }
      get_duel_leaderboard: {
        Args: { _scope?: string }
        Returns: {
          alias: string
          best_streak: number
          is_me: boolean
          losses: number
          rank: number
          rating: number
          tier: string
          wins: number
        }[]
      }
      get_game_leaderboard: {
        Args: { _game_type: string; _scope?: string }
        Returns: {
          alias: string
          best_score: number
          is_me: boolean
          rank: number
          total_plays: number
        }[]
      }
      get_lexile_recommendations: {
        Args: never
        Returns: {
          article_id: string
          done_before: boolean
          genre_label: string
          grade_band: string
          lexile_score: number
          recommended_minutes: number
          specific_topic: string
          title: string
          word_count: number
          zone: string
          zone_label: string
        }[]
      }
      get_my_game_stats: {
        Args: { _game_type: string }
        Returns: {
          avg_score: number
          best_score: number
          total_plays: number
          week_rank: number
        }[]
      }
      get_my_weekly_rank: {
        Args: never
        Returns: {
          active_days: number
          rank: number
          total_players: number
          weekly_xp: number
        }[]
      }
      get_or_init_duel_rating: {
        Args: never
        Returns: {
          best_streak: number
          current_streak: number
          draws: number
          losses: number
          matches_played: number
          peak_rating: number
          rating: number
          tier: string
          wins: number
        }[]
      }
      get_reading_diagnostic_radar: {
        Args: never
        Returns: {
          accuracy: number
          correct_count: number
          question_type: string
          top_error_count: number
          top_error_tag: string
          total_attempts: number
        }[]
      }
      get_reading_diagnostic_radar_v2: {
        Args: never
        Returns: {
          accuracy: number
          avg_confidence: number
          correct_count: number
          high_conf_wrong: number
          metacog_accuracy: number
          question_type: string
          top_error_count: number
          top_error_tag: string
          total_attempts: number
        }[]
      }
      get_reading_efficiency: {
        Args: never
        Returns: {
          articles_done: number
          avg_accuracy: number
          avg_wpm: number
          benchmark_label: string
          efficiency_index: number
        }[]
      }
      get_today_recommendations: {
        Args: never
        Returns: {
          active_today: boolean
          current_streak: number
          due_expressions: number
          due_grammar: number
          due_mistakes: number
          due_slang: number
          due_vocab: number
          top_area: string
          top_area_count: number
          total_due: number
          weakest_count: number
          weakest_module: string
        }[]
      }
      get_user_reading_lexile: {
        Args: never
        Returns: {
          articles_used: number
          cefr_estimate: string
          challenge_max: number
          challenge_min: number
          confidence: string
          estimated_lexile: number
          optimal_max: number
          optimal_min: number
        }[]
      }
      get_user_streak_stats: {
        Args: never
        Returns: {
          active_days_this_month: number
          active_today: boolean
          current_streak: number
          has_first_ai_talk: boolean
          longest_streak: number
          minutes_this_month: number
          total_quiz_correct: number
        }[]
      }
      get_vocab_mastery_overview: {
        Args: never
        Returns: {
          avg_stability_days: number
          due_today: number
          due_within_7d: number
          encountered: number
          familiar: number
          mastered: number
          mastered_due_within_7d: number
          proficient: number
          total_lapses: number
          total_words: number
          untouched: number
        }[]
      }
      get_weekly_leaderboard: {
        Args: never
        Returns: {
          active_days: number
          alias: string
          is_me: boolean
          rank: number
          weekly_xp: number
        }[]
      }
      get_word_quest_daily_leaderboard: {
        Args: never
        Returns: {
          alias: string
          duration_ms: number
          is_me: boolean
          perfect: boolean
          rank: number
        }[]
      }
      get_word_quest_streak: {
        Args: never
        Returns: {
          current_streak: number
          longest_streak: number
          this_month_days: number
          today_done: boolean
          total_perfect: number
        }[]
      }
      match_duel_bot: {
        Args: never
        Returns: {
          is_bot: boolean
          match_seed: string
          opponent_alias: string
          opponent_id: string
          opponent_rating: number
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      submit_cloze_session: {
        Args: {
          _answers: Json
          _duration_seconds?: number
          _passage_id: string
        }
        Returns: {
          correct_count: number
          score_pct: number
          session_id: string
          total_blanks: number
        }[]
      }
      submit_duel_result: {
        Args: {
          _duration_ms: number
          _is_bot: boolean
          _my_score: number
          _opp_score: number
          _opponent_id: string
          _opponent_rating: number
          _questions: Json
          _rounds: number
        }
        Returns: {
          current_streak: number
          is_draw: boolean
          my_delta: number
          my_new_rating: number
          won: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
