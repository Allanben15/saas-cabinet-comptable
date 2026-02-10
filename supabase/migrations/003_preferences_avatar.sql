-- =====================================================
-- Cabinet SaaS - Migration 003
-- Préférences utilisateur + Avatar customization
-- =====================================================

-- =====================================================
-- AJOUT COLONNE PREFERENCES (JSONB)
-- =====================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Commentaire pour documentation
COMMENT ON COLUMN public.profiles.preferences IS 'Préférences utilisateur: editor, display, gamification';

-- =====================================================
-- AMÉLIORATION AVATAR
-- =====================================================

-- Ajouter les colonnes manquantes pour customisation avatar 2D
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_customization JSONB DEFAULT '{}';

COMMENT ON COLUMN public.profiles.avatar_customization IS 'Customisation avatar 2D: skinTone, hairStyle, hairColor, outfit, accessory, expression';

-- Ajouter flag onboarding avatar
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_completed_avatar_onboarding BOOLEAN DEFAULT FALSE;

-- =====================================================
-- TABLE: clients (pour Sprint 2)
-- =====================================================
-- Types pour les clients
DO $$ BEGIN
  CREATE TYPE legal_form AS ENUM ('EI', 'EIRL', 'EURL', 'SARL', 'SAS', 'SASU', 'SA', 'SNC', 'SCI', 'ASSOCIATION', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE client_type AS ENUM ('TPE', 'PME', 'ETI', 'GE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE client_status AS ENUM ('PROSPECT', 'ACTIVE', 'DORMANT', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE vat_regime AS ENUM ('FRANCHISE', 'REEL_SIMPLIFIE', 'REEL_NORMAL', 'MINI_REEL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE client_role AS ENUM ('MANAGER', 'COLLABORATOR', 'VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table des clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  siren TEXT UNIQUE,
  siret TEXT,
  legal_form legal_form DEFAULT 'SARL',
  type client_type DEFAULT 'TPE',
  sector TEXT,
  status client_status DEFAULT 'ACTIVE',
  color TEXT, -- Couleur hex pour UI
  fiscal_year_end INTEGER DEFAULT 12,
  vat_regime vat_regime DEFAULT 'REEL_NORMAL',

  -- Créateur
  created_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- Contacts clients
CREATE TABLE IF NOT EXISTS public.client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignation utilisateurs aux clients
CREATE TABLE IF NOT EXISTS public.user_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  role client_role DEFAULT 'COLLABORATOR',
  is_favorite BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, client_id)
);

-- Ajouter client_id aux tables existantes
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);

ALTER TABLE public.personal_notes
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);

-- Ajouter client actif au profil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS active_client_id UUID REFERENCES public.clients(id);

-- =====================================================
-- CHAMPS NOTES POUR AUTO-SAVE
-- =====================================================
ALTER TABLE public.personal_notes
ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMPTZ;

ALTER TABLE public.personal_notes
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE public.wiki_notes
ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMPTZ;

-- =====================================================
-- INDEX
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_siren ON public.clients(siren);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON public.clients(created_by_id);

CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON public.client_contacts(client_id);

CREATE INDEX IF NOT EXISTS idx_user_clients_user_id ON public.user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_clients_client_id ON public.user_clients(client_id);

CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_status ON public.tasks(client_id, status);

CREATE INDEX IF NOT EXISTS idx_personal_notes_client_id ON public.personal_notes(client_id);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;

-- Clients: Lecture pour tous les utilisateurs assignés
CREATE POLICY "Users can view assigned clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    created_by_id = auth.uid() OR
    id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid())
  );

-- Clients: Création par tous
CREATE POLICY "Authenticated users can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by_id);

-- Clients: Modification par créateur ou manager
CREATE POLICY "Creators and managers can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    created_by_id = auth.uid() OR
    id IN (SELECT client_id FROM user_clients WHERE user_id = auth.uid() AND role = 'MANAGER')
  );

-- Contacts: Lecture pour utilisateurs assignés au client
CREATE POLICY "Users can view contacts of assigned clients"
  ON client_contacts FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE created_by_id = auth.uid()
      UNION
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- User-Clients: Lecture pour l'utilisateur concerné
CREATE POLICY "Users can view own client assignments"
  ON user_clients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- User-Clients: Création par managers/créateurs du client
CREATE POLICY "Managers can assign users to clients"
  ON user_clients FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE created_by_id = auth.uid()
      UNION
      SELECT client_id FROM user_clients WHERE user_id = auth.uid() AND role = 'MANAGER'
    )
  );

-- =====================================================
-- FONCTION: Récupérer le contexte client
-- =====================================================
CREATE OR REPLACE FUNCTION get_client_context(p_user_id UUID)
RETURNS TABLE(
  active_client JSONB,
  recent_clients JSONB,
  favorite_clients JSONB
) AS $$
DECLARE
  v_active_client_id UUID;
BEGIN
  -- Récupérer le client actif
  SELECT active_client_id INTO v_active_client_id
  FROM profiles WHERE id = p_user_id;

  -- Client actif
  SELECT jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'siren', c.siren,
    'type', c.type,
    'status', c.status,
    'color', c.color
  ) INTO active_client
  FROM clients c
  WHERE c.id = v_active_client_id;

  -- Clients récents (5 derniers accès)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'type', c.type,
      'color', c.color
    ) ORDER BY uc.last_access DESC NULLS LAST
  ), '[]'::jsonb) INTO recent_clients
  FROM user_clients uc
  JOIN clients c ON c.id = uc.client_id
  WHERE uc.user_id = p_user_id
    AND c.status = 'ACTIVE'
    AND uc.last_access IS NOT NULL
  LIMIT 5;

  -- Clients favoris
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'type', c.type,
      'color', c.color
    )
  ), '[]'::jsonb) INTO favorite_clients
  FROM user_clients uc
  JOIN clients c ON c.id = uc.client_id
  WHERE uc.user_id = p_user_id
    AND uc.is_favorite = TRUE
    AND c.status = 'ACTIVE';

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
