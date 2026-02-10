-- =====================================================
-- Cabinet SaaS - Schéma initial de base de données
-- =====================================================
-- Ce fichier crée toutes les tables nécessaires pour le MVP
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TYPES ÉNUMÉRÉS
-- =====================================================
CREATE TYPE avatar_state AS ENUM ('neutral', 'productive', 'tired');
CREATE TYPE task_type AS ENUM ('personal', 'professional');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_validation', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE badge_category AS ENUM ('onboarding', 'collaboration', 'engagement', 'productivity', 'quality', 'progression', 'metier');
CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE xp_source_type AS ENUM ('task_personal', 'task_professional', 'wiki_note', 'daily_login', 'badge_unlock', 'manual');

-- =====================================================
-- TABLE: profiles
-- =====================================================
-- Profils utilisateurs (extension de auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,

  -- Avatar 2D (fallback)
  avatar_type TEXT DEFAULT 'default',
  avatar_color TEXT DEFAULT '#6366f1',
  avatar_accessory TEXT,
  avatar_state avatar_state DEFAULT 'neutral',

  -- Avatar 3D (Ready Player Me)
  avatar_url TEXT, -- URL du modèle GLB

  -- Gamification
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_today INTEGER DEFAULT 0,
  last_xp_reset_date DATE DEFAULT CURRENT_DATE,

  -- Streak
  login_streak INTEGER DEFAULT 0,
  last_login_date DATE,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: tasks
-- =====================================================
-- Tâches personnelles et professionnelles
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Contenu
  title TEXT NOT NULL,
  description TEXT,

  -- Type et confidentialité
  task_type task_type NOT NULL DEFAULT 'personal',
  is_encrypted BOOLEAN DEFAULT FALSE,
  encrypted_content TEXT,

  -- Statut
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',

  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validation (pour tâches pro)
  validated_by UUID REFERENCES public.profiles(id),
  validated_at TIMESTAMPTZ,
  validation_comment TEXT,

  -- XP
  xp_awarded INTEGER DEFAULT 0,
  xp_claimed BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- TABLE: wiki_notes
-- =====================================================
-- Notes Wiki collaboratives
CREATE TABLE public.wiki_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Contenu
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',

  -- Statut
  is_published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,

  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES public.wiki_notes(id),

  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- XP
  xp_awarded INTEGER DEFAULT 0
);

-- =====================================================
-- TABLE: badges
-- =====================================================
-- Définition des badges disponibles
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category badge_category NOT NULL,
  rarity badge_rarity NOT NULL,
  unlock_condition JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: user_badges
-- =====================================================
-- Badges débloqués par utilisateur
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, badge_id)
);

-- =====================================================
-- TABLE: xp_transactions
-- =====================================================
-- Historique des gains d'XP
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source_type xp_source_type NOT NULL,
  source_id UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: audit_logs
