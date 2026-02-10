/**
 * Store Zustand pour la gamification
 * Gère XP, niveaux, badges et notifications
 */

import { create } from 'zustand'
import type { Badge, UserBadge, Profile } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

// Configuration XP
export const XP_CONFIG = {
  DAILY_CAP: 500,
  MAX_LEVEL: 100,
  // XP requis pour atteindre un niveau = 50 * (niveau - 1)^1.85
  // Progression exponentielle sur 100 niveaux (de plus en plus difficile):
  // Niveau 10: ~1,400 XP (~3 jours)
  // Niveau 25: ~7,500 XP (~15 jours)
  // Niveau 50: ~29,000 XP (~2 mois)
  // Niveau 75: ~62,000 XP (~4 mois)
  // Niveau 100: ~110,000 XP (~7 mois)
  calculateXPForLevel: (level: number): number => {
    if (level <= 1) return 0
    return Math.floor(50 * Math.pow(level - 1, 1.85))
  },
  // Calculer le niveau à partir de l'XP total
  calculateLevelFromXP: (totalXP: number): number => {
    let level = 1
    while (level < XP_CONFIG.MAX_LEVEL && totalXP >= XP_CONFIG.calculateXPForLevel(level + 1)) {
      level++
    }
    return level
  },
}

// Types pour les notifications
export interface GamificationNotification {
  id: string
  type: 'xp_gain' | 'level_up' | 'badge_unlock' | 'daily_cap'
  title: string
  description: string
  xpAmount?: number
  newLevel?: number
  badge?: Badge
  timestamp: Date
}

interface GamificationState {
  // Données
  badges: Badge[]
  userBadges: UserBadge[]
  notifications: GamificationNotification[]
  isLoading: boolean

  // Actions
  fetchBadges: () => Promise<void>
  fetchUserBadges: () => Promise<void>
  checkAndUnlockBadges: (profile: Profile) => Promise<Badge[]>

  // Notifications
  addNotification: (notification: Omit<GamificationNotification, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void
  clearNotifications: () => void

  // XP
  showXPGain: (amount: number, reason: string) => void
  showLevelUp: (newLevel: number) => void
  showBadgeUnlock: (badge: Badge) => void
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  badges: [],
  userBadges: [],
  notifications: [],
  isLoading: false,

  // Récupérer tous les badges disponibles
  fetchBadges: async () => {
    const supabase = createClient()
    set({ isLoading: true })

    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('rarity', { ascending: true })

      if (error) throw error
      set({ badges: data || [], isLoading: false })
    } catch (error) {
      console.error('Erreur fetchBadges:', error)
      set({ isLoading: false })
    }
  },

  // Récupérer les badges de l'utilisateur
  fetchUserBadges: async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', user.id)

      if (error) throw error
      set({ userBadges: data || [] })
    } catch (error) {
      console.error('Erreur fetchUserBadges:', error)
    }
  },

  // Vérifier et débloquer les badges
  checkAndUnlockBadges: async (profile: Profile) => {
    const supabase = createClient()
    const { badges, userBadges } = get()
    const unlockedBadgeIds = userBadges.map((ub) => ub.badge_id)
    const newlyUnlocked: Badge[] = []

    for (const badge of badges) {
      if (unlockedBadgeIds.includes(badge.id)) continue

      const condition = badge.unlock_condition as Record<string, unknown>
      let shouldUnlock = false

      switch (condition.type) {
        case 'account_created':
          shouldUnlock = true
          break
        case 'level_reached':
          shouldUnlock = profile.current_level >= (condition.count as number)
          break
        case 'login_streak':
          shouldUnlock = profile.login_streak >= (condition.count as number)
          break
        // Les autres conditions nécessitent des requêtes supplémentaires
        // Elles seront vérifiées côté serveur
      }

      if (shouldUnlock) {
        try {
          const { error } = await supabase
            .from('user_badges')
            .insert({
              user_id: profile.id,
              badge_id: badge.id,
            })

          if (!error) {
            newlyUnlocked.push(badge)
            get().showBadgeUnlock(badge)
          }
        } catch (e) {
          console.error('Erreur unlock badge:', e)
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      await get().fetchUserBadges()
    }

    return newlyUnlocked
  },

  // Ajouter une notification
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      notifications: [
        { ...notification, id, timestamp: new Date() },
        ...state.notifications,
      ].slice(0, 10), // Garder max 10 notifications
    }))
  },

  // Supprimer une notification
  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  // Effacer toutes les notifications
  clearNotifications: () => {
    set({ notifications: [] })
  },

  // Afficher un gain d'XP
  showXPGain: (amount, reason) => {
    get().addNotification({
      type: 'xp_gain',
      title: `+${amount} XP`,
      description: reason,
      xpAmount: amount,
    })
  },

  // Afficher un level up
  showLevelUp: (newLevel) => {
    get().addNotification({
      type: 'level_up',
      title: `Niveau ${newLevel} !`,
      description: 'Félicitations, vous avez progressé !',
      newLevel,
    })
  },

  // Afficher un déblocage de badge
  showBadgeUnlock: (badge) => {
    get().addNotification({
      type: 'badge_unlock',
      title: 'Nouveau badge !',
      description: badge.name,
      badge,
    })
  },
}))

// Sélecteur pour les badges non débloqués
export const useLockedBadges = () => {
  const { badges, userBadges } = useGamificationStore()
  const unlockedIds = userBadges.map((ub) => ub.badge_id)
  return badges.filter((b) => !unlockedIds.includes(b.id))
}

// Sélecteur pour les badges débloqués avec détails
export const useUnlockedBadgesWithDetails = () => {
  const { userBadges } = useGamificationStore()
  return userBadges
    .filter((ub) => ub.badge)
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
}
