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
      action_rewards: {
        Row: {
          action_code: string
          coins_base: number
          cooldown_seconds: number
          created_at: string
          daily_cap: number
          display_name_cn: string
          display_name_en: string | null
          flash_chance: number
          is_active: boolean
          module: string | null
          xp_base: number
        }
        Insert: {
          action_code: string
          coins_base?: number
          cooldown_seconds?: number
          created_at?: string
          daily_cap?: number
          display_name_cn: string
          display_name_en?: string | null
          flash_chance?: number
          is_active?: boolean
          module?: string | null
          xp_base?: number
        }
        Update: {
          action_code?: string
          coins_base?: number
          cooldown_seconds?: number
          created_at?: string
          daily_cap?: number
          display_name_cn?: string
          display_name_en?: string | null
          flash_chance?: number
          is_active?: boolean
          module?: string | null
          xp_base?: number
        }
        Relationships: []
      }
      activity_feed: {
        Row: {
          created_at: string
          emoji: string | null
          grade_band: string | null
          id: string
          kind: string
          message: string
          meta: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          grade_band?: string | null
          id?: string
          kind: string
          message: string
          meta?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          grade_band?: string | null
          id?: string
          kind?: string
          message?: string
          meta?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_blocked_keywords: {
        Row: {
          category: string
          created_at: string
          id: string
          keyword: string
          severity: number
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          keyword: string
          severity?: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          keyword?: string
          severity?: number
        }
        Relationships: []
      }
      ai_content_reports: {
        Row: {
          content_snippet: string
          created_at: string
          feature: string
          id: string
          reason: string
          source_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          content_snippet: string
          created_at?: string
          feature: string
          id?: string
          reason: string
          source_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          content_snippet?: string
          created_at?: string
          feature?: string
          id?: string
          reason?: string
          source_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_diagnostic_logs: {
        Row: {
          call_at: string | null
          id: string
          model_used: string | null
          tokens_used: number | null
          user_id: string | null
          was_cached: boolean | null
          was_template: boolean | null
        }
        Insert: {
          call_at?: string | null
          id?: string
          model_used?: string | null
          tokens_used?: number | null
          user_id?: string | null
          was_cached?: boolean | null
          was_template?: boolean | null
        }
        Update: {
          call_at?: string | null
          id?: string
          model_used?: string | null
          tokens_used?: number | null
          user_id?: string | null
          was_cached?: boolean | null
          was_template?: boolean | null
        }
        Relationships: []
      }
      ai_diagnostics: {
        Row: {
          expected_gain: string | null
          expires_at: string
          generated_at: string | null
          id: string
          insights: Json
          summary: string | null
          user_id: string
        }
        Insert: {
          expected_gain?: string | null
          expires_at?: string
          generated_at?: string | null
          id?: string
          insights?: Json
          summary?: string | null
          user_id: string
        }
        Update: {
          expected_gain?: string | null
          expires_at?: string
          generated_at?: string | null
          id?: string
          insights?: Json
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_generated_questions: {
        Row: {
          ai_model: string | null
          context_scenario: string | null
          correct_answer: string | null
          created_at: string | null
          difficulty: number | null
          explanation: string
          generated_at: string | null
          id: string
          kp_id: string
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          question_type: string | null
          skill_area: string
          stem: string
          used_count: number | null
          year_band: number | null
        }
        Insert: {
          ai_model?: string | null
          context_scenario?: string | null
          correct_answer?: string | null
          created_at?: string | null
          difficulty?: number | null
          explanation: string
          generated_at?: string | null
          id?: string
          kp_id: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_type?: string | null
          skill_area: string
          stem: string
          used_count?: number | null
          year_band?: number | null
        }
        Update: {
          ai_model?: string | null
          context_scenario?: string | null
          correct_answer?: string | null
          created_at?: string | null
          difficulty?: number | null
          explanation?: string
          generated_at?: string | null
          id?: string
          kp_id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          question_type?: string | null
          skill_area?: string
          stem?: string
          used_count?: number | null
          year_band?: number | null
        }
        Relationships: []
      }
      ai_practice_sets: {
        Row: {
          created_at: string
          id: string
          knowledge_point_id: string | null
          knowledge_point_label: string | null
          module: string
          passed: boolean
          questions: Json
          result: Json
          round: number
          source_question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          knowledge_point_id?: string | null
          knowledge_point_label?: string | null
          module: string
          passed?: boolean
          questions?: Json
          result?: Json
          round?: number
          source_question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          knowledge_point_id?: string | null
          knowledge_point_label?: string | null
          module?: string
          passed?: boolean
          questions?: Json
          result?: Json
          round?: number
          source_question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_quota_limits: {
        Row: {
          daily_call_limit: number
          daily_token_limit: number
          description: string | null
          feature: string
        }
        Insert: {
          daily_call_limit: number
          daily_token_limit: number
          description?: string | null
          feature: string
        }
        Update: {
          daily_call_limit?: number
          daily_token_limit?: number
          description?: string | null
          feature?: string
        }
        Relationships: []
      }
      ai_safety_log: {
        Row: {
          action_taken: string
          created_at: string
          feature: string
          id: string
          matched_keywords: string[] | null
          user_id: string | null
        }
        Insert: {
          action_taken: string
          created_at?: string
          feature: string
          id?: string
          matched_keywords?: string[] | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string
          created_at?: string
          feature?: string
          id?: string
          matched_keywords?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage_quota: {
        Row: {
          call_count: number
          feature: string
          token_count: number
          usage_date: string
          user_id: string
        }
        Insert: {
          call_count?: number
          feature: string
          token_count?: number
          usage_date?: string
          user_id: string
        }
        Update: {
          call_count?: number
          feature?: string
          token_count?: number
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      audio_clips: {
        Row: {
          audio_url: string | null
          created_at: string
          difficulty: number
          duration_ms: number | null
          grade_band: string
          id: string
          ipa: string | null
          is_dialogue: boolean
          source: string | null
          speaker: string | null
          tags: string[] | null
          text: string
          translation_cn: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          difficulty?: number
          duration_ms?: number | null
          grade_band?: string
          id?: string
          ipa?: string | null
          is_dialogue?: boolean
          source?: string | null
          speaker?: string | null
          tags?: string[] | null
          text: string
          translation_cn?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          difficulty?: number
          duration_ms?: number | null
          grade_band?: string
          id?: string
          ipa?: string | null
          is_dialogue?: boolean
          source?: string | null
          speaker?: string | null
          tags?: string[] | null
          text?: string
          translation_cn?: string | null
        }
        Relationships: []
      }
      card_answer_events: {
        Row: {
          card_id: string
          created_at: string
          guest_token: string | null
          id: string
          is_correct: boolean
          picked_idx: number
          question_idx: number
          user_id: string | null
        }
        Insert: {
          card_id: string
          created_at?: string
          guest_token?: string | null
          id?: string
          is_correct: boolean
          picked_idx: number
          question_idx: number
          user_id?: string | null
        }
        Update: {
          card_id?: string
          created_at?: string
          guest_token?: string | null
          id?: string
          is_correct?: boolean
          picked_idx?: number
          question_idx?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_answer_events_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "knowledge_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_attempts: {
        Row: {
          card_id: string
          coins_awarded: number
          correct_count: number
          created_at: string
          guest_token: string | null
          id: string
          score_pct: number
          stage: string
          total_questions: number
          user_id: string | null
        }
        Insert: {
          card_id: string
          coins_awarded?: number
          correct_count: number
          created_at?: string
          guest_token?: string | null
          id?: string
          score_pct: number
          stage?: string
          total_questions: number
          user_id?: string | null
        }
        Update: {
          card_id?: string
          coins_awarded?: number
          correct_count?: number
          created_at?: string
          guest_token?: string | null
          id?: string
          score_pct?: number
          stage?: string
          total_questions?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_attempts_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "knowledge_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_likes: {
        Row: {
          card_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_likes_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "knowledge_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_views: {
        Row: {
          card_id: string
          created_at: string
          id: string
          ref_user_id: string | null
          viewer_id: string | null
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          ref_user_id?: string | null
          viewer_id?: string | null
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          ref_user_id?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_views_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "knowledge_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_award_log: {
        Row: {
          amount: number
          awarded_at: string
          id: number
          item_id: string
          module: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          awarded_at?: string
          id?: number
          item_id: string
          module?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          awarded_at?: string
          id?: number
          item_id?: string
          module?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      community_goal_contributions: {
        Row: {
          contribution: number
          goal_id: string
          id: string
          rewarded: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          contribution?: number
          goal_id: string
          id?: string
          rewarded?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          contribution?: number
          goal_id?: string
          id?: string
          rewarded?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "community_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      community_goals: {
        Row: {
          created_at: string
          current_value: number
          description_cn: string | null
          ends_at: string | null
          goal_code: string
          id: string
          is_active: boolean
          reward_skin_id: string | null
          reward_species_id: string | null
          starts_at: string
          target_metric: string
          target_value: number
          title_cn: string
          title_en: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          description_cn?: string | null
          ends_at?: string | null
          goal_code: string
          id?: string
          is_active?: boolean
          reward_skin_id?: string | null
          reward_species_id?: string | null
          starts_at?: string
          target_metric: string
          target_value: number
          title_cn: string
          title_en: string
        }
        Update: {
          created_at?: string
          current_value?: number
          description_cn?: string | null
          ends_at?: string | null
          goal_code?: string
          id?: string
          is_active?: boolean
          reward_skin_id?: string | null
          reward_species_id?: string | null
          starts_at?: string
          target_metric?: string
          target_value?: number
          title_cn?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_goals_reward_species_id_fkey"
            columns: ["reward_species_id"]
            isOneToOne: false
            referencedRelation: "pet_species"
            referencedColumns: ["id"]
          },
        ]
      }
      coop_session_members: {
        Row: {
          contributed: number
          joined_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          contributed?: number
          joined_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          contributed?: number
          joined_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coop_session_members_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coop_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      coop_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_correct: number
          expires_at: string
          goal_correct: number
          grade_band: string
          id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_correct?: number
          expires_at?: string
          goal_correct?: number
          grade_band: string
          id?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_correct?: number
          expires_at?: string
          goal_correct?: number
          grade_band?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      daily_coin_log: {
        Row: {
          earned: number
          log_date: string
          user_id: string
        }
        Insert: {
          earned?: number
          log_date: string
          user_id: string
        }
        Update: {
          earned?: number
          log_date?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_prescriptions: {
        Row: {
          generated_at: string
          id: string
          prescription_date: string
          tasks: Json
          user_id: string
          weak_top3: Json
          weekly_focus: Json
          year_band: number
        }
        Insert: {
          generated_at?: string
          id?: string
          prescription_date?: string
          tasks?: Json
          user_id: string
          weak_top3?: Json
          weekly_focus?: Json
          year_band: number
        }
        Update: {
          generated_at?: string
          id?: string
          prescription_date?: string
          tasks?: Json
          user_id?: string
          weak_top3?: Json
          weekly_focus?: Json
          year_band?: number
        }
        Relationships: []
      }
      daily_question_usage: {
        Row: {
          created_at: string
          id: string
          questions_used: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          questions_used?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          questions_used?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
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
      daily_task_completions: {
        Row: {
          coins_awarded: number
          completed_at: string
          id: string
          task_date: string
          task_key: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          coins_awarded?: number
          completed_at?: string
          id?: string
          task_date: string
          task_key: string
          user_id: string
          xp_awarded?: number
        }
        Update: {
          coins_awarded?: number
          completed_at?: string
          id?: string
          task_date?: string
          task_key?: string
          user_id?: string
          xp_awarded?: number
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
      feedback: {
        Row: {
          category: string
          created_at: string
          email: string | null
          id: string
          ip_hash: string | null
          message: string
          moderation_result: Json | null
          page_url: string | null
          rating: number | null
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          message: string
          moderation_result?: Json | null
          page_url?: string | null
          rating?: number | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_hash?: string | null
          message?: string
          moderation_result?: Json | null
          page_url?: string | null
          rating?: number | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          page_path: string | null
          referrer: string | null
          session_id: string | null
          step: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          step?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          step?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      gaokao_cloze_knowledge_points: {
        Row: {
          category_code: string
          category_name: string
          created_at: string
          difficulty: number | null
          exam_frequency: string | null
          example: string | null
          extra: Json | null
          id: string
          level1: string | null
          level2: string | null
          level3: string
          pitfall: string | null
          prerequisite: string | null
          source_id: string
          strategy: string | null
          year_band: number | null
        }
        Insert: {
          category_code: string
          category_name: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          example?: string | null
          extra?: Json | null
          id?: string
          level1?: string | null
          level2?: string | null
          level3: string
          pitfall?: string | null
          prerequisite?: string | null
          source_id: string
          strategy?: string | null
          year_band?: number | null
        }
        Update: {
          category_code?: string
          category_name?: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          example?: string | null
          extra?: Json | null
          id?: string
          level1?: string | null
          level2?: string | null
          level3?: string
          pitfall?: string | null
          prerequisite?: string | null
          source_id?: string
          strategy?: string | null
          year_band?: number | null
        }
        Relationships: []
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
          year_band: number | null
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
          year_band?: number | null
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
          year_band?: number | null
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
      gaokao_cohort_essays: {
        Row: {
          cohort_id: string
          created_at: string
          id: string
          llm_refinement: string
          llm_score: number
          llm_strength: string
          sentence: string
          user_id: string
          words_used: string[]
        }
        Insert: {
          cohort_id: string
          created_at?: string
          id?: string
          llm_refinement: string
          llm_score: number
          llm_strength: string
          sentence: string
          user_id: string
          words_used: string[]
        }
        Update: {
          cohort_id?: string
          created_at?: string
          id?: string
          llm_refinement?: string
          llm_score?: number
          llm_strength?: string
          sentence?: string
          user_id?: string
          words_used?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_cohort_essays_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "gaokao_user_active_cohort"
            referencedColumns: ["id"]
          },
        ]
      }
      gaokao_cohort_events: {
        Row: {
          cohort_id: string
          correct: boolean
          kind: string
          ts: string
          user_id: string
          vocab_id: string
        }
        Insert: {
          cohort_id: string
          correct: boolean
          kind: string
          ts?: string
          user_id: string
          vocab_id: string
        }
        Update: {
          cohort_id?: string
          correct?: boolean
          kind?: string
          ts?: string
          user_id?: string
          vocab_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_cohort_events_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "gaokao_user_active_cohort"
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
      gaokao_exam_calendar: {
        Row: {
          created_at: string
          event_date: string
          event_type: string
          id: string
          label: string | null
          year_band: number | null
        }
        Insert: {
          created_at?: string
          event_date: string
          event_type: string
          id?: string
          label?: string | null
          year_band?: number | null
        }
        Update: {
          created_at?: string
          event_date?: string
          event_type?: string
          id?: string
          label?: string | null
          year_band?: number | null
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
          ai_corpus: Json | null
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
          ai_corpus?: Json | null
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
          ai_corpus?: Json | null
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
          year_band: number | null
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
          year_band?: number | null
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
          year_band?: number | null
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
      gaokao_listening_knowledge_points: {
        Row: {
          category_code: string
          category_name: string
          created_at: string
          difficulty: number | null
          exam_frequency: string | null
          example: string | null
          extra: Json | null
          id: string
          level1: string | null
          level2: string | null
          level3: string
          pitfall: string | null
          prerequisite: string | null
          source_id: string
          strategy: string | null
          year_band: number | null
        }
        Insert: {
          category_code: string
          category_name: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          example?: string | null
          extra?: Json | null
          id?: string
          level1?: string | null
          level2?: string | null
          level3: string
          pitfall?: string | null
          prerequisite?: string | null
          source_id: string
          strategy?: string | null
          year_band?: number | null
        }
        Update: {
          category_code?: string
          category_name?: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          example?: string | null
          extra?: Json | null
          id?: string
          level1?: string | null
          level2?: string | null
          level3?: string
          pitfall?: string | null
          prerequisite?: string | null
          source_id?: string
          strategy?: string | null
          year_band?: number | null
        }
        Relationships: []
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
          year_band: number | null
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
          year_band?: number | null
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
          year_band?: number | null
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
      gaokao_theme_tags: {
        Row: {
          created_at: string
          description: string | null
          label_cn: string
          tag: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          label_cn: string
          tag: string
        }
        Update: {
          created_at?: string
          description?: string | null
          label_cn?: string
          tag?: string
        }
        Relationships: []
      }
      gaokao_user_active_cohort: {
        Row: {
          cohort_word_ids: string[]
          created_at: string
          graduated_at: string | null
          graduated_without_essay: boolean
          id: string
          last_active_at: string
          sequence_no: number
          started_at: string
          status: Database["public"]["Enums"]["cohort_status"]
          theme_tag: string | null
          user_id: string
        }
        Insert: {
          cohort_word_ids: string[]
          created_at?: string
          graduated_at?: string | null
          graduated_without_essay?: boolean
          id?: string
          last_active_at?: string
          sequence_no: number
          started_at?: string
          status?: Database["public"]["Enums"]["cohort_status"]
          theme_tag?: string | null
          user_id: string
        }
        Update: {
          cohort_word_ids?: string[]
          created_at?: string
          graduated_at?: string | null
          graduated_without_essay?: boolean
          id?: string
          last_active_at?: string
          sequence_no?: number
          started_at?: string
          status?: Database["public"]["Enums"]["cohort_status"]
          theme_tag?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_user_active_cohort_theme_tag_fkey"
            columns: ["theme_tag"]
            isOneToOne: false
            referencedRelation: "gaokao_theme_tags"
            referencedColumns: ["tag"]
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
          difficulty: number
          due_at: string | null
          hypercorrection: boolean
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
          hypercorrection?: boolean
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
          hypercorrection?: boolean
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
          contrast_card: Json | null
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
          primary_gloss: string
          sort_order: number
          stage: string
          star_level: number
          sub_theme: string | null
          synonyms: Json | null
          tags: Json | null
          theme: string | null
          theme_tag: string | null
          word: string
          year_band: number | null
        }
        Insert: {
          accent?: string | null
          cet_level?: string | null
          contrast_card?: Json | null
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
          primary_gloss: string
          sort_order?: number
          stage?: string
          star_level?: number
          sub_theme?: string | null
          synonyms?: Json | null
          tags?: Json | null
          theme?: string | null
          theme_tag?: string | null
          word: string
          year_band?: number | null
        }
        Update: {
          accent?: string | null
          cet_level?: string | null
          contrast_card?: Json | null
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
          primary_gloss?: string
          sort_order?: number
          stage?: string
          star_level?: number
          sub_theme?: string | null
          synonyms?: Json | null
          tags?: Json | null
          theme?: string | null
          theme_tag?: string | null
          word?: string
          year_band?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gaokao_vocab_theme_tag_fk"
            columns: ["theme_tag"]
            isOneToOne: false
            referencedRelation: "gaokao_theme_tags"
            referencedColumns: ["tag"]
          },
        ]
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
          stage: string
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
          stage?: string
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
          stage?: string
        }
        Relationships: []
      }
      gaokao_writing_knowledge_points: {
        Row: {
          category_code: string
          category_name: string
          created_at: string
          difficulty: number | null
          exam_frequency: string | null
          example: string | null
          extra: Json | null
          id: string
          level1: string | null
          level2: string | null
          level3: string
          pitfall: string | null
          prerequisite: string | null
          source_id: string
          strategy: string | null
          year_band: number | null
        }
        Insert: {
          category_code: string
          category_name: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          example?: string | null
          extra?: Json | null
          id?: string
          level1?: string | null
          level2?: string | null
          level3: string
          pitfall?: string | null
          prerequisite?: string | null
          source_id: string
          strategy?: string | null
          year_band?: number | null
        }
        Update: {
          category_code?: string
          category_name?: string
          created_at?: string
          difficulty?: number | null
          exam_frequency?: string | null
          example?: string | null
          extra?: Json | null
          id?: string
          level1?: string | null
          level2?: string | null
          level3?: string
          pitfall?: string | null
          prerequisite?: string | null
          source_id?: string
          strategy?: string | null
          year_band?: number | null
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
      grammar_lab_progress: {
        Row: {
          attempts: number
          best_score: number
          boss_passed: boolean
          completed_at: string | null
          created_at: string
          id: string
          level: string
          point_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          best_score?: number
          boss_passed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          level: string
          point_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          best_score?: number
          boss_passed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          level?: string
          point_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grammar_points: {
        Row: {
          category: string
          created_at: string
          grade: string | null
          id: string
          legacy_id: string | null
          legacy_table: string | null
          name: string
          slug: string
          sort_order: number
          stage: string
          weight: number
        }
        Insert: {
          category: string
          created_at?: string
          grade?: string | null
          id?: string
          legacy_id?: string | null
          legacy_table?: string | null
          name: string
          slug: string
          sort_order?: number
          stage: string
          weight?: number
        }
        Update: {
          category?: string
          created_at?: string
          grade?: string | null
          id?: string
          legacy_id?: string | null
          legacy_table?: string | null
          name?: string
          slug?: string
          sort_order?: number
          stage?: string
          weight?: number
        }
        Relationships: []
      }
      guest_ai_usage: {
        Row: {
          client_id: string
          day: string
          message_count: number
          updated_at: string
        }
        Insert: {
          client_id: string
          day: string
          message_count?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          day?: string
          message_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      junior_game_scores: {
        Row: {
          accuracy: number | null
          created_at: string
          duration_ms: number | null
          game_type: string
          grade: number | null
          id: string
          score: number
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          duration_ms?: number | null
          game_type: string
          grade?: number | null
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          duration_ms?: number | null
          game_type?: string
          grade?: number | null
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      junior_grammar_categories: {
        Row: {
          code: string
          created_at: string
          emoji: string | null
          id: string
          name_cn: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          emoji?: string | null
          id?: string
          name_cn: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          emoji?: string | null
          id?: string
          name_cn?: string
          sort_order?: number
        }
        Relationships: []
      }
      junior_grammar_points: {
        Row: {
          ai_corpus: Json | null
          boss_questions: Json
          category_id: string
          cefr: string | null
          code: string
          content_depth: number
          contrast_table: Json
          correction_tasks: Json
          created_at: string
          examples: Json
          explanation_md: string
          grade: number
          hook_line: string | null
          hook_line_cn: string | null
          id: string
          immersion_cards: Json
          mnemonic: string | null
          reflex_cards: Json
          situation_drills: Json
          sort_order: number
          summary: string | null
          teacher_script: Json
          title: string
        }
        Insert: {
          ai_corpus?: Json | null
          boss_questions?: Json
          category_id: string
          cefr?: string | null
          code: string
          content_depth?: number
          contrast_table?: Json
          correction_tasks?: Json
          created_at?: string
          examples?: Json
          explanation_md?: string
          grade?: number
          hook_line?: string | null
          hook_line_cn?: string | null
          id?: string
          immersion_cards?: Json
          mnemonic?: string | null
          reflex_cards?: Json
          situation_drills?: Json
          sort_order?: number
          summary?: string | null
          teacher_script?: Json
          title: string
        }
        Update: {
          ai_corpus?: Json | null
          boss_questions?: Json
          category_id?: string
          cefr?: string | null
          code?: string
          content_depth?: number
          contrast_table?: Json
          correction_tasks?: Json
          created_at?: string
          examples?: Json
          explanation_md?: string
          grade?: number
          hook_line?: string | null
          hook_line_cn?: string | null
          id?: string
          immersion_cards?: Json
          mnemonic?: string | null
          reflex_cards?: Json
          situation_drills?: Json
          sort_order?: number
          summary?: string | null
          teacher_script?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "junior_grammar_points_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "junior_grammar_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      junior_grammar_questions: {
        Row: {
          accepted_answers: string[] | null
          correct_answer: string | null
          created_at: string
          difficulty: number
          distractors: Json
          explanation: string | null
          grammar_topic: string | null
          id: string
          kp_id: string | null
          natural_note: string | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          point_id: string
          question_type: string
          sort_order: number
          stem: string
          use_ai_grading: boolean
        }
        Insert: {
          accepted_answers?: string[] | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: number
          distractors?: Json
          explanation?: string | null
          grammar_topic?: string | null
          id?: string
          kp_id?: string | null
          natural_note?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          point_id: string
          question_type?: string
          sort_order?: number
          stem: string
          use_ai_grading?: boolean
        }
        Update: {
          accepted_answers?: string[] | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: number
          distractors?: Json
          explanation?: string | null
          grammar_topic?: string | null
          id?: string
          kp_id?: string | null
          natural_note?: string | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          point_id?: string
          question_type?: string
          sort_order?: number
          stem?: string
          use_ai_grading?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "junior_grammar_questions_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "junior_grammar_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "junior_grammar_questions_kp_id_fkey"
            columns: ["kp_id"]
            isOneToOne: false
            referencedRelation: "junior_knowledge_points"
            referencedColumns: ["id"]
          },
        ]
      }
      junior_knowledge_points: {
        Row: {
          code: string
          created_at: string
          id: string
          point_id: string
          sort_order: number
          summary: string | null
          target_count: number
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          point_id: string
          sort_order?: number
          summary?: string | null
          target_count?: number
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          point_id?: string
          sort_order?: number
          summary?: string | null
          target_count?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "junior_knowledge_points_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "junior_grammar_points"
            referencedColumns: ["id"]
          },
        ]
      }
      junior_listening_attempts: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          is_correct: boolean
          question_idx: number
          user_answer: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          is_correct: boolean
          question_idx: number
          user_answer?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          is_correct?: boolean
          question_idx?: number
          user_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      junior_listening_exercises: {
        Row: {
          audio_url: string | null
          created_at: string
          difficulty: number
          duration_sec: number | null
          grade: number
          id: string
          key_vocab: Json
          kind: string | null
          questions: Json
          speaker: string | null
          title: string
          topic: string | null
          transcript: string
          translation_cn: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          difficulty?: number
          duration_sec?: number | null
          grade?: number
          id?: string
          key_vocab?: Json
          kind?: string | null
          questions?: Json
          speaker?: string | null
          title: string
          topic?: string | null
          transcript: string
          translation_cn?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          difficulty?: number
          duration_sec?: number | null
          grade?: number
          id?: string
          key_vocab?: Json
          kind?: string | null
          questions?: Json
          speaker?: string | null
          title?: string
          topic?: string | null
          transcript?: string
          translation_cn?: string | null
        }
        Relationships: []
      }
      junior_reading: {
        Row: {
          body: string
          created_at: string
          difficulty: number
          grade: number
          id: string
          questions: Json
          title: string
          topic: string | null
          vocab_notes: Json
          word_count: number | null
        }
        Insert: {
          body: string
          created_at?: string
          difficulty?: number
          grade: number
          id?: string
          questions?: Json
          title: string
          topic?: string | null
          vocab_notes?: Json
          word_count?: number | null
        }
        Update: {
          body?: string
          created_at?: string
          difficulty?: number
          grade?: number
          id?: string
          questions?: Json
          title?: string
          topic?: string | null
          vocab_notes?: Json
          word_count?: number | null
        }
        Relationships: []
      }
      junior_reading_attempts: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          is_correct: boolean
          question_idx: number
          reading_id: string
          user_answer: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          is_correct: boolean
          question_idx: number
          reading_id: string
          user_answer?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          is_correct?: boolean
          question_idx?: number
          reading_id?: string
          user_answer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "junior_reading_attempts_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "junior_reading"
            referencedColumns: ["id"]
          },
        ]
      }
      junior_reading_completions: {
        Row: {
          created_at: string
          id: string
          perfect: boolean
          reading_id: string
          time_spent_sec: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          perfect?: boolean
          reading_id: string
          time_spent_sec?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          perfect?: boolean
          reading_id?: string
          time_spent_sec?: number
          user_id?: string
        }
        Relationships: []
      }
      junior_sentences: {
        Row: {
          blank: string
          created_at: string
          difficulty: number
          grade: number
          grammar_tag: string | null
          id: string
          meaning_cn: string | null
          options: Json
          sentence_en: string
          word_id: string | null
        }
        Insert: {
          blank: string
          created_at?: string
          difficulty?: number
          grade: number
          grammar_tag?: string | null
          id?: string
          meaning_cn?: string | null
          options?: Json
          sentence_en: string
          word_id?: string | null
        }
        Update: {
          blank?: string
          created_at?: string
          difficulty?: number
          grade?: number
          grammar_tag?: string | null
          id?: string
          meaning_cn?: string | null
          options?: Json
          sentence_en?: string
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "junior_sentences_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "junior_vocab"
            referencedColumns: ["id"]
          },
        ]
      }
      junior_themes: {
        Row: {
          code: string
          emoji: string
          grade: number
          name_cn: string
          sort_order: number
        }
        Insert: {
          code: string
          emoji?: string
          grade: number
          name_cn: string
          sort_order?: number
        }
        Update: {
          code?: string
          emoji?: string
          grade?: number
          name_cn?: string
          sort_order?: number
        }
        Relationships: []
      }
      junior_user_mastery: {
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
      junior_vocab: {
        Row: {
          created_at: string
          example_cn: string | null
          example_en: string | null
          freq_rank: number | null
          grade: number
          id: string
          meaning_cn: string
          meaning_en: string | null
          phonetic: string | null
          pos: string | null
          star_level: number
          theme: string | null
          tip: string | null
          word: string
        }
        Insert: {
          created_at?: string
          example_cn?: string | null
          example_en?: string | null
          freq_rank?: number | null
          grade: number
          id?: string
          meaning_cn: string
          meaning_en?: string | null
          phonetic?: string | null
          pos?: string | null
          star_level?: number
          theme?: string | null
          tip?: string | null
          word: string
        }
        Update: {
          created_at?: string
          example_cn?: string | null
          example_en?: string | null
          freq_rank?: number | null
          grade?: number
          id?: string
          meaning_cn?: string
          meaning_en?: string | null
          phonetic?: string | null
          pos?: string | null
          star_level?: number
          theme?: string | null
          tip?: string | null
          word?: string
        }
        Relationships: []
      }
      junior_word_mastery: {
        Row: {
          cloze_correct: number
          cloze_wrong: number
          created_at: string
          due_at: string
          ease: number
          grade: number
          id: string
          interval_days: number
          last_seen_at: string | null
          listen_correct: number
          listen_wrong: number
          mastery_level: number
          match_correct: number
          match_wrong: number
          quiz_correct: number
          quiz_wrong: number
          reading_correct: number
          reading_wrong: number
          spell_correct: number
          spell_wrong: number
          updated_at: string
          user_id: string
          word_id: string
        }
        Insert: {
          cloze_correct?: number
          cloze_wrong?: number
          created_at?: string
          due_at?: string
          ease?: number
          grade: number
          id?: string
          interval_days?: number
          last_seen_at?: string | null
          listen_correct?: number
          listen_wrong?: number
          mastery_level?: number
          match_correct?: number
          match_wrong?: number
          quiz_correct?: number
          quiz_wrong?: number
          reading_correct?: number
          reading_wrong?: number
          spell_correct?: number
          spell_wrong?: number
          updated_at?: string
          user_id: string
          word_id: string
        }
        Update: {
          cloze_correct?: number
          cloze_wrong?: number
          created_at?: string
          due_at?: string
          ease?: number
          grade?: number
          id?: string
          interval_days?: number
          last_seen_at?: string | null
          listen_correct?: number
          listen_wrong?: number
          mastery_level?: number
          match_correct?: number
          match_wrong?: number
          quiz_correct?: number
          quiz_wrong?: number
          reading_correct?: number
          reading_wrong?: number
          spell_correct?: number
          spell_wrong?: number
          updated_at?: string
          user_id?: string
          word_id?: string
        }
        Relationships: []
      }
      junior_writing_attempts: {
        Row: {
          content_score: number | null
          corrections: Json | null
          created_at: string
          feedback_cn: string | null
          highlights: Json | null
          id: string
          language_score: number | null
          overall_score: number | null
          prompt_id: string
          structure_score: number | null
          text: string
          user_id: string
          word_count: number
        }
        Insert: {
          content_score?: number | null
          corrections?: Json | null
          created_at?: string
          feedback_cn?: string | null
          highlights?: Json | null
          id?: string
          language_score?: number | null
          overall_score?: number | null
          prompt_id: string
          structure_score?: number | null
          text: string
          user_id: string
          word_count?: number
        }
        Update: {
          content_score?: number | null
          corrections?: Json | null
          created_at?: string
          feedback_cn?: string | null
          highlights?: Json | null
          id?: string
          language_score?: number | null
          overall_score?: number | null
          prompt_id?: string
          structure_score?: number | null
          text?: string
          user_id?: string
          word_count?: number
        }
        Relationships: []
      }
      junior_writing_drills: {
        Row: {
          created_at: string
          difficulty_label: string | null
          hint: string | null
          id: string
          prompt: string
          prompt_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          difficulty_label?: string | null
          hint?: string | null
          id?: string
          prompt: string
          prompt_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          difficulty_label?: string | null
          hint?: string | null
          id?: string
          prompt?: string
          prompt_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "junior_writing_drills_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "junior_writing_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      junior_writing_prompts: {
        Row: {
          created_at: string
          difficulty: number
          error_pairs: Json
          grade: number
          high_sentences: Json
          id: string
          max_words: number
          min_words: number
          paragraph_template: string | null
          prompt_cn: string
          prompt_en: string
          requirements: Json
          sample_answer: string | null
          scoring_rubric: string | null
          title_en: string | null
          topic: string
        }
        Insert: {
          created_at?: string
          difficulty?: number
          error_pairs?: Json
          grade?: number
          high_sentences?: Json
          id?: string
          max_words?: number
          min_words?: number
          paragraph_template?: string | null
          prompt_cn: string
          prompt_en: string
          requirements?: Json
          sample_answer?: string | null
          scoring_rubric?: string | null
          title_en?: string | null
          topic: string
        }
        Update: {
          created_at?: string
          difficulty?: number
          error_pairs?: Json
          grade?: number
          high_sentences?: Json
          id?: string
          max_words?: number
          min_words?: number
          paragraph_template?: string | null
          prompt_cn?: string
          prompt_en?: string
          requirements?: Json
          sample_answer?: string | null
          scoring_rubric?: string | null
          title_en?: string | null
          topic?: string
        }
        Relationships: []
      }
      knowledge_cards: {
        Row: {
          author_id: string | null
          common_mistakes: Json
          created_at: string
          examples: Json
          explanation: string
          id: string
          language: string
          like_count: number
          question: string
          quiz: Json
          short_answer: string
          slug: string
          status: string
          tags: string[]
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          common_mistakes?: Json
          created_at?: string
          examples?: Json
          explanation: string
          id?: string
          language?: string
          like_count?: number
          question: string
          quiz?: Json
          short_answer: string
          slug: string
          status?: string
          tags?: string[]
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          common_mistakes?: Json
          created_at?: string
          examples?: Json
          explanation?: string
          id?: string
          language?: string
          like_count?: number
          question?: string
          quiz?: Json
          short_answer?: string
          slug?: string
          status?: string
          tags?: string[]
          updated_at?: string
          view_count?: number
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
      learning_heartbeats: {
        Row: {
          active_seconds: number
          created_at: string
          id: string
          path: string | null
          segment: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          active_seconds?: number
          created_at?: string
          id?: string
          path?: string | null
          segment?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          active_seconds?: number
          created_at?: string
          id?: string
          path?: string | null
          segment?: string
          session_id?: string | null
          user_id?: string
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
      mastery_progress: {
        Row: {
          attempts: number
          best_pct: number
          created_at: string
          id: string
          item_id: string
          last_attempt_at: string
          last_perfect_at: string | null
          module: string
          next_review_at: string | null
          stars: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          best_pct?: number
          created_at?: string
          id?: string
          item_id: string
          last_attempt_at?: string
          last_perfect_at?: string | null
          module: string
          next_review_at?: string | null
          stars?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          best_pct?: number
          created_at?: string
          id?: string
          item_id?: string
          last_attempt_at?: string
          last_perfect_at?: string | null
          module?: string
          next_review_at?: string | null
          stars?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mastery_snapshots: {
        Row: {
          created_at: string | null
          fluent: number
          grade: number | null
          id: string
          master: number
          module: string | null
          none: number
          score_pct: number
          snap_date: string
          stage: string | null
          total: number
          user_id: string
          weak: number
        }
        Insert: {
          created_at?: string | null
          fluent?: number
          grade?: number | null
          id?: string
          master?: number
          module?: string | null
          none?: number
          score_pct?: number
          snap_date: string
          stage?: string | null
          total: number
          user_id: string
          weak?: number
        }
        Update: {
          created_at?: string | null
          fluent?: number
          grade?: number | null
          id?: string
          master?: number
          module?: string | null
          none?: number
          score_pct?: number
          snap_date?: string
          stage?: string | null
          total?: number
          user_id?: string
          weak?: number
        }
        Relationships: []
      }
      mistake_reflections: {
        Row: {
          correct_was: string
          created_at: string
          i_thought: string
          id: string
          item_id: string
          module: string | null
          seeds_awarded: number
          user_id: string
          why_wrong: string | null
          word: string | null
        }
        Insert: {
          correct_was: string
          created_at?: string
          i_thought: string
          id?: string
          item_id: string
          module?: string | null
          seeds_awarded?: number
          user_id: string
          why_wrong?: string | null
          word?: string | null
        }
        Update: {
          correct_was?: string
          created_at?: string
          i_thought?: string
          id?: string
          item_id?: string
          module?: string | null
          seeds_awarded?: number
          user_id?: string
          why_wrong?: string | null
          word?: string | null
        }
        Relationships: []
      }
      no_reward_days: {
        Row: {
          reason: string | null
          rest_date: string
          week_start: string
        }
        Insert: {
          reason?: string | null
          rest_date: string
          week_start: string
        }
        Update: {
          reason?: string | null
          rest_date?: string
          week_start?: string
        }
        Relationships: []
      }
      parent_delay_settings: {
        Row: {
          daily_seed_cap: number
          delay_hours: number
          updated_at: string
          user_id: string
        }
        Insert: {
          daily_seed_cap?: number
          delay_hours?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          daily_seed_cap?: number
          delay_hours?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_weekly_snapshots: {
        Row: {
          created_at: string
          grade: number
          id: string
          lessons_completed: number
          listen_correct: number
          listen_total: number
          minutes_studied: number
          user_id: string
          vocab_learning: number
          vocab_mastered: number
          week_start: string
        }
        Insert: {
          created_at?: string
          grade: number
          id?: string
          lessons_completed?: number
          listen_correct?: number
          listen_total?: number
          minutes_studied?: number
          user_id: string
          vocab_learning?: number
          vocab_mastered?: number
          week_start: string
        }
        Update: {
          created_at?: string
          grade?: number
          id?: string
          lessons_completed?: number
          listen_correct?: number
          listen_total?: number
          minutes_studied?: number
          user_id?: string
          vocab_learning?: number
          vocab_mastered?: number
          week_start?: string
        }
        Relationships: []
      }
      pending_seeds: {
        Row: {
          amount: number
          earned_at: string
          id: number
          mature_at: string
          settled_at: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          earned_at?: string
          id?: number
          mature_at: string
          settled_at?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          earned_at?: string
          id?: number
          mature_at?: string
          settled_at?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      pet_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          pet_id: string | null
          redacted: boolean
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          pet_id?: string | null
          redacted?: boolean
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          pet_id?: string | null
          redacted?: boolean
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      pet_companion_choice: {
        Row: {
          chosen_at: string
          chosen_species_id: string
          personality_quiz_result: Json | null
          user_id: string
        }
        Insert: {
          chosen_at?: string
          chosen_species_id: string
          personality_quiz_result?: Json | null
          user_id: string
        }
        Update: {
          chosen_at?: string
          chosen_species_id?: string
          personality_quiz_result?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_companion_choice_chosen_species_id_fkey"
            columns: ["chosen_species_id"]
            isOneToOne: false
            referencedRelation: "pet_species"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_destinations: {
        Row: {
          cost_coins: number
          description_cn: string | null
          emoji: string
          exp_reward: number
          hunger_cost: number
          id: string
          name_cn: string
          sort_order: number
          unlock_level: number
        }
        Insert: {
          cost_coins?: number
          description_cn?: string | null
          emoji: string
          exp_reward?: number
          hunger_cost?: number
          id: string
          name_cn: string
          sort_order?: number
          unlock_level?: number
        }
        Update: {
          cost_coins?: number
          description_cn?: string | null
          emoji?: string
          exp_reward?: number
          hunger_cost?: number
          id?: string
          name_cn?: string
          sort_order?: number
          unlock_level?: number
        }
        Relationships: []
      }
      pet_diaries: {
        Row: {
          body_cn: string
          created_at: string
          diary_date: string
          highlights: Json
          id: string
          pet_emoji: string | null
          pet_nickname: string | null
          user_id: string
        }
        Insert: {
          body_cn: string
          created_at?: string
          diary_date?: string
          highlights?: Json
          id?: string
          pet_emoji?: string | null
          pet_nickname?: string | null
          user_id: string
        }
        Update: {
          body_cn?: string
          created_at?: string
          diary_date?: string
          highlights?: Json
          id?: string
          pet_emoji?: string | null
          pet_nickname?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pet_diary: {
        Row: {
          created_at: string
          emoji: string | null
          event_type: string
          id: string
          message: string
          meta: Json | null
          pet_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          event_type: string
          id?: string
          message: string
          meta?: Json | null
          pet_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          event_type?: string
          id?: string
          message?: string
          meta?: Json | null
          pet_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_diary_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "user_pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_food_gifts: {
        Row: {
          claimed_at: string | null
          created_at: string
          food_id: string
          from_user: string
          id: string
          qty: number
          to_user: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          food_id: string
          from_user: string
          id?: string
          qty?: number
          to_user: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          food_id?: string
          from_user?: string
          id?: string
          qty?: number
          to_user?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_food_gifts_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "pet_food_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_food_items: {
        Row: {
          description_cn: string | null
          emoji: string
          exp_bonus: number
          hunger_restore: number
          id: string
          mood_bonus: number
          name_cn: string
          price: number
          rarity: number
          sort_order: number
        }
        Insert: {
          description_cn?: string | null
          emoji: string
          exp_bonus?: number
          hunger_restore?: number
          id: string
          mood_bonus?: number
          name_cn: string
          price?: number
          rarity?: number
          sort_order?: number
        }
        Update: {
          description_cn?: string | null
          emoji?: string
          exp_bonus?: number
          hunger_restore?: number
          id?: string
          mood_bonus?: number
          name_cn?: string
          price?: number
          rarity?: number
          sort_order?: number
        }
        Relationships: []
      }
      pet_food_listings: {
        Row: {
          buyer_id: string | null
          created_at: string
          food_id: string
          id: string
          price_per_unit: number
          qty: number
          seller_id: string
          sold_at: string | null
          status: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          food_id: string
          id?: string
          price_per_unit: number
          qty: number
          seller_id: string
          sold_at?: string | null
          status?: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          food_id?: string
          id?: string
          price_per_unit?: number
          qty?: number
          seller_id?: string
          sold_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_food_listings_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "pet_food_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      pet_inventory: {
        Row: {
          food_id: string
          qty: number
          updated_at: string
          user_id: string
        }
        Insert: {
          food_id: string
          qty?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          food_id?: string
          qty?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_inventory_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "pet_food_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_memories: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          importance: number
          memory_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          importance?: number
          memory_type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          importance?: number
          memory_type?: string
          user_id?: string
        }
        Relationships: []
      }
      pet_personality_traits: {
        Row: {
          ai_persona_prompt: string | null
          catchphrase_cn: string | null
          catchphrase_en: string | null
          curiosity: number
          empathy: number
          energy: number
          humor: number
          patience: number
          species_id: string
          updated_at: string
        }
        Insert: {
          ai_persona_prompt?: string | null
          catchphrase_cn?: string | null
          catchphrase_en?: string | null
          curiosity?: number
          empathy?: number
          energy?: number
          humor?: number
          patience?: number
          species_id: string
          updated_at?: string
        }
        Update: {
          ai_persona_prompt?: string | null
          catchphrase_cn?: string | null
          catchphrase_en?: string | null
          curiosity?: number
          empathy?: number
          energy?: number
          humor?: number
          patience?: number
          species_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_personality_traits_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: true
            referencedRelation: "pet_species"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_photos: {
        Row: {
          caption: string | null
          created_at: string
          host_id: string
          id: string
          visitor_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          host_id: string
          id?: string
          visitor_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          host_id?: string
          id?: string
          visitor_id?: string
        }
        Relationships: []
      }
      pet_postcards: {
        Row: {
          created_at: string
          destination_cn: string
          destination_emoji: string
          id: string
          message_cn: string
          month_key: string
          pet_id: string
          read_at: string | null
          trip_end: string
          trip_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination_cn: string
          destination_emoji: string
          id?: string
          message_cn: string
          month_key: string
          pet_id: string
          read_at?: string | null
          trip_end?: string
          trip_start?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination_cn?: string
          destination_emoji?: string
          id?: string
          message_cn?: string
          month_key?: string
          pet_id?: string
          read_at?: string | null
          trip_end?: string
          trip_start?: string
          user_id?: string
        }
        Relationships: []
      }
      pet_skill_bindings: {
        Row: {
          created_at: string
          description_cn: string | null
          emoji: string
          id: string
          kp_codes: Json
          label_cn: string
          label_en: string
          module: string
          rarity: string
          skill_code: string
          threshold: number
        }
        Insert: {
          created_at?: string
          description_cn?: string | null
          emoji?: string
          id?: string
          kp_codes?: Json
          label_cn: string
          label_en: string
          module: string
          rarity?: string
          skill_code: string
          threshold?: number
        }
        Update: {
          created_at?: string
          description_cn?: string | null
          emoji?: string
          id?: string
          kp_codes?: Json
          label_cn?: string
          label_en?: string
          module?: string
          rarity?: string
          skill_code?: string
          threshold?: number
        }
        Relationships: []
      }
      pet_skins: {
        Row: {
          available_until: string | null
          code: string
          created_at: string
          css_filter: string
          culture_tag: string | null
          description_cn: string | null
          id: string
          name_cn: string
          price: number
          rarity: number
          season_tag: string | null
          sort_order: number
          unlock_level: number
          unlock_type: string | null
        }
        Insert: {
          available_until?: string | null
          code: string
          created_at?: string
          css_filter?: string
          culture_tag?: string | null
          description_cn?: string | null
          id?: string
          name_cn: string
          price?: number
          rarity?: number
          season_tag?: string | null
          sort_order?: number
          unlock_level?: number
          unlock_type?: string | null
        }
        Update: {
          available_until?: string | null
          code?: string
          created_at?: string
          css_filter?: string
          culture_tag?: string | null
          description_cn?: string | null
          id?: string
          name_cn?: string
          price?: number
          rarity?: number
          season_tag?: string | null
          sort_order?: number
          unlock_level?: number
          unlock_type?: string | null
        }
        Relationships: []
      }
      pet_species: {
        Row: {
          adopt_cost: number
          cefr_band: string | null
          description_cn: string | null
          emoji_adult: string
          emoji_baby: string
          emoji_egg: string
          emoji_legend: string
          id: string
          is_starter: boolean | null
          name_cn: string
          name_en: string | null
          personality_cn: string | null
          planet_zone: string | null
          rarity: number
          sort_order: number
          unlock_level: number
          unlock_task_code: string | null
          unlock_task_target: number | null
        }
        Insert: {
          adopt_cost?: number
          cefr_band?: string | null
          description_cn?: string | null
          emoji_adult: string
          emoji_baby: string
          emoji_egg: string
          emoji_legend: string
          id: string
          is_starter?: boolean | null
          name_cn: string
          name_en?: string | null
          personality_cn?: string | null
          planet_zone?: string | null
          rarity?: number
          sort_order?: number
          unlock_level?: number
          unlock_task_code?: string | null
          unlock_task_target?: number | null
        }
        Update: {
          adopt_cost?: number
          cefr_band?: string | null
          description_cn?: string | null
          emoji_adult?: string
          emoji_baby?: string
          emoji_egg?: string
          emoji_legend?: string
          id?: string
          is_starter?: boolean | null
          name_cn?: string
          name_en?: string | null
          personality_cn?: string | null
          planet_zone?: string | null
          rarity?: number
          sort_order?: number
          unlock_level?: number
          unlock_task_code?: string | null
          unlock_task_target?: number | null
        }
        Relationships: []
      }
      pet_state: {
        Row: {
          bond: number
          last_interaction_at: string
          level: number
          name: string
          skin: string
          stars: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          bond?: number
          last_interaction_at?: string
          level?: number
          name?: string
          skin?: string
          stars?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          bond?: number
          last_interaction_at?: string
          level?: number
          name?: string
          skin?: string
          stars?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      pet_stickers: {
        Row: {
          caption_cn: string
          code: string
          emoji: string
          id: string
          sort_order: number
          unlock_level: number
        }
        Insert: {
          caption_cn: string
          code: string
          emoji: string
          id?: string
          sort_order?: number
          unlock_level?: number
        }
        Update: {
          caption_cn?: string
          code?: string
          emoji?: string
          id?: string
          sort_order?: number
          unlock_level?: number
        }
        Relationships: []
      }
      pet_trades: {
        Row: {
          created_at: string
          from_pet_id: string
          from_user: string
          id: string
          responded_at: string | null
          status: string
          to_pet_id: string
          to_user: string
        }
        Insert: {
          created_at?: string
          from_pet_id: string
          from_user: string
          id?: string
          responded_at?: string | null
          status?: string
          to_pet_id: string
          to_user: string
        }
        Update: {
          created_at?: string
          from_pet_id?: string
          from_user?: string
          id?: string
          responded_at?: string | null
          status?: string
          to_pet_id?: string
          to_user?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_trades_from_pet_id_fkey"
            columns: ["from_pet_id"]
            isOneToOne: false
            referencedRelation: "user_pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_trades_to_pet_id_fkey"
            columns: ["to_pet_id"]
            isOneToOne: false
            referencedRelation: "user_pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_visits: {
        Row: {
          created_at: string
          host_id: string
          id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          host_id: string
          id?: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          host_id?: string
          id?: string
          visitor_id?: string
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
      primary_badges_earned: {
        Row: {
          badge_id: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: []
      }
      primary_game_scores: {
        Row: {
          accuracy: number | null
          created_at: string
          duration_ms: number | null
          game_type: string
          grade: number | null
          id: string
          score: number
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          duration_ms?: number | null
          game_type: string
          grade?: number | null
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          duration_ms?: number | null
          game_type?: string
          grade?: number | null
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      primary_grade_targets: {
        Row: {
          benchmark_desc: string | null
          benchmark_name: string
          grade: number
          target_lessons: number
          target_vocab: number
          updated_at: string
        }
        Insert: {
          benchmark_desc?: string | null
          benchmark_name?: string
          grade: number
          target_lessons?: number
          target_vocab?: number
          updated_at?: string
        }
        Update: {
          benchmark_desc?: string | null
          benchmark_name?: string
          grade?: number
          target_lessons?: number
          target_vocab?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "primary_grade_targets_grade_fkey"
            columns: ["grade"]
            isOneToOne: true
            referencedRelation: "primary_grades"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_grades: {
        Row: {
          created_at: string
          emoji: string | null
          gradient: string | null
          id: number
          name_cn: string
          name_en: string
          sort_order: number
          unlocked: boolean
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          gradient?: string | null
          id: number
          name_cn: string
          name_en: string
          sort_order?: number
          unlocked?: boolean
        }
        Update: {
          created_at?: string
          emoji?: string | null
          gradient?: string | null
          id?: number
          name_cn?: string
          name_en?: string
          sort_order?: number
          unlocked?: boolean
        }
        Relationships: []
      }
      primary_lesson_chapter_progress: {
        Row: {
          chapter_id: number
          completed_at: string
          grade: number
          id: string
          user_id: string
        }
        Insert: {
          chapter_id: number
          completed_at?: string
          grade: number
          id?: string
          user_id: string
        }
        Update: {
          chapter_id?: number
          completed_at?: string
          grade?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      primary_lesson_completion: {
        Row: {
          completed_at: string
          lesson_key: string
          play_count: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_key: string
          play_count?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          lesson_key?: string
          play_count?: number
          user_id?: string
        }
        Relationships: []
      }
      primary_lesson_progress: {
        Row: {
          accuracy: number | null
          completed_at: string | null
          created_at: string
          id: string
          last_seen_at: string
          lesson_id: string
          stars: number
          steps_done: number
          total_steps: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          accuracy?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_seen_at?: string
          lesson_id: string
          stars?: number
          steps_done?: number
          total_steps?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          accuracy?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_seen_at?: string
          lesson_id?: string
          stars?: number
          steps_done?: number
          total_steps?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "primary_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "primary_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_hub_progress: {
        Row: {
          grade: number
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          grade: number
          state?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          grade?: number
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      primary_lessons: {
        Row: {
          created_at: string
          estimated_minutes: number
          id: string
          primary_skill: string
          sort_order: number
          steps: Json
          title_cn: string
          title_en: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          estimated_minutes?: number
          id?: string
          primary_skill: string
          sort_order?: number
          steps?: Json
          title_cn: string
          title_en: string
          unit_id: string
        }
        Update: {
          created_at?: string
          estimated_minutes?: number
          id?: string
          primary_skill?: string
          sort_order?: number
          steps?: Json
          title_cn?: string
          title_en?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "primary_lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "primary_units"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_letters: {
        Row: {
          chant_cn: string | null
          chant_en: string | null
          created_at: string
          example_words: Json
          fun_fact_cn: string | null
          id: string
          letter_lower: string
          letter_name_ipa: string
          letter_upper: string
          mouth_tip_cn: string | null
          phonics_long_ipa: string | null
          phonics_short_ipa: string | null
          sort_order: number
          stroke_order_cn: string | null
          updated_at: string
        }
        Insert: {
          chant_cn?: string | null
          chant_en?: string | null
          created_at?: string
          example_words?: Json
          fun_fact_cn?: string | null
          id?: string
          letter_lower: string
          letter_name_ipa: string
          letter_upper: string
          mouth_tip_cn?: string | null
          phonics_long_ipa?: string | null
          phonics_short_ipa?: string | null
          sort_order: number
          stroke_order_cn?: string | null
          updated_at?: string
        }
        Update: {
          chant_cn?: string | null
          chant_en?: string | null
          created_at?: string
          example_words?: Json
          fun_fact_cn?: string | null
          id?: string
          letter_lower?: string
          letter_name_ipa?: string
          letter_upper?: string
          mouth_tip_cn?: string | null
          phonics_long_ipa?: string | null
          phonics_short_ipa?: string | null
          sort_order?: number
          stroke_order_cn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      primary_listening_completion: {
        Row: {
          completed_at: string
          dialogue_id: string
          play_count: number
          questions_correct: number
          questions_total: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          dialogue_id: string
          play_count?: number
          questions_correct?: number
          questions_total?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          dialogue_id?: string
          play_count?: number
          questions_correct?: number
          questions_total?: number
          user_id?: string
        }
        Relationships: []
      }
      primary_monthly_checkups: {
        Row: {
          cert_code: string
          correct: number
          created_at: string
          grade: number
          id: string
          level_label: string
          listen_score: number
          month_key: string
          overall_score: number
          questions: Json | null
          recommendations: Json | null
          spell_score: number
          total_questions: number
          user_id: string
          vocab_score: number
          weak_themes: Json | null
        }
        Insert: {
          cert_code?: string
          correct?: number
          created_at?: string
          grade: number
          id?: string
          level_label?: string
          listen_score?: number
          month_key: string
          overall_score?: number
          questions?: Json | null
          recommendations?: Json | null
          spell_score?: number
          total_questions?: number
          user_id: string
          vocab_score?: number
          weak_themes?: Json | null
        }
        Update: {
          cert_code?: string
          correct?: number
          created_at?: string
          grade?: number
          id?: string
          level_label?: string
          listen_score?: number
          month_key?: string
          overall_score?: number
          questions?: Json | null
          recommendations?: Json | null
          spell_score?: number
          total_questions?: number
          user_id?: string
          vocab_score?: number
          weak_themes?: Json | null
        }
        Relationships: []
      }
      primary_phonics_mastery: {
        Row: {
          created_at: string
          due_at: string
          ease: number
          id: string
          interval_days: number
          last_seen_at: string | null
          listen_correct: number
          listen_wrong: number
          mastery_level: number
          phonics_id: string
          quiz_correct: number
          quiz_wrong: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_at?: string
          ease?: number
          id?: string
          interval_days?: number
          last_seen_at?: string | null
          listen_correct?: number
          listen_wrong?: number
          mastery_level?: number
          phonics_id: string
          quiz_correct?: number
          quiz_wrong?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_at?: string
          ease?: number
          id?: string
          interval_days?: number
          last_seen_at?: string | null
          listen_correct?: number
          listen_wrong?: number
          mastery_level?: number
          phonics_id?: string
          quiz_correct?: number
          quiz_wrong?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      primary_reading_articles: {
        Row: {
          cover_gradient: string | null
          created_at: string
          emoji: string | null
          estimated_minutes: number
          grade: number
          id: string
          level: number
          parent_tip: string | null
          questions: Json
          sentences: Json
          sort_order: number
          theme: string
          title_cn: string
          title_en: string
          treasure: Json
          warmup: Json
        }
        Insert: {
          cover_gradient?: string | null
          created_at?: string
          emoji?: string | null
          estimated_minutes?: number
          grade: number
          id?: string
          level?: number
          parent_tip?: string | null
          questions?: Json
          sentences?: Json
          sort_order?: number
          theme: string
          title_cn: string
          title_en: string
          treasure?: Json
          warmup?: Json
        }
        Update: {
          cover_gradient?: string | null
          created_at?: string
          emoji?: string | null
          estimated_minutes?: number
          grade?: number
          id?: string
          level?: number
          parent_tip?: string | null
          questions?: Json
          sentences?: Json
          sort_order?: number
          theme?: string
          title_cn?: string
          title_en?: string
          treasure?: Json
          warmup?: Json
        }
        Relationships: []
      }
      primary_reading_progress: {
        Row: {
          article_id: string
          best_step: number
          completed_at: string | null
          id: string
          score: number
          stars: number
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          best_step?: number
          completed_at?: string | null
          id?: string
          score?: number
          stars?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          best_step?: number
          completed_at?: string | null
          id?: string
          score?: number
          stars?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "primary_reading_progress_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "primary_reading_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_roleplay_completion: {
        Row: {
          completed_at: string
          last_choice_correct: boolean | null
          play_count: number
          roleplay_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          last_choice_correct?: boolean | null
          play_count?: number
          roleplay_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          last_choice_correct?: boolean | null
          play_count?: number
          roleplay_id?: string
          user_id?: string
        }
        Relationships: []
      }
      primary_sight_word_mastery: {
        Row: {
          context_correct: number | null
          context_wrong: number | null
          created_at: string
          due_at: string
          ease: number
          id: string
          interval_days: number
          last_seen_at: string | null
          listen_correct: number | null
          listen_wrong: number | null
          mastery_level: number
          recognize_correct: number
          recognize_wrong: number
          spell_correct: number
          spell_wrong: number
          updated_at: string
          user_id: string
          word_id: string
        }
        Insert: {
          context_correct?: number | null
          context_wrong?: number | null
          created_at?: string
          due_at?: string
          ease?: number
          id?: string
          interval_days?: number
          last_seen_at?: string | null
          listen_correct?: number | null
          listen_wrong?: number | null
          mastery_level?: number
          recognize_correct?: number
          recognize_wrong?: number
          spell_correct?: number
          spell_wrong?: number
          updated_at?: string
          user_id: string
          word_id: string
        }
        Update: {
          context_correct?: number | null
          context_wrong?: number | null
          created_at?: string
          due_at?: string
          ease?: number
          id?: string
          interval_days?: number
          last_seen_at?: string | null
          listen_correct?: number | null
          listen_wrong?: number | null
          mastery_level?: number
          recognize_correct?: number
          recognize_wrong?: number
          spell_correct?: number
          spell_wrong?: number
          updated_at?: string
          user_id?: string
          word_id?: string
        }
        Relationships: []
      }
      primary_speaking_attempts: {
        Row: {
          audio_duration_ms: number | null
          completeness_score: number
          corrections: Json | null
          created_at: string
          encouragement: string | null
          fluency_score: number
          grade: number | null
          id: string
          overall_score: number
          pronunciation_score: number
          replacements: Json | null
          scenario: string | null
          target_sentence: string
          transcript: string | null
          user_id: string
        }
        Insert: {
          audio_duration_ms?: number | null
          completeness_score?: number
          corrections?: Json | null
          created_at?: string
          encouragement?: string | null
          fluency_score?: number
          grade?: number | null
          id?: string
          overall_score?: number
          pronunciation_score?: number
          replacements?: Json | null
          scenario?: string | null
          target_sentence: string
          transcript?: string | null
          user_id: string
        }
        Update: {
          audio_duration_ms?: number | null
          completeness_score?: number
          corrections?: Json | null
          created_at?: string
          encouragement?: string | null
          fluency_score?: number
          grade?: number | null
          id?: string
          overall_score?: number
          pronunciation_score?: number
          replacements?: Json | null
          scenario?: string | null
          target_sentence?: string
          transcript?: string | null
          user_id?: string
        }
        Relationships: []
      }
      primary_storybook_completion: {
        Row: {
          book_id: string
          completed_at: string
          questions_correct: number
          questions_total: number
          read_count: number
          user_id: string
        }
        Insert: {
          book_id: string
          completed_at?: string
          questions_correct?: number
          questions_total?: number
          read_count?: number
          user_id: string
        }
        Update: {
          book_id?: string
          completed_at?: string
          questions_correct?: number
          questions_total?: number
          read_count?: number
          user_id?: string
        }
        Relationships: []
      }
      primary_unit_challenges: {
        Row: {
          accuracy: number
          created_at: string
          details: Json | null
          grade: number
          id: string
          medal: string
          passed: boolean
          score: number
          total: number
          unit_id: string
          user_id: string
        }
        Insert: {
          accuracy?: number
          created_at?: string
          details?: Json | null
          grade: number
          id?: string
          medal?: string
          passed?: boolean
          score?: number
          total?: number
          unit_id: string
          user_id: string
        }
        Update: {
          accuracy?: number
          created_at?: string
          details?: Json | null
          grade?: number
          id?: string
          medal?: string
          passed?: boolean
          score?: number
          total?: number
          unit_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "primary_unit_challenges_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "primary_units"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_units: {
        Row: {
          created_at: string
          emoji: string | null
          grade: number
          id: string
          skills: string[]
          sort_order: number
          title_cn: string
          title_en: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          grade: number
          id?: string
          skills?: string[]
          sort_order?: number
          title_cn: string
          title_en: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          grade?: number
          id?: string
          skills?: string[]
          sort_order?: number
          title_cn?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "primary_units_grade_fkey"
            columns: ["grade"]
            isOneToOne: false
            referencedRelation: "primary_grades"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_vocab: {
        Row: {
          created_at: string
          example_cn: string | null
          example_en: string | null
          grade: number
          id: string
          ipa: string | null
          meaning_cn: string
          pos: string | null
          theme: string | null
          tip: string | null
          word: string
        }
        Insert: {
          created_at?: string
          example_cn?: string | null
          example_en?: string | null
          grade: number
          id?: string
          ipa?: string | null
          meaning_cn: string
          pos?: string | null
          theme?: string | null
          tip?: string | null
          word: string
        }
        Update: {
          created_at?: string
          example_cn?: string | null
          example_en?: string | null
          grade?: number
          id?: string
          ipa?: string | null
          meaning_cn?: string
          pos?: string | null
          theme?: string | null
          tip?: string | null
          word?: string
        }
        Relationships: []
      }
      primary_word_mastery: {
        Row: {
          created_at: string
          due_at: string
          ease: number
          grade: number
          id: string
          interval_days: number
          last_seen_at: string | null
          listen_correct: number
          listen_wrong: number
          mastery_level: number
          match_correct: number
          match_wrong: number
          quiz_correct: number
          quiz_wrong: number
          spell_correct: number
          spell_wrong: number
          updated_at: string
          user_id: string
          word_id: string
        }
        Insert: {
          created_at?: string
          due_at?: string
          ease?: number
          grade: number
          id?: string
          interval_days?: number
          last_seen_at?: string | null
          listen_correct?: number
          listen_wrong?: number
          mastery_level?: number
          match_correct?: number
          match_wrong?: number
          quiz_correct?: number
          quiz_wrong?: number
          spell_correct?: number
          spell_wrong?: number
          updated_at?: string
          user_id: string
          word_id: string
        }
        Update: {
          created_at?: string
          due_at?: string
          ease?: number
          grade?: number
          id?: string
          interval_days?: number
          last_seen_at?: string | null
          listen_correct?: number
          listen_wrong?: number
          mastery_level?: number
          match_correct?: number
          match_wrong?: number
          quiz_correct?: number
          quiz_wrong?: number
          spell_correct?: number
          spell_wrong?: number
          updated_at?: string
          user_id?: string
          word_id?: string
        }
        Relationships: []
      }
      primary_word_quest_attempts: {
        Row: {
          created_at: string
          date: string
          duration_seconds: number | null
          grade: number
          id: string
          levels_completed: number
          perfect: boolean | null
          score: number | null
          total_levels: number
          user_id: string
          words: string[] | null
        }
        Insert: {
          created_at?: string
          date: string
          duration_seconds?: number | null
          grade: number
          id?: string
          levels_completed?: number
          perfect?: boolean | null
          score?: number | null
          total_levels?: number
          user_id: string
          words?: string[] | null
        }
        Update: {
          created_at?: string
          date?: string
          duration_seconds?: number | null
          grade?: number
          id?: string
          levels_completed?: number
          perfect?: boolean | null
          score?: number | null
          total_levels?: number
          user_id?: string
          words?: string[] | null
        }
        Relationships: []
      }
      primary_word_rush_attempts: {
        Row: {
          best_streak: number
          created_at: string
          date: string
          duration_seconds: number
          grade: number
          hits: number
          id: string
          misses: number
          score: number
          updated_at: string
          user_id: string
          words: Json | null
        }
        Insert: {
          best_streak?: number
          created_at?: string
          date: string
          duration_seconds?: number
          grade: number
          hits?: number
          id?: string
          misses?: number
          score?: number
          updated_at?: string
          user_id: string
          words?: Json | null
        }
        Update: {
          best_streak?: number
          created_at?: string
          date?: string
          duration_seconds?: number
          grade?: number
          hits?: number
          id?: string
          misses?: number
          score?: number
          updated_at?: string
          user_id?: string
          words?: Json | null
        }
        Relationships: []
      }
      pro_waitlist: {
        Row: {
          created_at: string
          email: string | null
          feature: string
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          feature: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          feature?: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_band: string | null
          created_at: string
          current_year_band: number | null
          daily_goal_minutes: number
          data_minimization: boolean | null
          display_name: string | null
          email: string | null
          gaokao_year: number | null
          guest_merge_decision: string | null
          id: string
          is_guest: boolean
          is_minor: boolean | null
          last_weekly_report_at: string | null
          leaderboard_alias: string | null
          leaderboard_opt_in: boolean
          learning_goal: string | null
          lessons_per_week: number
          onboarded_at: string | null
          parental_consent_at: string | null
          patience_score: number
          preferred_language: string | null
          quiz_session_size: number
          quiz_type_mix: Json
          recall_email_sent_at: string | null
          recommended_grade: number | null
          self_level: string | null
          streak_recall_sent_at: string | null
          study_days: number[]
          target_language: string
          target_score: number | null
          updated_at: string
          user_id: string
          username: string | null
          weekly_report_enabled: boolean
        }
        Insert: {
          age_band?: string | null
          created_at?: string
          current_year_band?: number | null
          daily_goal_minutes?: number
          data_minimization?: boolean | null
          display_name?: string | null
          email?: string | null
          gaokao_year?: number | null
          guest_merge_decision?: string | null
          id?: string
          is_guest?: boolean
          is_minor?: boolean | null
          last_weekly_report_at?: string | null
          leaderboard_alias?: string | null
          leaderboard_opt_in?: boolean
          learning_goal?: string | null
          lessons_per_week?: number
          onboarded_at?: string | null
          parental_consent_at?: string | null
          patience_score?: number
          preferred_language?: string | null
          quiz_session_size?: number
          quiz_type_mix?: Json
          recall_email_sent_at?: string | null
          recommended_grade?: number | null
          self_level?: string | null
          streak_recall_sent_at?: string | null
          study_days?: number[]
          target_language?: string
          target_score?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          weekly_report_enabled?: boolean
        }
        Update: {
          age_band?: string | null
          created_at?: string
          current_year_band?: number | null
          daily_goal_minutes?: number
          data_minimization?: boolean | null
          display_name?: string | null
          email?: string | null
          gaokao_year?: number | null
          guest_merge_decision?: string | null
          id?: string
          is_guest?: boolean
          is_minor?: boolean | null
          last_weekly_report_at?: string | null
          leaderboard_alias?: string | null
          leaderboard_opt_in?: boolean
          learning_goal?: string | null
          lessons_per_week?: number
          onboarded_at?: string | null
          parental_consent_at?: string | null
          patience_score?: number
          preferred_language?: string | null
          quiz_session_size?: number
          quiz_type_mix?: Json
          recall_email_sent_at?: string | null
          recommended_grade?: number | null
          self_level?: string | null
          streak_recall_sent_at?: string | null
          study_days?: number[]
          target_language?: string
          target_score?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          weekly_report_enabled?: boolean
        }
        Relationships: []
      }
      question_exam_tags: {
        Row: {
          confidence: number | null
          created_at: string
          exam_source: string | null
          exam_year: number | null
          id: string
          knowledge_point_id: string | null
          knowledge_point_label: string | null
          module: string
          question_id: string
          raw: Json
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          exam_source?: string | null
          exam_year?: number | null
          id?: string
          knowledge_point_id?: string | null
          knowledge_point_label?: string | null
          module: string
          question_id: string
          raw?: Json
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          exam_source?: string | null
          exam_year?: number | null
          id?: string
          knowledge_point_id?: string | null
          knowledge_point_label?: string | null
          module?: string
          question_id?: string
          raw?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_exam_tags_knowledge_point_id_fkey"
            columns: ["knowledge_point_id"]
            isOneToOne: false
            referencedRelation: "gaokao_reading_knowledge_points"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_streaks: {
        Row: {
          challenge_unlocked: boolean
          consecutive_count: number
          created_at: string
          id: string
          last_completed_at: string | null
          scope_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_unlocked?: boolean
          consecutive_count?: number
          created_at?: string
          id?: string
          last_completed_at?: string | null
          scope_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_unlocked?: boolean
          consecutive_count?: number
          created_at?: string
          id?: string
          last_completed_at?: string | null
          scope_key?: string
          updated_at?: string
          user_id?: string
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
          mastery_matrix: Json
          reached_master_at: string | null
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
          mastery_matrix?: Json
          reached_master_at?: string | null
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
          mastery_matrix?: Json
          reached_master_at?: string | null
          updated_at?: string
          user_id?: string
          wrong_count?: number
        }
        Relationships: []
      }
      spark_events: {
        Row: {
          context: Json
          created_at: string
          event: string
          id: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          context?: Json
          created_at?: string
          event: string
          id?: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          context?: Json
          created_at?: string
          event?: string
          id?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      stage_test_attempts: {
        Row: {
          attempt_no: number
          coins_awarded: number
          cooldown_until: string | null
          correct_count: number
          created_at: string
          exp_awarded: number
          id: string
          new_question_count: number
          passed: boolean
          score: number
          test_id: string
          total_count: number
          user_id: string
        }
        Insert: {
          attempt_no?: number
          coins_awarded?: number
          cooldown_until?: string | null
          correct_count?: number
          created_at?: string
          exp_awarded?: number
          id?: string
          new_question_count?: number
          passed?: boolean
          score?: number
          test_id: string
          total_count?: number
          user_id: string
        }
        Update: {
          attempt_no?: number
          coins_awarded?: number
          cooldown_until?: string | null
          correct_count?: number
          created_at?: string
          exp_awarded?: number
          id?: string
          new_question_count?: number
          passed?: boolean
          score?: number
          test_id?: string
          total_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "stage_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_tests: {
        Row: {
          base_coins: number
          base_exp: number
          created_at: string
          description: string | null
          grade: number
          id: string
          module: string | null
          pass_threshold: number
          required_lessons: number
          scope: string
          segment: string
          sort_order: number
          title: string
          total_questions: number
          unit_index: number | null
        }
        Insert: {
          base_coins?: number
          base_exp?: number
          created_at?: string
          description?: string | null
          grade: number
          id?: string
          module?: string | null
          pass_threshold?: number
          required_lessons?: number
          scope: string
          segment: string
          sort_order?: number
          title: string
          total_questions?: number
          unit_index?: number | null
        }
        Update: {
          base_coins?: number
          base_exp?: number
          created_at?: string
          description?: string | null
          grade?: number
          id?: string
          module?: string | null
          pass_threshold?: number
          required_lessons?: number
          scope?: string
          segment?: string
          sort_order?: number
          title?: string
          total_questions?: number
          unit_index?: number | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
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
      tutor_conversations: {
        Row: {
          context: string
          created_at: string
          hint_level: number
          id: string
          language: string
          question_ref: string
          question_snapshot: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          context: string
          created_at?: string
          hint_level?: number
          id?: string
          language?: string
          question_ref: string
          question_snapshot?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string
          created_at?: string
          hint_level?: number
          id?: string
          language?: string
          question_ref?: string
          question_snapshot?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tutor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          hint_level: number | null
          id: string
          role: string
          tokens_in: number | null
          tokens_out: number | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          hint_level?: number | null
          id?: string
          role: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          hint_level?: number | null
          id?: string
          role?: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "tutor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_usage_daily: {
        Row: {
          day: string
          message_count: number
          user_id: string
        }
        Insert: {
          day?: string
          message_count?: number
          user_id: string
        }
        Update: {
          day?: string
          message_count?: number
          user_id?: string
        }
        Relationships: []
      }
      unified_mastery_manual: {
        Row: {
          attempt_count: number | null
          correct_count: number | null
          created_at: string | null
          due_at: string | null
          ease: number | null
          grade: number
          id: string
          interval_days: number | null
          item_id: string
          item_label: string | null
          item_type: string
          last_review_at: string | null
          module: string
          stage: string
          state: string
          updated_at: string | null
          user_id: string
          wrong_count: number | null
        }
        Insert: {
          attempt_count?: number | null
          correct_count?: number | null
          created_at?: string | null
          due_at?: string | null
          ease?: number | null
          grade: number
          id?: string
          interval_days?: number | null
          item_id: string
          item_label?: string | null
          item_type: string
          last_review_at?: string | null
          module: string
          stage: string
          state?: string
          updated_at?: string | null
          user_id: string
          wrong_count?: number | null
        }
        Update: {
          attempt_count?: number | null
          correct_count?: number | null
          created_at?: string | null
          due_at?: string | null
          ease?: number | null
          grade?: number
          id?: string
          interval_days?: number | null
          item_id?: string
          item_label?: string | null
          item_type?: string
          last_review_at?: string | null
          module?: string
          stage?: string
          state?: string
          updated_at?: string | null
          user_id?: string
          wrong_count?: number | null
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
      user_currencies: {
        Row: {
          crystals: number
          seeds: number
          starlight: number
          total_seeds_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          crystals?: number
          seeds?: number
          starlight?: number
          total_seeds_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          crystals?: number
          seeds?: number
          starlight?: number
          total_seeds_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_error_analysis: {
        Row: {
          attempt_id: string | null
          confidence: number | null
          created_at: string
          error_type: string
          evidence: string | null
          id: string
          kp_id: string | null
          skill_area: string | null
          user_id: string
        }
        Insert: {
          attempt_id?: string | null
          confidence?: number | null
          created_at?: string
          error_type: string
          evidence?: string | null
          id?: string
          kp_id?: string | null
          skill_area?: string | null
          user_id: string
        }
        Update: {
          attempt_id?: string | null
          confidence?: number | null
          created_at?: string
          error_type?: string
          evidence?: string | null
          id?: string
          kp_id?: string | null
          skill_area?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_grammar_mastery: {
        Row: {
          attempts: number
          correct: number
          id: string
          last_practiced_at: string | null
          point_id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          correct?: number
          id?: string
          last_practiced_at?: string | null
          point_id: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          correct?: number
          id?: string
          last_practiced_at?: string | null
          point_id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_grammar_mastery_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "grammar_points"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mistakes: {
        Row: {
          correct_answer: string | null
          correct_streak: number
          created_at: string
          explanation: string | null
          id: string
          is_resolved: boolean
          is_starred: boolean
          last_correct_date: string | null
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
          correct_streak?: number
          created_at?: string
          explanation?: string | null
          id?: string
          is_resolved?: boolean
          is_starred?: boolean
          last_correct_date?: string | null
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
          correct_streak?: number
          created_at?: string
          explanation?: string | null
          id?: string
          is_resolved?: boolean
          is_starred?: boolean
          last_correct_date?: string | null
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
      user_pet_skills: {
        Row: {
          id: string
          progress: number
          skill_code: string
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          progress?: number
          skill_code: string
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          progress?: number
          skill_code?: string
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pet_skins: {
        Row: {
          acquired_at: string
          id: string
          skin_id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          skin_id: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          skin_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pet_skins_skin_id_fkey"
            columns: ["skin_id"]
            isOneToOne: false
            referencedRelation: "pet_skins"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pets: {
        Row: {
          created_at: string
          equipped_skin_id: string | null
          exp: number
          hatched_at: string | null
          hunger: number
          id: string
          is_active: boolean
          last_decay_at: string
          last_fed_at: string | null
          last_played_at: string | null
          level: number
          mood: number
          nickname: string
          species_id: string
          stage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          equipped_skin_id?: string | null
          exp?: number
          hatched_at?: string | null
          hunger?: number
          id?: string
          is_active?: boolean
          last_decay_at?: string
          last_fed_at?: string | null
          last_played_at?: string | null
          level?: number
          mood?: number
          nickname: string
          species_id: string
          stage?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          equipped_skin_id?: string | null
          exp?: number
          hatched_at?: string | null
          hunger?: number
          id?: string
          is_active?: boolean
          last_decay_at?: string
          last_fed_at?: string | null
          last_played_at?: string | null
          level?: number
          mood?: number
          nickname?: string
          species_id?: string
          stage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pets_equipped_skin_id_fkey"
            columns: ["equipped_skin_id"]
            isOneToOne: false
            referencedRelation: "pet_skins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pets_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "pet_species"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          current_page: string | null
          grade_band: string | null
          last_seen: string
          user_id: string
        }
        Insert: {
          current_page?: string | null
          grade_band?: string | null
          last_seen?: string
          user_id: string
        }
        Update: {
          current_page?: string | null
          grade_band?: string | null
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_social_settings: {
        Row: {
          display_emoji: string | null
          grade_band: string | null
          social_visible: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          display_emoji?: string | null
          grade_band?: string | null
          social_visible?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          display_emoji?: string | null
          grade_band?: string | null
          social_visible?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_waves: {
        Row: {
          created_at: string
          emoji: string
          from_user: string
          id: string
          to_user: string
          wave_date: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          from_user: string
          id?: string
          to_user: string
          wave_date?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          from_user?: string
          id?: string
          to_user?: string
          wave_date?: string
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
      wishlist: {
        Row: {
          added_at: string
          cooldown_until: string
          id: string
          item_id: string
          item_kind: string
          purchased_at: string | null
          removed_at: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          cooldown_until: string
          id?: string
          item_id: string
          item_kind: string
          purchased_at?: string | null
          removed_at?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          cooldown_until?: string
          id?: string
          item_id?: string
          item_kind?: string
          purchased_at?: string | null
          removed_at?: string | null
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
      mastery_by_grade: {
        Row: {
          fluent: number | null
          grade: number | null
          master: number | null
          none: number | null
          score_pct: number | null
          stage: string | null
          total: number | null
          user_id: string | null
          weak: number | null
        }
        Relationships: []
      }
      mastery_by_module: {
        Row: {
          fluent: number | null
          grade: number | null
          master: number | null
          module: string | null
          none: number | null
          score_pct: number | null
          stage: string | null
          total: number | null
          user_id: string | null
          weak: number | null
        }
        Relationships: []
      }
      mastery_by_module_overall: {
        Row: {
          fluent: number | null
          master: number | null
          module: string | null
          none: number | null
          score_pct: number | null
          total: number | null
          user_id: string | null
          weak: number | null
        }
        Relationships: []
      }
      mastery_by_skill: {
        Row: {
          accuracy_pct: number | null
          attempts: number | null
          corrects: number | null
          fluent_count: number | null
          master_count: number | null
          none_count: number | null
          score_pct: number | null
          skill: string | null
          total: number | null
          user_id: string | null
          weak_count: number | null
        }
        Relationships: []
      }
      mastery_by_stage: {
        Row: {
          fluent: number | null
          master: number | null
          none: number | null
          score_pct: number | null
          stage: string | null
          total: number | null
          user_id: string | null
          weak: number | null
        }
        Relationships: []
      }
      mastery_module_proportion: {
        Row: {
          fluent_count: number | null
          master_count: number | null
          module: string | null
          module_total: number | null
          none_count: number | null
          proportion_pct: number | null
          score_pct: number | null
          user_id: string | null
          user_total: number | null
          weak_count: number | null
        }
        Relationships: []
      }
      mastery_overall: {
        Row: {
          fluent: number | null
          master: number | null
          none: number | null
          score_pct: number | null
          total: number | null
          user_id: string | null
          weak: number | null
        }
        Relationships: []
      }
      mastery_stage_proportion: {
        Row: {
          fluent_count: number | null
          master_count: number | null
          none_count: number | null
          proportion_pct: number | null
          score_pct: number | null
          stage: string | null
          stage_total: number | null
          user_id: string | null
          user_total: number | null
          weak_count: number | null
        }
        Relationships: []
      }
      mastery_with_proportions: {
        Row: {
          fluent_count: number | null
          fluent_pct: number | null
          grade: number | null
          master_count: number | null
          master_pct: number | null
          module: string | null
          none_count: number | null
          none_pct: number | null
          proportion_of_total: number | null
          scope_total: number | null
          score_pct: number | null
          stage: string | null
          user_id: string | null
          user_total: number | null
          weak_count: number | null
          weak_pct: number | null
        }
        Relationships: []
      }
      unified_mastery: {
        Row: {
          accuracy_pct: number | null
          attempt_count: number | null
          correct_count: number | null
          due_at: string | null
          grade: number | null
          id: string | null
          item_id: string | null
          item_label: string | null
          item_type: string | null
          last_review_at: string | null
          module: string | null
          stage: string | null
          state: string | null
          updated_at: string | null
          user_id: string | null
          wrong_count: number | null
        }
        Relationships: []
      }
      v_gaokao_all_knowledge_points: {
        Row: {
          category_code: string | null
          category_name: string | null
          difficulty: number | null
          exam_frequency: string | null
          example: string | null
          id: string | null
          level1: string | null
          level2: string | null
          level3: string | null
          pitfall: string | null
          skill_area: string | null
          source_id: string | null
          strategy: string | null
          year_band: number | null
        }
        Relationships: []
      }
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
      add_pending_seed: {
        Args: { _amount: number; _source: string }
        Returns: number
      }
      bump_mistake_correct: {
        Args: { _module: string; _source_key: string }
        Returns: {
          already_today: boolean
          correct_streak: number
          is_resolved: boolean
        }[]
      }
      adopt_pet: {
        Args: { _nickname: string; _species_id: string }
        Returns: {
          balance: number
          pet_id: string
        }[]
      }
      are_friends: { Args: { _a: string; _b: string }; Returns: boolean }
      award_coins: {
        Args: { _amount: number }
        Returns: {
          balance: number
          total_earned: number
        }[]
      }
      award_for_item: {
        Args: {
          _amount: number
          _item_id: string
          _module?: string
          _source: string
        }
        Returns: {
          awarded: number
          balance: number
          capped: boolean
          reason: string
        }[]
      }
      award_learning_coins: {
        Args: { _amount: number; _source?: string }
        Returns: {
          awarded: number
          balance: number
          capped: boolean
        }[]
      }
      award_referrer: {
        Args: { _amount?: number; _card_id: string; _ref_user_id: string }
        Returns: {
          awarded: number
          reason: string
        }[]
      }
      bump_pet_skill: {
        Args: { _delta?: number; _skill_code: string }
        Returns: {
          progress: number
          threshold: number
          unlocked: boolean
        }[]
      }
      buy_listing: { Args: { _listing_id: string }; Returns: undefined }
      buy_pet_food: {
        Args: { _food_id: string; _qty: number }
        Returns: {
          balance: number
          new_qty: number
        }[]
      }
      buy_pet_skin: { Args: { _skin_id: string }; Returns: Json }
      cancel_duel_queue: { Args: never; Returns: undefined }
      cancel_listing: { Args: { _listing_id: string }; Returns: undefined }
      check_and_consume_ai_quota: {
        Args: { _estimated_tokens?: number; _feature: string }
        Returns: {
          allowed: boolean
          remaining_calls: number
          remaining_tokens: number
        }[]
      }
      claim_guest_card_attempts: { Args: { _token: string }; Returns: number }
      claim_reflection_energy: {
        Args: {
          _correct_was: string
          _i_thought: string
          _item_id: string
          _module: string
          _why_wrong: string
          _word: string
        }
        Returns: {
          awarded: number
          reason: string
        }[]
      }
      complete_daily_task: {
        Args: { _coins?: number; _task_key: string; _xp?: number }
        Returns: {
          all_done: boolean
          already_done: boolean
          coins_awarded: number
          total_today: number
          xp_awarded: number
        }[]
      }
      confirm_wishlist_purchase: {
        Args: { _wishlist_id: string }
        Returns: {
          days_held: number
          ok: boolean
          patience_after: number
          reason: string
        }[]
      }
      consume_question_quota: { Args: never; Returns: Json }
      contribute_community_goal: {
        Args: { _amount: number; _goal_code: string }
        Returns: {
          completed: boolean
          current_value: number
          target_value: number
        }[]
      }
      coop_contribute: {
        Args: { _correct: number; _session_id: string }
        Returns: undefined
      }
      coop_join: { Args: { _grade: string }; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      equip_pet_skin: {
        Args: { _pet_id: string; _skin_id: string }
        Returns: Json
      }
      feed_pet: {
        Args: { _food_id: string; _pet_id: string }
        Returns: {
          evolved: boolean
          leveled: boolean
          message: string
          new_exp: number
          new_hunger: number
          new_level: number
          new_stage: number
        }[]
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
      get_deep_diagnosis: { Args: { p_user_id: string }; Returns: Json }
      get_diagnostic_summary: { Args: { p_user_id: string }; Returns: Json }
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
      get_my_active_pet: {
        Args: never
        Returns: {
          exp: number
          hunger: number
          id: string
          level: number
          mood: number
          nickname: string
          species_id: string
          stage: number
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
      get_or_create_monthly_postcard: {
        Args: never
        Returns: {
          created_at: string
          destination_cn: string
          destination_emoji: string
          id: string
          message_cn: string
          month_key: string
          pet_id: string
          read_at: string | null
          trip_end: string
          trip_start: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "pet_postcards"
          isOneToOne: false
          isSetofReturn: true
        }
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
      get_parent_dashboard: { Args: { _days?: number }; Returns: Json }
      get_quota_status: { Args: never; Returns: Json }
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
      get_today_task_state: {
        Args: never
        Returns: {
          coins_awarded: number
          completed_at: string
          task_key: string
          xp_awarded: number
        }[]
      }
      get_user_dashboard_summary: { Args: { p_user_id: string }; Returns: Json }
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
      get_user_tier: { Args: { _user_id: string }; Returns: string }
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
      graduate_cohort_without_essay: {
        Args: { p_cohort_id: string }
        Returns: undefined
      }
      guest_email_for_username: { Args: { _name: string }; Returns: string }
      has_active_subscription: { Args: { user_uuid: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      init_cohort_with_self_rate: {
        Args: { p_seeds: Json; p_theme_tag?: string; p_word_ids: string[] }
        Returns: {
          cohort_word_ids: string[]
          created_at: string
          graduated_at: string | null
          graduated_without_essay: boolean
          id: string
          last_active_at: string
          sequence_no: number
          started_at: string
          status: Database["public"]["Enums"]["cohort_status"]
          theme_tag: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "gaokao_user_active_cohort"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_current_user_minor: { Args: never; Returns: boolean }
      is_username_clean: { Args: { _name: string }; Returns: boolean }
      leaderboard_pets_week: {
        Args: { _grade?: string; _limit?: number }
        Returns: {
          display_emoji: string
          level: number
          pet_emoji: string
          pet_name: string
          user_id: string
          username: string
        }[]
      }
      leaderboard_today: {
        Args: { _grade?: string; _limit?: number }
        Returns: {
          display_emoji: string
          earned: number
          user_id: string
          username: string
        }[]
      }
      list_food: {
        Args: { _food_id: string; _price: number; _qty: number }
        Returns: string
      }
      list_friend_requests: {
        Args: never
        Returns: {
          created_at: string
          direction: string
          display_name: string
          other_id: string
          request_id: string
          username: string
        }[]
      }
      list_friends: {
        Args: never
        Returns: {
          display_name: string
          friend_id: string
          is_online: boolean
          pet_emoji: string
          pet_hunger: number
          pet_level: number
          pet_nickname: string
          pet_stage: number
          username: string
        }[]
      }
      list_my_pet_visitors: {
        Args: never
        Returns: {
          display_name: string
          last_visit: string
          username: string
          visitor_id: string
          visits: number
        }[]
      }
      list_pet_photos: {
        Args: { _other: string }
        Returns: {
          caption: string
          created_at: string
          host_id: string
          id: string
          visitor_id: string
        }[]
      }
      list_stage_tests:
        | {
            Args: { _grade: number; _segment: string }
            Returns: {
              attempt_count: number
              base_coins: number
              base_exp: number
              best_score: number
              completed_lessons: number
              cooldown_until: string
              description: string
              id: string
              next_reward_coins: number
              next_reward_exp: number
              pass_count: number
              pass_threshold: number
              required_lessons: number
              scope: string
              sort_order: number
              title: string
              total_questions: number
              unit_index: number
              unlocked: boolean
            }[]
          }
        | {
            Args: { _grade: number; _module?: string; _segment: string }
            Returns: {
              attempt_count: number
              base_coins: number
              base_exp: number
              best_score: number
              completed_lessons: number
              cooldown_until: string
              description: string
              id: string
              module: string
              next_reward_coins: number
              next_reward_exp: number
              pass_count: number
              pass_threshold: number
              required_lessons: number
              scope: string
              sort_order: number
              title: string
              total_questions: number
              unit_index: number
              unlocked: boolean
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
      merge_guest_to_real_user: {
        Args: { p_guest_user_id: string; p_real_user_id: string }
        Returns: number
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
      online_count: { Args: { _grade?: string }; Returns: number }
      post_activity: {
        Args: { _emoji: string; _kind: string; _message: string; _meta?: Json }
        Returns: string
      }
      presence_ping: {
        Args: { _grade?: string; _page?: string }
        Returns: undefined
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      record_cohort_attempt: {
        Args: {
          p_cohort_id: string
          p_correct: boolean
          p_kind: string
          p_mastery: Json
          p_source: string
          p_vocab_id: string
        }
        Returns: Json
      }
      record_grammar_attempt: {
        Args: { p_correct: boolean; p_slug: string }
        Returns: {
          attempts: number
          correct: number
          id: string
          last_practiced_at: string | null
          point_id: string
          score: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_grammar_mastery"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remove_friend: { Args: { _other: string }; Returns: Json }
      request_friend: { Args: { _username: string }; Returns: Json }
      respond_friend: {
        Args: { _accept: boolean; _request_id: string }
        Returns: Json
      }
      resume_cohort: {
        Args: { p_cohort_id: string }
        Returns: {
          cohort_word_ids: string[]
          created_at: string
          graduated_at: string | null
          graduated_without_essay: boolean
          id: string
          last_active_at: string
          sequence_no: number
          started_at: string
          status: Database["public"]["Enums"]["cohort_status"]
          theme_tag: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "gaokao_user_active_cohort"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      run_mastery_snapshot: { Args: { _snap_date: string }; Returns: number }
      send_gift: {
        Args: { _food_id: string; _to_user: string }
        Returns: undefined
      }
      send_wave: {
        Args: { _emoji?: string; _to_user: string }
        Returns: undefined
      }
      set_active_pet: { Args: { _pet_id: string }; Returns: undefined }
      set_parent_delay_hours: {
        Args: { _cap?: number; _hours: number }
        Returns: undefined
      }
      settle_matured_seeds: {
        Args: never
        Returns: {
          crystals: number
          pending: number
          seeds: number
          starlight: number
        }[]
      }
      start_new_cohort: {
        Args: { p_theme_tag?: string; p_word_ids: string[] }
        Returns: {
          cohort_word_ids: string[]
          created_at: string
          graduated_at: string | null
          graduated_without_essay: boolean
          id: string
          last_active_at: string
          sequence_no: number
          started_at: string
          status: Database["public"]["Enums"]["cohort_status"]
          theme_tag: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "gaokao_user_active_cohort"
          isOneToOne: true
          isSetofReturn: false
        }
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
      submit_cohort_essay: {
        Args: {
          p_cohort_id: string
          p_refinement: string
          p_score: number
          p_sentence: string
          p_strength: string
          p_words_used: string[]
        }
        Returns: string
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
      submit_stage_test: {
        Args: {
          _correct: number
          _new_question_count?: number
          _test_id: string
          _total: number
        }
        Returns: {
          coins_awarded: number
          cooldown_until: string
          evolved: boolean
          exp_awarded: number
          message: string
          new_balance: number
          new_pet_level: number
          passed: boolean
          score: number
        }[]
      }
      take_pet_outing: {
        Args: { _dest_id: string; _pet_id: string }
        Returns: {
          balance: number
          new_exp: number
          new_hunger: number
          new_level: number
          surprise: string
        }[]
      }
      take_pet_photo: {
        Args: { _caption: string; _friend_id: string }
        Returns: Json
      }
      tick_pet_hunger: {
        Args: { _pet_id: string }
        Returns: {
          decayed: number
          hunger: number
          mood: number
        }[]
      }
      upgrade_guest_to_full: {
        Args: { _real_email: string }
        Returns: undefined
      }
      username_available: { Args: { _name: string }; Returns: boolean }
      validate_username: { Args: { _name: string }; Returns: string }
      visit_friend_pet: { Args: { _friend_id: string }; Returns: Json }
      weekly_growth_letter: {
        Args: never
        Returns: {
          active_days: number
          minutes_active: number
          patience_score: number
          pet_level: number
          pet_name: string
          quiz_correct: number
          weak_module: string
        }[]
      }
      wishlist_add: {
        Args: { _item_id: string; _kind: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      cohort_status: "active" | "dormant" | "graduated"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      cohort_status: ["active", "dormant", "graduated"],
    },
  },
} as const
