/**
 * Types de base de données générés depuis le schéma SQL
 * Correspond à supabase/migrations/001_initial_schema.sql
 */

export type AvatarState = 'neutral' | 'productive' | 'tired';

export type TaskType = 'personal' | 'professional';

export type TaskStatus = 'todo' | 'in_progress' | 'in_validation' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export type BadgeCategory =
  | 'onboarding'
  | 'collaboration'
  | 'engagement'
  | 'productivity'
  | 'quality'
  | 'progression'
  | 'metier';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type XPSourceType =
  | 'task_personal'
  | 'task_professional'
  | 'wiki_note'
  | 'daily_login'
  | 'badge_unlock'
  | 'manual';

// =====================================================
// TYPES CLIENT (Multi-tenant)
// =====================================================

export type ClientType = 'tpe' | 'pme' | 'eti' | 'ge';

export type ClientStatus = 'active' | 'inactive' | 'archived';

export type ClientRole = 'owner' | 'manager' | 'member' | 'viewer';

// =====================================================
// TYPES PRÉFÉRENCES UTILISATEUR
// =====================================================

export interface EditorPreferences {
  fontFamily: 'inter' | 'roboto' | 'mono' | 'system';
  fontSize: number;
  lineHeight: number;
  showLineNumbers: boolean;
  wordWrap: boolean;
  spellCheck: boolean;
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  showAnimations: boolean;
  sidebarCollapsed: boolean;
  defaultTaskView: 'kanban' | 'list' | 'calendar';
  defaultNoteFormat: NoteFormat;
}

export interface GamificationPreferences {
  showXPNotifications: boolean;
  showLevelUpAnimations: boolean;
  showStreak: boolean;
  showLeaderboard: boolean;
  anonymousMode: boolean;
}

export interface UserPreferences {
  editor: EditorPreferences;
  display: DisplayPreferences;
  gamification: GamificationPreferences;
}

// =====================================================
// TYPES AVATAR PERSONNALISÉ
// =====================================================

export type SkinTone = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';
export type HairStyle = 'short' | 'medium' | 'long' | 'buzz' | 'bald' | 'ponytail' | 'bun';
export type Outfit = 'casual' | 'business' | 'formal' | 'sporty';
export type Accessory = 'none' | 'glasses' | 'sunglasses' | 'hat' | 'headphones';
export type Expression = 'neutral' | 'happy' | 'focused' | 'tired';

export interface AvatarCustomization {
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: string;
  outfit: Outfit;
  accessory: Accessory;
  expression: Expression;
}

// =====================================================
// TABLES
// =====================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;

  // Avatar 2D (fallback)
  avatar_type: string;
  avatar_color: string;
  avatar_accessory: string | null;
  avatar_state: AvatarState;

  // Avatar 3D (Ready Player Me)
  avatar_url: string | null; // URL du modèle GLB

  // Avatar personnalisé (V5.0)
  avatar_customization: AvatarCustomization | null;
  has_completed_avatar_onboarding: boolean;

  // Gamification
  total_xp: number;
  current_level: number;
  xp_today: number;
  last_xp_reset_date: string; // Date ISO

  // Streak
  login_streak: number;
  last_login_date: string | null; // Date ISO

  // Préférences utilisateur (V5.0)
  preferences: UserPreferences | null;

  // Client actif (V5.0 - Multi-tenant)
  active_client_id: string | null;

  // Métadonnées
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;

  // Client (V5.0 - Multi-tenant)
  client_id: string | null;

  // Contenu
  title: string;
  description: string | null;

  // Type et confidentialité
  task_type: TaskType;
  is_encrypted: boolean;
  encrypted_content: string | null;

  // Statut
  status: TaskStatus;
  priority: TaskPriority;

  // Dates
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;

  // Validation
  validated_by: string | null;
  validated_at: string | null;
  validation_comment: string | null;

  // XP
  xp_awarded: number;
  xp_claimed: boolean;
}

export interface WikiNote {
  id: string;
  author_id: string;

  // Contenu
  title: string;
  content: string;
  tags: string[];

  // Statut
  is_published: boolean;
  view_count: number;

  // Versioning
  version: number;
  parent_version_id: string | null;

  // Dates
  created_at: string;
  updated_at: string;
  published_at: string | null;

  // XP
  xp_awarded: number;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  unlock_condition: Record<string, any>; // JSON
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;

  // Relations
  badge?: Badge;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  xp_amount: number;
  source_type: XPSourceType;
  source_id: string | null;
  reason: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action_type: string;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// =====================================================
// VUES
// =====================================================

export interface LeaderboardEntry {
  rank: number;
  current_level: number;
  total_xp: number;
  anonymous_name: string;
}

export interface TeamStats {
  total_users: number;
  avg_level: number;
  total_team_xp: number;
  active_today: number;
}

export interface TaskPendingValidation extends Task {
  author_name: string | null;
}

// =====================================================
// TYPES D'INSERTION (sans champs auto-générés)
// =====================================================

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at' | 'total_xp' | 'current_level' | 'xp_today' | 'last_xp_reset_date' | 'login_streak'> & {
  id: string; // Vient de auth.users
};

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'validated_by' | 'validated_at' | 'validation_comment' | 'xp_awarded' | 'xp_claimed'>;