-- =====================================================
-- Logs d'audit RGPD
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEX
-- =====================================================
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_wiki_notes_author_id ON public.wiki_notes(author_id);
CREATE INDEX idx_wiki_notes_tags ON public.wiki_notes USING GIN(tags);
CREATE INDEX idx_wiki_notes_published ON public.wiki_notes(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON public.xp_transactions(created_at);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =====================================================
-- FONCTIONS
-- =====================================================

-- Fonction: Calculer l'XP requis pour un niveau
-- Formule: 50 * (niveau - 1)^1.85
-- Progression exponentielle (de plus en plus difficile):
-- Niveau 10: ~1,400 XP (~3 jours)
-- Niveau 25: ~7,500 XP (~15 jours)
-- Niveau 50: ~29,000 XP (~2 mois)
-- Niveau 75: ~62,000 XP (~4 mois)
-- Niveau 100: ~110,000 XP (~7 mois)
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF level <= 1 THEN
    RETURN 0;
  END IF;
  RETURN FLOOR(50 * POWER(level - 1, 1.85))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction: Calculer le niveau à partir de l'XP total
CREATE OR REPLACE FUNCTION calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  level INTEGER := 1;
  max_level INTEGER := 100;
BEGIN
  WHILE level < max_level AND total_xp >= calculate_xp_for_level(level + 1) LOOP
    level := level + 1;
  END LOOP;
  RETURN level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction: Ajouter de l'XP à un utilisateur
CREATE OR REPLACE FUNCTION add_xp_to_user(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source_type xp_source_type,
  p_source_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(
  old_level INTEGER,
  new_level INTEGER,
  level_up BOOLEAN,
  new_total_xp INTEGER,
  xp_gained INTEGER
) AS $$
DECLARE
  v_profile RECORD;
  v_daily_cap INTEGER := 500;
  v_actual_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Récupérer le profil actuel
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Réinitialiser xp_today si nouveau jour
  IF v_profile.last_xp_reset_date < CURRENT_DATE THEN
    UPDATE profiles SET xp_today = 0, last_xp_reset_date = CURRENT_DATE WHERE id = p_user_id;
    v_profile.xp_today := 0;
  END IF;

  -- Calculer l'XP réel (avec plafond quotidien)
  v_actual_xp := LEAST(p_xp_amount, v_daily_cap - v_profile.xp_today);
  IF v_actual_xp <= 0 THEN
    v_actual_xp := 0;
  END IF;

  v_old_level := v_profile.current_level;

  -- Mettre à jour le profil
  UPDATE profiles SET
    total_xp = total_xp + v_actual_xp,
    xp_today = xp_today + v_actual_xp,
    current_level = calculate_level_from_xp(total_xp + v_actual_xp),
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING current_level, total_xp INTO v_new_level, new_total_xp;

  -- Enregistrer la transaction
  IF v_actual_xp > 0 THEN
    INSERT INTO xp_transactions (user_id, xp_amount, source_type, source_id, reason)
    VALUES (p_user_id, v_actual_xp, p_source_type, p_source_id, p_reason);
  END IF;

  old_level := v_old_level;
  new_level := v_new_level;
  level_up := v_new_level > v_old_level;
  xp_gained := v_actual_xp;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Créer un profil automatiquement
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- TRIGGER: Mettre à jour updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wiki_notes_updated_at
  BEFORE UPDATE ON wiki_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Profiles: Lecture pour tous les authentifiés, modification pour soi-même
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Tasks: CRUD uniquement pour ses propres tâches
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Wiki Notes: Lecture pour tous si publié, CRUD pour auteur
CREATE POLICY "Anyone can view published wiki notes"
  ON wiki_notes FOR SELECT
  TO authenticated
  USING (is_published = true OR auth.uid() = author_id);

CREATE POLICY "Users can create wiki notes"
  ON wiki_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own wiki notes"
  ON wiki_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own wiki notes"
  ON wiki_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- User Badges: Lecture pour tous, création système uniquement
CREATE POLICY "Users can view all user badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

-- Badges: Lecture pour tous
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- XP Transactions: Lecture de ses propres transactions
CREATE POLICY "Users can view own xp transactions"
  ON xp_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- DONNÉES INITIALES: Badges
-- =====================================================
INSERT INTO badges (slug, name, description, icon, category, rarity, unlock_condition) VALUES
  -- Onboarding
  ('first_step', 'Premier Pas', 'Créer son compte', '🌟', 'onboarding', 'common', '{"type": "account_created"}'),
  -- Productivité
  ('finisher', 'Finisseur', 'Compléter 5 tâches', '✅', 'productivity', 'common', '{"type": "tasks_completed", "count": 5}'),
  ('achiever', 'Réalisateur', 'Compléter 25 tâches', '🎯', 'productivity', 'rare', '{"type": "tasks_completed", "count": 25}'),
  ('expert_worker', 'Travailleur Expert', 'Faire valider 50 tâches', '💼', 'productivity', 'epic', '{"type": "tasks_validated", "count": 50}'),
  ('speedrunner', 'Speedrunner', 'Terminer 10 tâches avant deadline', '🚀', 'productivity', 'rare', '{"type": "tasks_before_deadline", "count": 10}'),
  -- Collaboration
  ('contributor', 'Contributeur', 'Créer sa première note Wiki', '📝', 'collaboration', 'common', '{"type": "wiki_notes_created", "count": 1}'),
  ('encyclopedist', 'Encyclopédiste', 'Créer 20 notes Wiki', '📚', 'collaboration', 'epic', '{"type": "wiki_notes_created", "count": 20}'),
  ('mentor', 'Mentor', 'Valider 10 tâches de pairs', '💎', 'collaboration', 'epic', '{"type": "validations_given", "count": 10}'),
  -- Engagement
  ('perfect_week', 'Semaine Parfaite', '7 jours consécutifs actifs', '🔥', 'engagement', 'rare', '{"type": "login_streak", "count": 7}'),
  ('monthly_streak', 'Mois de Feu', '30 jours consécutifs actifs', '🔥', 'engagement', 'epic', '{"type": "login_streak", "count": 30}'),
  -- Progression (100 niveaux)
  ('apprentice', 'Apprenti', 'Atteindre le niveau 10', '⭐', 'progression', 'common', '{"type": "level_reached", "count": 10}'),
  ('expert', 'Expert', 'Atteindre le niveau 25', '💎', 'progression', 'rare', '{"type": "level_reached", "count": 25}'),
  ('master', 'Maître', 'Atteindre le niveau 50', '🏆', 'progression', 'epic', '{"type": "level_reached", "count": 50}'),
  ('champion', 'Champion', 'Atteindre le niveau 75', '🏅', 'progression', 'epic', '{"type": "level_reached", "count": 75}'),
  ('elite', 'Élite', 'Atteindre le niveau 90', '💫', 'progression', 'legendary', '{"type": "level_reached", "count": 90}'),
  ('legend', 'Légende', 'Atteindre le niveau 100', '👑', 'progression', 'legendary', '{"type": "level_reached", "count": 100}');
