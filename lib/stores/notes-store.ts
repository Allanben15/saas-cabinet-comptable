/**
 * Store Zustand pour les notes personnelles
 * Gère le CRUD des notes avec support PIN et recherche
 */

import { create } from 'zustand'
import type { PersonalNote, PersonalNoteInsert, PersonalNoteUpdate, NoteFormat } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

interface NotesState {
  // État
  notes: PersonalNote[]
  isLoading: boolean
  error: string | null
  searchQuery: string

  // Note en cours d'édition
  activeNote: PersonalNote | null

  // Actions
  setSearchQuery: (query: string) => void
  setActiveNote: (note: PersonalNote | null) => void

  // CRUD
  fetchNotes: () => Promise<void>
  createNote: (note: Partial<PersonalNoteInsert>) => Promise<{ error: string | null; note: PersonalNote | null }>
  updateNote: (id: string, updates: PersonalNoteUpdate) => Promise<{ error: string | null }>
  deleteNote: (id: string) => Promise<{ error: string | null }>

  // Actions spécifiques
  togglePin: (id: string) => Promise<{ error: string | null }>
  searchNotes: (query: string) => Promise<void>
}

export const useNotesStore = create<NotesState>((set, get) => ({
  // État initial
  notes: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  activeNote: null,

  // Setters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveNote: (note) => set({ activeNote: note }),

  // Récupérer toutes les notes
  fetchNotes: async () => {
    const supabase = createClient()
    set({ isLoading: true, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ isLoading: false, error: 'Non authentifié' })
        return
      }

      const { data, error } = await supabase
        .from('personal_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (error) throw error

      set({ notes: data || [], isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement'
      })
    }
  },

  // Créer une note
  createNote: async (noteData) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'Non authentifié', note: null }
      }

      const { data, error } = await supabase
        .from('personal_notes')
        .insert({
          user_id: user.id,
          title: noteData.title || 'Sans titre',
          content: noteData.content || '',
          format: noteData.format || 'markdown',
          is_pinned: false,
          is_encrypted: false,
          color: noteData.color || null,
        })
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        notes: [data, ...state.notes]
      }))

      return { error: null, note: data }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la création'
      set({ error: message })
      return { error: message, note: null }
    }
  },

  // Mettre à jour une note
  updateNote: async (id, updates) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const { error } = await supabase
        .from('personal_notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, ...updates, updated_at: new Date().toISOString() } : note
        ),
        activeNote: state.activeNote?.id === id
          ? { ...state.activeNote, ...updates, updated_at: new Date().toISOString() }
          : state.activeNote
      }))

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
        .from('personal_notes')
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

  // Épingler/Désépingler une note
  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return { error: 'Note non trouvée' }

    const newPinned = !note.is_pinned
    const pinnedCount = get().notes.filter((n) => n.is_pinned).length

    // Limite de 10 notes épinglées
    if (newPinned && pinnedCount >= 10) {
      return { error: 'Maximum 10 notes épinglées' }
    }

    return get().updateNote(id, {
      is_pinned: newPinned,
      pinned_at: newPinned ? new Date().toISOString() : null,
    })
  },

  // Recherche full-text
  searchNotes: async (query) => {
    if (!query.trim()) {
      await get().fetchNotes()
      return
    }

    const supabase = createClient()
    set({ isLoading: true, error: null, searchQuery: query })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ isLoading: false })
        return
      }

      // Recherche simple côté client pour l'instant
      // (la fonction RPC nécessite que la migration soit appliquée)
      const { data, error } = await supabase
        .from('personal_notes')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('updated_at', { ascending: false })

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

// Sélecteurs
export const usePinnedNotes = () => {
  const { notes } = useNotesStore()
  return notes.filter((note) => note.is_pinned)
}

export const useRecentNotes = (limit = 10) => {
  const { notes } = useNotesStore()
  return notes.filter((note) => !note.is_pinned).slice(0, limit)
}
