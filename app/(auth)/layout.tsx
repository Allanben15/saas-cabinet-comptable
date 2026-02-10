'use client'

/**
 * Layout pour les pages d'authentification (login, register)
 * Design moderne premium avec glassmorphism et animations
 */

import { Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background mesh gradient */}
      <div className="fixed inset-0 gradient-mesh opacity-60" />

      {/* Animated particles */}
      <div className="fixed inset-0 particles-bg opacity-50" />

      {/* Floating orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/2 right-1/3 w-64 h-64 bg-fuchsia-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Theme toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle variant="minimal" />
      </div>

      {/* Main content */}
      <div className="w-full max-w-md px-4 relative z-10">
        {/* Logo et titre */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-3xl blur-xl opacity-40 animate-pulse-slow" />

            {/* Logo */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Cabinet SaaS</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            Plateforme collaborative et gamifiée pour cabinets comptables
          </p>
        </div>

        {/* Contenu de la page (formulaire) */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60 mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          &copy; 2026 Cabinet SaaS. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