export type WikiNoteInsert = Omit<WikiNote, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'view_count' | 'version' | 'xp_awarded'>;

export type UserBadgeInsert = Omit<UserBadge, 'id' | 'unlocked_at'>;

// =====================================================
// TYPES DE MISE À JOUR (tous les champs optionnels)
// =====================================================

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>;

export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>;

export type WikiNoteUpdate = Partial<Omit<WikiNote, 'id' | 'author_id' | 'created_at'>>;

// =====================================================
// TYPES ÉTENDUS AVEC RELATIONS
// =====================================================

export interface TaskWithAuthor extends Task {
  author: Pick<Profile, 'id' | 'full_name' | 'avatar_type' | 'avatar_color'> | null;
  validator?: Pick<Profile, 'id' | 'full_name'> | null;
}

export interface WikiNoteWithAuthor extends WikiNote {
  author: Pick<Profile, 'id' | 'full_name' | 'avatar_type' | 'avatar_color'> | null;
}

export interface ProfileWithBadges extends Profile {
  badges: UserBadge[];
}

// =====================================================
// RÉPONSES DE FONCTIONS
// =====================================================

export interface AddXPResult {
  old_level: number;
  new_level: number;
  level_up: boolean;
  new_total_xp: number;
  xp_gained: number;
}

// =====================================================
// NOTES PERSONNELLES
// =====================================================

export type NoteFormat = 'markdown' | 'richtext' | 'list' | 'freeform';

export interface PersonalNote {
  id: string;
  user_id: string;

  // Client (V5.0 - Multi-tenant)
  client_id: string | null;

  // Contenu
  title: string;
  content: string;
  format: NoteFormat;

  // Organisation
  is_pinned: boolean;
  pinned_at: string | null;
  color: string | null;

  // Confidentialité
  is_encrypted: boolean;
  encrypted_content: string | null;

  // Métadonnées
  created_at: string;
  updated_at: string;
}

// =====================================================
// CLIENTS (V5.0 - Multi-tenant)
// =====================================================

export interface Client {
  id: string;

  // Informations
  name: string;
  legal_name: string | null;
  siren: string | null;
  siret: string | null;
  tva_number: string | null;

  // Type et statut
  client_type: ClientType;
  status: ClientStatus;

  // Adresse
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;

  // Contact principal
  phone: string | null;
  email: string | null;
  website: string | null;

  // Personnalisation
  logo_url: string | null;
  color: string | null;

  // Notes
  notes: string | null;

  // Métadonnées
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string;
  client_id: string;

  // Informations
  first_name: string;
  last_name: string;
  role: string | null;

  // Contact
  email: string | null;
  phone: string | null;
  mobile: string | null;

  // Statut
  is_primary: boolean;
  is_active: boolean;

  // Notes
  notes: string | null;

  // Métadonnées
  created_at: string;
  updated_at: string;
}

export interface UserClient {
  id: string;
  user_id: string;
  client_id: string;

  // Rôle et permissions
  role: ClientRole;

  // Préférences
  is_favorite: boolean;

  // Métadonnées
  joined_at: string;

  // Relations
  client?: Client;
}

export type PersonalNoteInsert = Omit<PersonalNote, 'id' | 'created_at' | 'updated_at' | 'pinned_at'>;

export type PersonalNoteUpdate = Partial<Omit<PersonalNote, 'id' | 'user_id' | 'created_at'>>;

// =====================================================
// TYPES D'INSERTION - CLIENTS (V5.0)
// =====================================================

export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

export type ClientContactInsert = Omit<ClientContact, 'id' | 'created_at' | 'updated_at'>;

export type UserClientInsert = Omit<UserClient, 'id' | 'joined_at' | 'client'>;

// =====================================================
// TYPES DE MISE À JOUR - CLIENTS (V5.0)
// =====================================================

export type ClientUpdate = Partial<Omit<Client, 'id' | 'created_by' | 'created_at'>>;

export type ClientContactUpdate = Partial<Omit<ClientContact, 'id' | 'client_id' | 'created_at'>>;

export type UserClientUpdate = Partial<Omit<UserClient, 'id' | 'user_id' | 'client_id' | 'joined_at'>>;

// =====================================================
// TYPES ÉTENDUS - CLIENTS (V5.0)
// =====================================================

export interface ClientWithContacts extends Client {
  contacts: ClientContact[];
}

export interface ClientWithMembers extends Client {
  members: (UserClient & { user: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> })[];
}

export interface TaskWithClient extends Task {
  client: Pick<Client, 'id' | 'name' | 'color'> | null;
}

export interface PersonalNoteWithClient extends PersonalNote {
  client: Pick<Client, 'id' | 'name' | 'color'> | null;
}
