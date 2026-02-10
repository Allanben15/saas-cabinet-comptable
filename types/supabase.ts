/**
 * Types Supabase générés depuis le schéma
 * Ces types sont utilisés pour la sécurité de type avec le client Supabase
 */

import type {
  Profile,
  Task,
  WikiNote,
  Badge,
  UserBadge,
  XPTransaction,
  AuditLog,
} from './database.types';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>;
      };
      wiki_notes: {
        Row: WikiNote;
        Insert: Omit<WikiNote, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WikiNote, 'id' | 'author_id' | 'created_at'>>;
      };
      badges: {
        Row: Badge;
        Insert: Omit<Badge, 'id' | 'created_at'>;
        Update: Partial<Omit<Badge, 'id' | 'created_at'>>;
      };
      user_badges: {
        Row: UserBadge;
        Insert: Omit<UserBadge, 'id' | 'unlocked_at'>;
        Update: never;
      };
      xp_transactions: {
        Row: XPTransaction;
        Insert: Omit<XPTransaction, 'id' | 'created_at'>;
        Update: never;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Views: {
      leaderboard_anonymous: {
        Row: {
          rank: number;
          current_level: number;
          total_xp: number;
          anonymous_name: string;
        };
      };
      team_stats: {
        Row: {
          total_users: number;
          avg_level: number;
          total_team_xp: number;
          active_today: number;
        };
      };
      tasks_pending_validation: {
        Row: Task & {
          author_name: string | null;
        };
      };
    };
    Functions: {
      calculate_xp_for_level: {
        Args: { level: number };
        Returns: number;
      };
      calculate_level_from_xp: {
        Args: { total_xp: number };
        Returns: number;
      };
      add_xp_to_user: {
        Args: {
          p_user_id: string;
          p_xp_amount: number;
          p_source_type: string;
          p_source_id?: string;
          p_reason?: string;
        };
        Returns: {
          old_level: number;
          new_level: number;
          level_up: boolean;
          new_total_xp: number;
          xp_gained: number;
        };
      };
    };
  };
};
