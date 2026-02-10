'use client'

/**
 * Provider d'authentification
 * Initialise l'état d'auth au chargement de l'application
 * et écoute les changements de session
 */

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, setUser, setProfile, setStatus } = useAuthStore()

  useEffect(() => {
    // Initialiser l'état d'auth
    initialize()

    // Écouter les changements de session
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        setStatus('authenticated')

        // Charger le profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setProfile(profile)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setStatus('unauthenticated')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialize, setUser, setProfile, setStatus])

  return <>{children}</>
}
