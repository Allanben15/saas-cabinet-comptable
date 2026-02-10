-- =====================================================
-- Cabinet SaaS - Notes Personnelles
-- =====================================================
-- Migration pour ajouter les notes personnelles avec PIN

-- Type pour le format de note
CREATE TYPE note_format AS ENUM ('markdown', 'richtext', 'list', 'freeform');

-- =====================================================
-- TABLE: personal_notes
-- =====================================================
CREATE TABLE public.personal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Contenu
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  format note_format DEFAULT 'markdown',

  -- Organisation
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMPTZ,
  color TEXT, -- Couleur optionnelle pour la note

  -- Confidentialité
  is_encrypted BOOLEAN DEFAULT FALSE,
  encrypted_content TEXT,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEX
-- =====================================================
CREATE INDEX idx_personal_notes_user_id ON public.personal_notes(user_id);
CREATE INDEX idx_personal_notes_pinned ON public.personal_notes(user_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_personal_notes_updated ON public.personal_notes(user_id, updated_at DESC);

-- Index pour recherche full-text
CREATE INDEX idx_personal_notes_search ON public.personal_notes
  USING GIN(to_tsvector('french', title || ' ' || content));

-- =====================================================
-- TRIGGER: updated_at
-- =====================================================
CREATE TRIGGER update_personal_notes_updated_at
  BEFORE UPDATE ON personal_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE personal_notes ENABLE ROW LEVEL SECURITY;

-- Notes personnelles: CRUD uniquement pour le propriétaire
CREATE POLICY "Users can view own notes"
  ON personal_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON personal_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON personal_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON personal_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- FONCTION: Recherche full-text dans les notes
-- =====================================================
CREATE OR REPLACE FUNCTION search_personal_notes(
  p_user_id UUID,
  p_query TEXT
)
RETURNS SETOF personal_notes AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM personal_notes
  WHERE user_id = p_user_id
    AND to_tsvector('french', title || ' ' || content) @@ plainto_tsquery('french', p_query)
  ORDER BY ts_rank(to_tsvector('french', title || ' ' || content), plainto_tsquery('french', p_query)) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
