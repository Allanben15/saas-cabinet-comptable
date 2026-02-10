'use client'

/**
 * Layout du dashboard - Design moderne avec glassmorphism
 * Sidebar avec navigation animée et effets visuels premium
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  BookOpen,
  Trophy,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/stores/auth-store'
import { UserAvatar } from '@/components/avatar'
import { Progress } from '@/components/ui/progress'
import { XP_CONFIG } from '@/lib/stores/gamification-store'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ClientSwitcher } from '@/components/clients/ClientSwitcher'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'from-emerald-600 to-emerald-400' },
  { name: 'Tâches', href: '/tasks', icon: CheckSquare, color: 'from-emerald-600 to-emerald-400' },
  { name: 'Notes', href: '/notes', icon: FileText, color: 'from-emerald-600 to-emerald-400' },
  { name: 'Wiki', href: '/wiki', icon: BookOpen, color: 'from-emerald-600 to-emerald-400' },
  { name: 'Badges', href: '/badges', icon: Trophy, color: 'from-emerald-600 to-emerald-400' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { profile, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  // Calcul de la progression XP
  const currentXP = profile?.total_xp || 0
  const currentLevel = profile?.current_level || 1
  const xpForCurrentLevel = XP_CONFIG.calculateXPForLevel(currentLevel)
  const xpForNextLevel = XP_CONFIG.calculateXPForLevel(currentLevel + 1)
  const progressPercent = xpForNextLevel > xpForCurrentLevel
    ? ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
    : 100

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient mesh */}
      <div className="fixed inset-0 gradient-mesh opacity-50 pointer-events-none" />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 glass-card border-r border-border/30">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border/30">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl blur opacity-30 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text-primary">Cabinet SaaS</h1>
              <p className="text-xs text-muted-foreground">Gamified Workspace</p>
            </div>
          </div>

          {/* Client Switcher */}
          <div className="px-4 py-3 border-b border-border/30">
            <ClientSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <p className="px-3 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Menu principal
            </p>
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                    'animate-fade-in-up opacity-0',
                    isActive
                      ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  {/* Glow effect on hover */}
                  {!isActive && (
                    <div className={cn(
                      'absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20',
                      item.color
                    )} />
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-white/10" />
                  )}

                  <div className={cn(
                    'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300',
                    isActive
                      ? 'bg-white/20'
                      : 'bg-secondary/50 group-hover:bg-secondary'
                  )}>
                    <item.icon className={cn(
                      'w-5 h-5 transition-transform duration-300 group-hover:scale-110',
                      isActive && 'text-white'
                    )} />
                  </div>

                  <span className="relative flex-1">{item.name}</span>

                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border/30">
            {/* Profil utilisateur avec XP */}
            <div className="glass-card rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <UserAvatar
                    avatarUrl={profile?.avatar_url}
                    name={profile?.full_name}
                    state={profile?.avatar_state || 'neutral'}
                    color={profile?.avatar_color || '#10b981'}
                    level={profile?.current_level}
                    size="md"
                    showState={true}
                  />
                  {/* Level badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg ring-2 ring-background">
                    {currentLevel}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {profile?.full_name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentXP.toLocaleString()} XP total
                  </p>
                </div>
              </div>

              {/* XP Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Niveau {currentLevel}</span>
                  <span className="text-primary font-medium">{Math.round(progressPercent)}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-white/30 animate-shimmer"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  {(xpForNextLevel - currentXP).toLocaleString()} XP pour niveau {currentLevel + 1}
                </p>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-2 mb-4">
              <span className="text-xs text-muted-foreground">Thème</span>
              <ThemeToggle variant="default" />
            </div>

            {/* Actions */}
            <div className="space-y-1">
              <Link
                href="/settings"
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300',
                  'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                  pathname === '/settings' && 'bg-secondary text-foreground'
                )}
              >
                <Settings className="w-5 h-5" />
                Paramètres
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-72">
        <div className="min-h-screen p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
