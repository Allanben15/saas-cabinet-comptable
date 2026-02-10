/**
 * Store Zustand pour la gestion de l'avatar
 * Gère la customisation 2D et 3D avec persistance Supabase
 */

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { AvatarState } from '@/types/database.types'

// Types pour la customisation avatar 2D
export interface AvatarCustomization2D {
  skinTone: 'light' | 'medium' | 'tan' | 'dark' | 'deep'
  hairStyle: 'short' | 'medium' | 'long' | 'curly' | 'bald' | 'ponytail'
  hairColor: string // hex color
  outfit: 'casual' | 'business' | 'formal' | 'creative'
  accessory: 'none' | 'glasses' | 'sunglasses' | 'earrings' | 'hat'
  expression: 'neutral' | 'happy' | 'focused' | 'confident'
}

// Valeurs par défaut
const DEFAULT_CUSTOMIZATION: AvatarCustomization2D = {
  skinTone: 'medium',
  hairStyle: 'short',
  hairColor: '#3B2D24',
  outfit: 'business',
  accessory: 'none',
  expression: 'neutral',
}

// Couleurs de skin prédéfinies
export const SKIN_TONES: Record<AvatarCustomization2D['skinTone'], string> = {
  light: '#FFE4C4',
  medium: '#DEB887',
  tan: '#D2A679',
  dark: '#8B5E3C',
  deep: '#5C4033',
}

// Couleurs de cheveux prédéfinies
export const HAIR_COLORS = [
  '#3B2D24', // Brun foncé
  '#6B4423', // Brun
  '#D4A574', // Blond
  '#FFD700', // Blond clair
  '#DC143C', // Roux
  '#2C1810', // Noir
  '#808080', // Gris
  '#FF69B4', // Rose fantaisie
  '#4169E1', // Bleu fantaisie
]

interface AvatarStoreState {
  // État
  avatarUrl: string | null // URL GLB Ready Player Me
  customization: AvatarCustomization2D
  avatarState: AvatarState
  avatarColor: string
  isLoading: boolean
  hasCompletedOnboarding: boolean

  // Actions
  setAvatarUrl: (url: string | null) => Promise<void>
  setCustomization: (customization: Partial<AvatarCustomization2D>) => Promise<void>
  setAvatarState: (state: AvatarState) => void
  setAvatarColor: (color: string) => Promise<void>
  completeOnboarding: () => Promise<void>

  // Chargement
  loadAvatar: () => Promise<void>
  saveAvatar: () => Promise<void>

  // Reset
  resetCustomization: () => void
}

export const useAvatarStore = create<AvatarStoreState>((set, get) => ({
  // État initial
  avatarUrl: null,
  customization: DEFAULT_CUSTOMIZATION,
  avatarState: 'neutral',
  avatarColor: '#6366f1',
  isLoading: false,
  hasCompletedOnboarding: false,

  // Définir l'URL de l'avatar 3D
  setAvatarUrl: async (url) => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      set({ avatarUrl: url })
    } catch (error) {
      console.error('Erreur setAvatarUrl:', error)
    }
  },

  // Définir la customisation 2D
  setCustomization: async (partialCustomization) => {
    const newCustomization = { ...get().customization, ...partialCustomization }
    set({ customization: newCustomization })

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_customization: newCustomization,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Erreur setCustomization:', error)
    }
  },

  // État de l'avatar (neutre, productif, fatigué)
  setAvatarState: (state) => {
    set({ avatarState: state })
  },

  // Couleur de l'avatar
  setAvatarColor: async (color) => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_color: color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      set({ avatarColor: color })
    } catch (error) {
      console.error('Erreur setAvatarColor:', error)
    }
  },

  // Marquer l'onboarding avatar comme complété
  completeOnboarding: async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          has_completed_avatar_onboarding: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      set({ hasCompletedOnboarding: true })
    } catch (error) {
      console.error('Erreur completeOnboarding:', error)
    }
  },

  // Charger l'avatar depuis le serveur
  loadAvatar: async () => {
    const supabase = createClient()
    set({ isLoading: true })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ isLoading: false })
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, avatar_customization, avatar_state, avatar_color, has_completed_avatar_onboarding')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        set({
          avatarUrl: data.avatar_url || null,
          customization: {
            ...DEFAULT_CUSTOMIZATION,
            ...(data.avatar_customization as Partial<AvatarCustomization2D> || {}),
          },
          avatarState: data.avatar_state || 'neutral',
          avatarColor: data.avatar_color || '#6366f1',
          hasCompletedOnboarding: data.has_completed_avatar_onboarding || false,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Erreur loadAvatar:', error)
      set({ isLoading: false })
    }
  },

  // Sauvegarder l'avatar (tout en une fois)
  saveAvatar: async () => {
    const supabase = createClient()
    const { avatarUrl, customization, avatarColor } = get()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          avatar_customization: customization,
          avatar_color: avatarColor,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Erreur saveAvatar:', error)
    }
  },

  // Reset la customisation
  resetCustomization: () => {
    set({ customization: DEFAULT_CUSTOMIZATION })
  },
}))

// Sélecteurs
export const useHas3DAvatar = () => {
  const { avatarUrl } = useAvatarStore()
  return avatarUrl && avatarUrl.endsWith('.glb')
}

export const useAvatarStateColor = () => {
  const { avatarState } = useAvatarStore()

  const colors: Record<AvatarState, { bg: string; border: string }> = {
    neutral: { bg: 'bg-slate-100', border: 'border-slate-300' },
    productive: { bg: 'bg-green-100', border: 'border-green-400' },
    tired: { bg: 'bg-amber-100', border: 'border-amber-400' },
  }

  return colors[avatarState]
}

export default useAvatarStore
