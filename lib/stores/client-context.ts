/**
 * Store Zustand pour le contexte client
 * Gère le client actif, favoris et récents pour le multi-tenant
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

// Types
export type ClientType = 'TPE' | 'PME' | 'ETI' | 'GE'
export type ClientStatus = 'PROSPECT' | 'ACTIVE' | 'DORMANT' | 'ARCHIVED'

export interface Client {
  id: string
  name: string
  siren?: string
  type: ClientType
  status: ClientStatus
  color?: string
}

export interface ClientWithRole extends Client {
  role: 'MANAGER' | 'COLLABORATOR' | 'VIEWER'
  isFavorite: boolean
  lastAccess?: string
}

interface ClientContextState {
  // État
  activeClient: Client | null
  recentClients: Client[]
  favoriteClients: Client[]
  allClients: ClientWithRole[]
  isLoading: boolean
  isSwitcherOpen: boolean

  // Actions
  setActiveClient: (client: Client | null) => Promise<void>
  toggleFavorite: (clientId: string) => Promise<void>
  openSwitcher: () => void
  closeSwitcher: () => void
  toggleSwitcher: () => void

  // Chargement
  loadContext: () => Promise<void>
  loadAllClients: () => Promise<void>

  // CRUD Clients
  createClient: (data: CreateClientData) => Promise<{ error: string | null; client: Client | null }>
  updateClient: (id: string, data: Partial<CreateClientData>) => Promise<{ error: string | null }>
  archiveClient: (id: string) => Promise<{ error: string | null }>
}

interface CreateClientData {
  name: string
  siren?: string
  siret?: string
  legalForm?: string
  type?: ClientType
  sector?: string
  color?: string
  fiscalYearEnd?: number
  vatRegime?: string
}

export const useClientContext = create<ClientContextState>()(
  persist(
    (set, get) => ({
      // État initial
      activeClient: null,
      recentClients: [],
      favoriteClients: [],
      allClients: [],
      isLoading: false,
      isSwitcherOpen: false,

      // Définir le client actif
      setActiveClient: async (client) => {
        const supabase = createClient()

        set({ isLoading: true, isSwitcherOpen: false })

        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            set({ isLoading: false })
            return
          }

          // Mettre à jour le profil avec le client actif
          const { error } = await supabase
            .from('profiles')
            .update({
              active_client_id: client?.id || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          if (error) throw error

          // Mettre à jour last_access si client défini
          if (client) {
            await supabase
              .from('user_clients')
              .update({ last_access: new Date().toISOString() })
              .eq('user_id', user.id)
              .eq('client_id', client.id)
          }

          // Mettre à jour l'état local
          set(state => ({
            activeClient: client,
            recentClients: client
              ? [client, ...state.recentClients.filter(c => c.id !== client.id)].slice(0, 5)
              : state.recentClients,
            isLoading: false,
          }))
        } catch (error) {
          console.error('Erreur setActiveClient:', error)
          set({ isLoading: false })
        }
      },

      // Basculer le favori
      toggleFavorite: async (clientId) => {
        const supabase = createClient()
        const { favoriteClients, allClients } = get()

        const isFavorite = favoriteClients.some(c => c.id === clientId)
        const client = allClients.find(c => c.id === clientId) ||
                       favoriteClients.find(c => c.id === clientId)

        if (!client) return

        // Optimistic update
        set({
          favoriteClients: isFavorite
            ? favoriteClients.filter(c => c.id !== clientId)
            : [client, ...favoriteClients].slice(0, 5),
        })

        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          const { error } = await supabase
            .from('user_clients')
            .update({ is_favorite: !isFavorite })
            .eq('user_id', user.id)
            .eq('client_id', clientId)

          if (error) throw error
        } catch (error) {
          console.error('Erreur toggleFavorite:', error)
          // Rollback
          set({ favoriteClients })
        }
      },

      // UI Switcher
      openSwitcher: () => set({ isSwitcherOpen: true }),
      closeSwitcher: () => set({ isSwitcherOpen: false }),
      toggleSwitcher: () => set(state => ({ isSwitcherOpen: !state.isSwitcherOpen })),

      // Charger le contexte
      loadContext: async () => {
        const supabase = createClient()
        set({ isLoading: true })

        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            set({ isLoading: false })
            return
          }

          // Utiliser la fonction RPC si disponible
          const { data, error } = await supabase
            .rpc('get_client_context', { p_user_id: user.id })

          if (error) {
            // Fallback si la fonction n'existe pas
            console.warn('RPC get_client_context non disponible, utilisation du fallback')
            await get().loadAllClients()
            return
          }

          if (data && data[0]) {
            set({
              activeClient: data[0].active_client || null,
              recentClients: data[0].recent_clients || [],
              favoriteClients: data[0].favorite_clients || [],
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Erreur loadContext:', error)
          set({ isLoading: false })
        }
      },

      // Charger tous les clients accessibles
      loadAllClients: async () => {
        const supabase = createClient()
        set({ isLoading: true })

        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            set({ isLoading: false })
            return
          }

          // Clients créés par l'utilisateur
          const { data: createdClients } = await supabase
            .from('clients')
            .select('*')
            .eq('created_by_id', user.id)
            .eq('status', 'ACTIVE')

          // Clients assignés à l'utilisateur
          const { data: assignedData } = await supabase
            .from('user_clients')
            .select(`
              role,
              is_favorite,
              last_access,
              client:clients(*)
            `)
            .eq('user_id', user.id)

          // Combiner et dédupliquer
          const clientsMap = new Map<string, ClientWithRole>()

          // Ajouter les clients créés (role = MANAGER)
          createdClients?.forEach(client => {
            if (client.status === 'ACTIVE') {
              clientsMap.set(client.id, {
                ...client,
                role: 'MANAGER',
                isFavorite: false,
              })
            }
          })

          // Ajouter/mettre à jour avec les assignations
          assignedData?.forEach(assignment => {
            const client = assignment.client as unknown as Client
            if (client && client.status === 'ACTIVE') {
              const existing = clientsMap.get(client.id)
              clientsMap.set(client.id, {
                ...client,
                role: assignment.role || existing?.role || 'COLLABORATOR',
                isFavorite: assignment.is_favorite || existing?.isFavorite || false,
                lastAccess: assignment.last_access || existing?.lastAccess,
              })
            }
          })

          const allClients = Array.from(clientsMap.values())

          // Récupérer le client actif
          const { data: profile } = await supabase
            .from('profiles')
            .select('active_client_id')
            .eq('id', user.id)
            .single()

          const activeClient = profile?.active_client_id
            ? allClients.find(c => c.id === profile.active_client_id) || null
            : null

          set({
            allClients,
            favoriteClients: allClients.filter(c => c.isFavorite),
            recentClients: allClients
              .filter(c => c.lastAccess)
              .sort((a, b) => (b.lastAccess || '').localeCompare(a.lastAccess || ''))
              .slice(0, 5),
            activeClient,
            isLoading: false,
          })
        } catch (error) {
          console.error('Erreur loadAllClients:', error)
          set({ isLoading: false })
        }
      },

      // Créer un client
      createClient: async (data) => {
        const supabase = createClient()

        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            return { error: 'Non authentifié', client: null }
          }

          const { data: client, error } = await supabase
            .from('clients')
            .insert({
              ...data,
              created_by_id: user.id,
            })
            .select()
            .single()

          if (error) throw error

          // Recharger la liste
          await get().loadAllClients()

          return { error: null, client }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur création client'
          console.error('Erreur createClient:', error)
          return { error: message, client: null }
        }
      },

      // Mettre à jour un client
      updateClient: async (id, data) => {
        const supabase = createClient()

        try {
          const { error } = await supabase
            .from('clients')
            .update({
              ...data,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)

          if (error) throw error

          // Recharger
          await get().loadAllClients()

          return { error: null }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur mise à jour'
          return { error: message }
        }
      },

      // Archiver un client
      archiveClient: async (id) => {
        const supabase = createClient()

        try {
          const { error } = await supabase
            .from('clients')
            .update({
              status: 'ARCHIVED',
              archived_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)

          if (error) throw error

          // Si c'était le client actif, le désactiver
          if (get().activeClient?.id === id) {
            await get().setActiveClient(null)
          }

          // Recharger
          await get().loadAllClients()

          return { error: null }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur archivage'
          return { error: message }
        }
      },
    }),
    {
      name: 'client-context',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeClient: state.activeClient,
        recentClients: state.recentClients,
      }),
    }
  )
)

// Sélecteurs utilitaires
export const useActiveClientId = () => useClientContext(s => s.activeClient?.id ?? null)
export const useActiveClientName = () => useClientContext(s => s.activeClient?.name ?? 'Général')
export const useHasActiveClient = () => useClientContext(s => s.activeClient !== null)

export default useClientContext
