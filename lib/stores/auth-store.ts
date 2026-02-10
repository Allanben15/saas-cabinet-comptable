/**
 * Store Zustand pour la gestion de l'authentification
 * Gère l'état utilisateur, la connexion et la déconnexion
 */

import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database.types'
import type { AuthStatus } from '@/types/auth'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
  // État
  user: User | null
  profile: Profile | null
  status: AuthStatus

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setStatus: (status: AuthStatus) => void

  // Actions async
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  refreshProfile: () => Promise<void> // Alias pour fetchProfile
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // État initial
  user: null,
  profile: null,
  status: 'loading',

  // Setters
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setStatus: (status) => set({ status }),

  // Initialiser l'état d'auth (appelé au chargement de l'app)
  initialize: async () => {
    const supabase = createClient()

    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        set({ user: null, profile: null, status: 'unauthenticated' })
        return
      }

      set({ user, status: 'authenticated' })

      // Charger le profil
      await get().fetchProfile()
    } catch {
      set({ user: null, profile: null, status: 'unauthenticated' })
    }
  },

  // Connexion email/password
  signIn: async (email, password) => {
    const supabase = createClient()
    set({ status: 'loading' })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ status: 'unauthenticated' })
      return { error: getErrorMessage(error.message) }
    }

    set({ user: data.user, status: 'authenticated' })
    await get().fetchProfile()

    return { error: null }
  },

  // Inscription
  signUp: async (email, password, fullName) => {
    const supabase = createClient()
    set({ status: 'loading' })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      set({ status: 'unauthenticated' })
      return { error: getErrorMessage(error.message) }
    }

    // Si email de confirmation requis
    if (!data.user?.confirmed_at) {
      set({ status: 'unauthenticated' })
      return { error: null } // Pas d'erreur, mais attente confirmation
    }

    set({ user: data.user, status: 'authenticated' })
    await get().fetchProfile()

    return { error: null }
  },

  // Déconnexion
  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null, status: 'unauthenticated' })
  },

  // Charger le profil utilisateur
  fetchProfile: async () => {
    const { user } = get()
    if (!user) return

    const supabase = createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      set({ profile })
    }
  },

  // Alias pour fetchProfile (rafraîchir le profil après une modification)
  refreshProfile: async () => {
    await get().fetchProfile()
  },
}))

// Convertir les messages d'erreur Supabase en français
function getErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    'Invalid login credentials': 'Email ou mot de passe incorrect',
    'Email not confirmed': 'Veuillez confirmer votre email',
    'User already registered': 'Un compte existe déjà avec cet email',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    'Unable to validate email address: invalid format': 'Format d\'email invalide',
  }

  return messages[error] || error
}
