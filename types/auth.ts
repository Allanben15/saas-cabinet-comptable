/**
 * Types pour l'authentification
 */

import type { User } from '@supabase/supabase-js'
import type { Profile } from './database.types'

// État de l'authentification
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

// Utilisateur avec son profil
export interface AuthUser {
  user: User
  profile: Profile | null
}

// Formulaire de connexion
export interface LoginFormData {
  email: string
  password: string
}

// Formulaire d'inscription
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

// Résultat d'authentification
export interface AuthResult {
  success: boolean
  error?: string
  redirectTo?: string
}
