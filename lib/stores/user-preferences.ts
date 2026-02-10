/**
 * Store Zustand pour les préférences utilisateur
 * Persistence localStorage + synchronisation serveur
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

// Types pour les préférences éditeur
export interface EditorPreferences {
  fontFamily: 'inter' | 'roboto' | 'merriweather' | 'fira-code' | 'jetbrains-mono'
  fontSize: 14 | 16 | 18 | 20
  lineHeight: 1.4 | 1.6 | 1.8 | 2.0
  showLineNumbers: boolean
  wordWrap: boolean
  spellCheck: boolean
}

// Types pour les préférences d'affichage
export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  sidebarWidth: number
  animationsEnabled: boolean
  compactMode: boolean
  showXPNotifications: boolean
  showBadgeNotifications: boolean
}

// Types pour les préférences de gamification
export interface GamificationPreferences {
  showXPBar: boolean
  showLevel: boolean
  showStreak: boolean
  enableSounds: boolean
  celebrationAnimations: boolean
}

// Valeurs par défaut
const DEFAULT_EDITOR: EditorPreferences = {
  fontFamily: 'inter',
  fontSize: 16,
  lineHeight: 1.6,
  showLineNumbers: false,
  wordWrap: true,
  spellCheck: true,
}

const DEFAULT_DISPLAY: DisplayPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  sidebarWidth: 288,
  animationsEnabled: true,
  compactMode: false,
  showXPNotifications: true,
  showBadgeNotifications: true,
}

const DEFAULT_GAMIFICATION: GamificationPreferences = {
  showXPBar: true,
  showLevel: true,
  showStreak: true,
  enableSounds: false,
  celebrationAnimations: true,
}

interface UserPreferencesState {
  // Préférences
  editor: EditorPreferences
  display: DisplayPreferences
  gamification: GamificationPreferences

  // État
  isLoading: boolean
  isSyncing: boolean
  lastSyncedAt: Date | null

  // Actions éditeur
  setEditorPreference: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) => void

  // Actions affichage
  setDisplayPreference: <K extends keyof DisplayPreferences>(
    key: K,
    value: DisplayPreferences[K]
  ) => void

  // Actions gamification
  setGamificationPreference: <K extends keyof GamificationPreferences>(
    key: K,
    value: GamificationPreferences[K]
  ) => void

  // Sync
  syncToServer: () => Promise<void>
  loadFromServer: () => Promise<void>

  // Reset
  resetEditor: () => void
  resetDisplay: () => void
  resetGamification: () => void
  resetAll: () => void
}

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      // État initial
      editor: DEFAULT_EDITOR,
      display: DEFAULT_DISPLAY,
      gamification: DEFAULT_GAMIFICATION,
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,

      // Actions éditeur
      setEditorPreference: (key, value) => {
        set(state => ({
          editor: { ...state.editor, [key]: value },
        }))
        // Sync en arrière-plan (debounced)
        debouncedSync(get().syncToServer)
      },

      // Actions affichage
      setDisplayPreference: (key, value) => {
        set(state => ({
          display: { ...state.display, [key]: value },
        }))

        // Appliquer le thème immédiatement
        if (key === 'theme') {
          applyTheme(value as DisplayPreferences['theme'])
        }

        debouncedSync(get().syncToServer)
      },

      // Actions gamification
      setGamificationPreference: (key, value) => {
        set(state => ({
          gamification: { ...state.gamification, [key]: value },
        }))
        debouncedSync(get().syncToServer)
      },

      // Synchroniser vers le serveur
      syncToServer: async () => {
        const supabase = createClient()
        const { editor, display, gamification } = get()

        set({ isSyncing: true })

        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            set({ isSyncing: false })
            return
          }

          const preferences = { editor, display, gamification }

          const { error } = await supabase
            .from('profiles')
            .update({
              preferences,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          if (error) throw error

          set({
            isSyncing: false,
            lastSyncedAt: new Date(),
          })
        } catch (error) {
          console.error('Erreur sync préférences:', error)
          set({ isSyncing: false })
        }
      },

      // Charger depuis le serveur
      loadFromServer: async () => {
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
            .select('preferences')
            .eq('id', user.id)
            .single()

          if (error) throw error

          if (data?.preferences) {
            const prefs = data.preferences as {
              editor?: Partial<EditorPreferences>
              display?: Partial<DisplayPreferences>
              gamification?: Partial<GamificationPreferences>
            }

            set({
              editor: { ...DEFAULT_EDITOR, ...prefs.editor },
              display: { ...DEFAULT_DISPLAY, ...prefs.display },
              gamification: { ...DEFAULT_GAMIFICATION, ...prefs.gamification },
              isLoading: false,
              lastSyncedAt: new Date(),
            })

            // Appliquer le thème chargé
            if (prefs.display?.theme) {
              applyTheme(prefs.display.theme)
            }
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Erreur chargement préférences:', error)
          set({ isLoading: false })
        }
      },

      // Reset
      resetEditor: () => {
        set({ editor: DEFAULT_EDITOR })
        get().syncToServer()
      },

      resetDisplay: () => {
        set({ display: DEFAULT_DISPLAY })
        applyTheme(DEFAULT_DISPLAY.theme)
        get().syncToServer()
      },

      resetGamification: () => {
        set({ gamification: DEFAULT_GAMIFICATION })
        get().syncToServer()
      },

      resetAll: () => {
        set({
          editor: DEFAULT_EDITOR,
          display: DEFAULT_DISPLAY,
          gamification: DEFAULT_GAMIFICATION,
        })
        applyTheme(DEFAULT_DISPLAY.theme)
        get().syncToServer()
      },
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        editor: state.editor,
        display: state.display,
        gamification: state.gamification,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
)

// Fonction pour appliquer le thème
function applyTheme(theme: DisplayPreferences['theme']) {
  if (typeof window === 'undefined') return

  const root = document.documentElement
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (theme === 'dark' || (theme === 'system' && systemDark)) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Debounce pour la synchronisation
let syncTimeout: NodeJS.Timeout
function debouncedSync(syncFn: () => Promise<void>, delay = 2000) {
  clearTimeout(syncTimeout)
  syncTimeout = setTimeout(syncFn, delay)
}

// Hook pour écouter les changements de thème système
export function useSystemThemeListener() {
  const { display } = useUserPreferences()

  if (typeof window === 'undefined') return

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (e: MediaQueryListEvent) => {
    if (display.theme === 'system') {
      document.documentElement.classList.toggle('dark', e.matches)
    }
  }

  mediaQuery.addEventListener('change', handler)
  return () => mediaQuery.removeEventListener('change', handler)
}

// Sélecteurs pour les valeurs calculées
export const useThemeValue = () => {
  const { display } = useUserPreferences()

  if (typeof window === 'undefined') return 'light'

  if (display.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return display.theme
}

export default useUserPreferences
