/**
 * Store Zustand pour le Wiki collaboratif
 * Gère les notes Wiki publiques avec XP et tags
 */

import { create } from 'zustand'
import type { WikiNote, WikiNoteInsert, WikiNoteUpdate, WikiNoteWithAuthor } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

interface WikiState {
  // État
  notes: WikiNoteWithAuthor[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedTags: string[]

  // Note en cours
  activeNote: WikiNoteWithAuthor | null

  // Actions
  setSearchQuery: (query: string) => void
  setSelectedTags: (tags: string[]) => void
  setActiveNote: (note: WikiNoteWithAuthor | null) => void

  // CRUD
  fetchNotes: () => Promise<void>
  fetchNote: (id: string) => Promise<WikiNoteWithAuthor | null>
  createNote: (note: Partial<WikiNoteInsert>) => Promise<{ error: string | null; note: WikiNote | null; xpGained: number }>
  updateNote: (id: string, updates: WikiNoteUpdate) => Promise<{ error: string | null }>
  deleteNote: (id: string) => Promise<{ error: string | null }>
  publishNote: (id: string) => Promise<{ error: string | null; xpGained: number }>

  // Recherche
  searchNotes: (query: string) => Promise<void>
}

export const useWikiStore = create<WikiState>((set, get) => ({
  // État initial
  notes: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedTags: [],
  activeNote: null,

  // Setters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  setActiveNote: (note) => set({ activeNote: note }),

  // Récupérer toutes les notes publiées
  fetchNotes: async () => {
    const supabase = createClient()
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('wiki_notes')
        .select(`
          *,
          author:profiles!wiki_notes_author_id_fkey(id, full_name, avatar_type, avatar_color)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ notes: data || [], isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement'
      })
    }
  },

  // Récupérer une note spécifique
  fetchNote: async (id) => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('wiki_notes')
        .select(`
          *,
          author:profiles!wiki_notes_author_id_fkey(id, full_name, avatar_type, avatar_color)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Incrémenter le compteur de vues
      await supabase
        .from('wiki_notes')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id)

      return data
    } catch (error) {
      console.error('Erreur fetchNote:', error)
      return null
    }
  },

  // Créer une note Wiki
  createNote: async (noteData) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'Non authentifié', note: null, xpGained: 0 }
      }

      const { data, error } = await supabase
        .from('wiki_notes')
        .insert({
          author_id: user.id,
          title: noteData.title || 'Sans titre',
          content: noteData.content || '',
          tags: noteData.tags || [],
          is_published: false,
        })
        .select()
        .single()

      if (error) throw error

      return { error: null, note: data, xpGained: 0 }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la création'
      set({ error: message })
      return { error: message, note: null, xpGained: 0 }
    }
  },

  // Mettre à jour une note
  updateNote: async (id, updates) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const { error } = await supabase
        .from('wiki_notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      // Recharger les notes
      await get().fetchNotes()

      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      set({ error: message })
      return { error: message }
    }
  },

  // Supprimer une note
  deleteNote: async (id) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const { error } = await supabase
        .from('wiki_notes')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote
      }))

      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression'
      set({ error: message })
      return { error: message }
    }
  },

  // Publier une note et gagner de l'XP
  publishNote: async (id) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const note = get().notes.find((n) => n.id === id) || await get().fetchNote(id)
      if (!note) {
        return { error: 'Note non trouvée', xpGained: 0 }
      }

      // Vérifier la longueur minimum (200 caractères)
      if (note.content.length < 200) {
        return { error: 'La note doit contenir au moins 200 caractères pour être publiée', xpGained: 0 }
      }

      // Vérifier les tags (au moins 1)
      if (!note.tags || note.tags.length === 0) {
        return { error: 'Ajoutez au moins un tag avant de publier', xpGained: 0 }
      }

      // Publier la note
      const { error: updateError } = await supabase
        .from('wiki_notes')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          xp_awarded: 20,
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Ajouter l'XP
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.rpc('add_xp_to_user', {
          p_user_id: user.id,
          p_xp_amount: 20,
          p_source_type: 'wiki_note',
          p_source_id: id,
          p_reason: `Note Wiki publiée: ${note.title}`,
        })
      }

      // Recharger les notes
      await get().fetchNotes()

      return { error: null, xpGained: 20 }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la publication'
      set({ error: message })
      return { error: message, xpGained: 0 }
    }
  },

  // Recherche
  searchNotes: async (query) => {
    if (!query.trim()) {
      await get().fetchNotes()
      return
    }

    const supabase = createClient()
    set({ isLoading: true, error: null, searchQuery: query })

    try {
      const { data, error } = await supabase
        .from('wiki_notes')
        .select(`
          *,
          author:profiles!wiki_notes_author_id_fkey(id, full_name, avatar_type, avatar_color)
        `)
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ notes: data || [], isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de recherche'
      })
    }
  },
}))

// Sélecteur pour les tags uniques
export const useWikiTags = () => {
  const { notes } = useWikiStore()
  const allTags = notes.flatMap((note) => note.tags || [])
  return [...new Set(allTags)].sort()
}

// Sélecteur pour filtrer par tags
export const useFilteredWikiNotes = () => {
  const { notes, selectedTags } = useWikiStore()

  if (selectedTags.length === 0) return notes

  return notes.filter((note) =>
    selectedTags.some((tag) => note.tags?.includes(tag))
  )
}
