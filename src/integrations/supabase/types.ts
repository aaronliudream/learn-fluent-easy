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
      gaokao_grammar_points: {
        Row: {
          created_at: string
          difficulty: number
          explanation: string | null
          id: string
          parent_id: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty?: number
          explanation?: string | null
          id?: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty?: number
          explanation?: string | null
          id?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
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
          correct_answer: string
          created_at: string
          difficulty: number
          explanation: string
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          point_id: string
          stem: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty?: number
          explanation: string
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          point_id: string
          stem: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: number
          explanation?: string
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          point_id?: string
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
          id: string
          item_id: string
          item_type: string
          last_result: string | null
          last_seen_at: string | null
          next_review_at: string | null
          updated_at: string
          user_id: string
          wrong_count: number
        }
        Insert: {
          correct_count?: number
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          last_result?: string | null
          last_seen_at?: string | null
          next_review_at?: string | null
          updated_at?: string
          user_id: string
          wrong_count?: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          last_result?: string | null
          last_seen_at?: string | null
          next_review_at?: string | null
          updated_at?: string
          user_id?: string
          wrong_count?: number
        }
        Relationships: []
      }
      gaokao_vocab: {
        Row: {
          cet_level: string | null
          created_at: string
          example_cn: string | null
          example_en: string | null
          frequency_band: number
          id: string
          meaning_cn: string
          phonetic: string | null
          pos: string | null
          sort_order: number
          star_level: number
          word: string
        }
        Insert: {
          cet_level?: string | null
          created_at?: string
          example_cn?: string | null
          example_en?: string | null
          frequency_band?: number
          id?: string
          meaning_cn: string
          phonetic?: string | null
          pos?: string | null
          sort_order?: number
          star_level?: number
          word: string
        }
        Update: {
          cet_level?: string | null
          created_at?: string
          example_cn?: string | null
          example_en?: string | null
          frequency_band?: number
          id?: string
          meaning_cn?: string
          phonetic?: string | null
          pos?: string | null
          sort_order?: number
          star_level?: number
          word?: string
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
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
