'use client'

/**
 * Page Dashboard principale - Design moderne premium
 * Affiche les statistiques, XP, tâches du jour, notes épinglées et badges récents
 */

import { useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  FileText,
  Users,
  Trophy,
  Zap,
  ArrowRight,
  Flame,
  Target,
  TrendingUp,
  Sparkles,
  Clock,
  Star,
  Award,
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useTasksStore, useTasksByStatus } from '@/lib/stores/tasks-store'
import { useNotesStore, usePinnedNotes } from '@/lib/stores/notes-store'
import {
  useGamificationStore,
  useUnlockedBadgesWithDetails,
} from '@/lib/stores/gamification-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { XPBar } from '@/components/gamification/xp-bar'
import { Avatar3D } from '@/components/avatar'
import { BadgeCard } from '@/components/gamification/badge-card'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { profile, status } = useAuthStore()
  const { fetchTasks } = useTasksStore()
  const { fetchNotes } = useNotesStore()
  const { fetchBadges, fetchUserBadges } = useGamificationStore()

  const tasksByStatus = useTasksByStatus()
  const pinnedNotes = usePinnedNotes()
  const recentBadges = useUnlockedBadgesWithDetails().slice(0, 4)

  // Charger les données au montage
  useEffect(() => {
    fetchTasks()
    fetchNotes()
    fetchBadges()
    fetchUserBadges()
  }, [fetchTasks, fetchNotes, fetchBadges, fetchUserBadges])

  // Stats des tâches
  const todayTasks = tasksByStatus.todo.length + tasksByStatus.in_progress.length
  const completedToday = tasksByStatus.completed.filter(
    (t) => t.completed_at && new Date(t.completed_at).toDateString() === new Date().toDateString()
  ).length

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-6 h-6 text-primary animate-bounce-slow" />
          </div>
          <p className="text-muted-foreground animate-pulse">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header avec salutation */}
      <div className="animate-fade-in-down">
        <h1 className="text-3xl font-bold">
          Bonjour, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'Utilisateur'}</span> !
        </h1>
        <p className="text-muted-foreground mt-1">
          Voici un aperçu de votre progression aujourd'hui
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'XP Aujourd\'hui',
            value: `+${profile?.xp_today || 0}`,
            icon: Zap,
            color: 'from-emerald-500 to-green-500',
            glowColor: 'emerald' as const,
          },
          {
            label: 'Tâches terminées',
            value: completedToday.toString(),
            icon: CheckCircle2,
            color: 'from-cyan-500 to-blue-500',
            glowColor: 'cyan' as const,
          },
          {
            label: 'Niveau actuel',
            value: (profile?.current_level || 1).toString(),
            icon: Award,
            color: 'from-violet-500 to-purple-500',
            glowColor: 'primary' as const,
          },
          {
            label: 'Streak',
            value: `${profile?.login_streak || 0} jours`,
            icon: Flame,
            color: 'from-amber-500 to-orange-500',
            glowColor: 'amber' as const,
          },
        ].map((stat, index) => (
          <Card
            key={stat.label}
            variant="glow"
            glowColor={stat.glowColor}
            className={cn(
              'animate-fade-in-up opacity-0',
              'hover:scale-[1.02] cursor-default'
            )}
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center',
                  'bg-gradient-to-br', stat.color,
                  'shadow-lg'
                )}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte profil avec avatar et progression */}
        <Card
          variant="gradient"
          className="lg:col-span-1 overflow-hidden animate-fade-in-up opacity-0 stagger-1"
          style={{ animationFillMode: 'forwards' }}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar 3D */}
              <div className="relative mb-4">
                <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-full blur-xl" />
                <Avatar3D
                  avatarUrl={profile?.avatar_url || undefined}
                  size="xl"
                  autoRotate={true}
                  showEnvironment={false}
                />
              </div>

              <h2 className="text-xl font-bold">
                {profile?.full_name || 'Utilisateur'}
              </h2>

              {/* Rank badge */}
              <div className="flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                <Star className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-300">
                  Niveau {profile?.current_level || 1}
                </span>
              </div>

              {/* XP Progress */}
              <div className="w-full mt-6">
                <XPBar
                  currentXP={profile?.total_xp || 0}
                  currentLevel={profile?.current_level || 1}
                  xpToday={profile?.xp_today || 0}
                  size="md"
                  showDetails={true}
                />
              </div>

              {/* Streak */}
              {(profile?.login_streak || 0) > 0 && (
                <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <Flame className="w-5 h-5 text-amber-400 animate-bounce-slow" />
                  <span className="font-medium text-amber-300">
                    {profile?.login_streak} jours consécutifs
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tâches du jour */}
        <Card
          className="lg:col-span-2 animate-fade-in-up opacity-0 stagger-2"
          style={{ animationFillMode: 'forwards' }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                Tâches du jour
              </CardTitle>
              <CardDescription className="mt-1">
                {todayTasks} tâche{todayTasks > 1 ? 's' : ''} en attente
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="group">
              <Link href="/tasks">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {tasksByStatus.todo.length + tasksByStatus.in_progress.length > 0 ? (
              <div className="space-y-3">
                {[...tasksByStatus.in_progress, ...tasksByStatus.todo]
                  .slice(0, 5)
                  .map((task, index) => (
                    <div
                      key={task.id}
                      className={cn(
                        'group flex items-center justify-between p-4 rounded-xl',
                        'bg-secondary/30 hover:bg-secondary/50',
                        'border border-transparent hover:border-primary/20',
                        'transition-all duration-300 cursor-pointer',
                        'animate-fade-in-up opacity-0'
                      )}
                      style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: 'forwards' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-3 h-3 rounded-full transition-all duration-300',
                          task.status === 'in_progress'
                            ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50 animate-pulse'
                            : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50'
                        )} />
                        <div>
                          <p className="font-medium text-sm group-hover:text-foreground transition-colors">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                task.task_type === 'personal'
                                  ? 'border-amber-500/30 text-amber-400'
                                  : 'border-cyan-500/30 text-cyan-400'
                              )}
                            >
                              {task.task_type === 'personal' ? 'Perso' : 'Pro'}
                            </Badge>
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                              <Zap className="w-3 h-3" />
                              +{task.task_type === 'personal' ? 5 : 30} XP
                            </span>
                          </div>
                        </div>
                      </div>
                      {task.status === 'in_progress' && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          <Clock className="w-3 h-3 mr-1" />
                          En cours
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-muted-foreground mb-2">Aucune tâche en attente</p>
                <p className="text-sm text-muted-foreground/70">
                  Vous avez terminé toutes vos tâches !
                </p>
                <Button variant="outline" asChild className="mt-4">
                  <Link href="/tasks">Créer une tâche</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section secondaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes épinglées */}
        <Card
          className="animate-fade-in-up opacity-0 stagger-3"
          style={{ animationFillMode: 'forwards' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Notes épinglées
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/notes">Voir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pinnedNotes.length > 0 ? (
              <div className="space-y-2">
                {pinnedNotes.slice(0, 3).map((note, index) => (
                  <div
                    key={note.id}
                    className={cn(
                      'p-3 rounded-xl transition-all duration-300',
                      'bg-amber-500/5 hover:bg-amber-500/10',
                      'border border-amber-500/10 hover:border-amber-500/20',
                      'cursor-pointer animate-fade-in-up opacity-0'
                    )}
                    style={{ animationDelay: `${0.4 + index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <p className="font-medium text-sm truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {note.content?.substring(0, 100) || 'Aucun contenu'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Aucune note épinglée
                </p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link href="/notes">Créer une note</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges récents */}
        <Card
          className="animate-fade-in-up opacity-0 stagger-4"
          style={{ animationFillMode: 'forwards' }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              Derniers badges
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/badges">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBadges.length > 0 ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {recentBadges.map((ub, index) => (
                  ub.badge && (
                    <div
                      key={ub.id}
                      className="animate-bounce-in opacity-0"
                      style={{ animationDelay: `${0.5 + index * 0.15}s`, animationFillMode: 'forwards' }}
                    >
                      <BadgeCard
                        badge={ub.badge}
                        isUnlocked={true}
                        unlockedAt={ub.unlocked_at}
                        size="sm"
                        showDetails={false}
                      />
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Continuez pour débloquer des badges !
                </p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link href="/badges">Voir les badges</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats équipe */}
      <Card
        className="animate-fade-in-up opacity-0 stagger-5"
        style={{ animationFillMode: 'forwards' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            Statistiques d'équipe
          </CardTitle>
          <CardDescription>
            Vue anonymisée de l'activité collective
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'XP collectif cette semaine', value: '0', color: 'from-emerald-500/10 to-green-500/10', borderColor: 'border-emerald-500/20', textColor: 'text-emerald-400' },
              { label: 'Notes Wiki ce mois', value: '0', color: 'from-cyan-500/10 to-blue-500/10', borderColor: 'border-cyan-500/20', textColor: 'text-cyan-400' },
              { label: 'Tâches validées', value: '0', color: 'from-violet-500/10 to-purple-500/10', borderColor: 'border-violet-500/20', textColor: 'text-violet-400' },
              { label: 'Membres actifs aujourd\'hui', value: '0', color: 'from-amber-500/10 to-orange-500/10', borderColor: 'border-amber-500/20', textColor: 'text-amber-400' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  'text-center p-4 rounded-xl transition-all duration-300',
                  'bg-gradient-to-br', stat.color,
                  'border', stat.borderColor,
                  'hover:scale-105 cursor-default',
                  'animate-fade-in-up opacity-0'
                )}
                style={{ animationDelay: `${0.6 + index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <p className={cn('text-3xl font-bold', stat.textColor)}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
