/**
 * Client Supabase pour le navigateur (Client Components)
 * Utilisé pour l'authentification et les requêtes côté client
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
