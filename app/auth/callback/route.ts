/**
 * Route callback pour l'authentification OAuth et confirmation email
 * Gère le retour après connexion Google/Microsoft ou clic sur lien de confirmation
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirection vers la page demandée ou dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // En cas d'erreur, rediriger vers login avec message
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
