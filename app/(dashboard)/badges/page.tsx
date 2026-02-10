'use client'

/**
 * Page des badges
 * Affiche tous les badges disponibles et leur statut
 */

import { useEffect, useState } from 'react'
import { Trophy, Star, Lock, Sparkles, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useGamificationStore,
  useLockedBadges,
  useUnlockedBadgesWithDetails,
} from '@/lib/stores/gamification-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { BadgeRarity } from '@/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BadgeCard } from '@/components/gamification/badge-card'
import { XPBar } from '@/components/gamification/xp-bar'
import { UserAvatar2D } from '@/components/gamification/user-avatar-2d'

type RarityFilter = 'all' | BadgeRarity

export default function BadgesPage() {
  const { fetchBadges, fetchUserBadges, badges, isLoading } = useGamificationStore()
  const { profile } = useAuthStore()

  const unlockedBadges = useUnlockedBadgesWithDetails()
  const lockedBadges = useLockedBadges()

  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')

  // Charger les données
  useEffect(() => {
    fetchBadges()
    fetchUserBadges()
  }, [fetchBadges, fetchUserBadges])

  // Filtrer par rareté
  const filteredUnlocked = rarityFilter === 'all'
    ? unlockedBadges
    : unlockedBadges.filter((ub) => ub.badge?.rarity === rarityFilter)

  const filteredLocked = rarityFilter === 'all'
    ? lockedBadges
    : lockedBadges.filter((b) => b.rarity === rarityFilter)

  // Statistiques
  const totalBadges = badges.length
  const unlockedCount = unlockedBadges.length
  const progressPercent = totalBadges > 0 ? (unlockedCount / totalBadges) * 100 : 0

  // Compter par rareté
  const countByRarity = (rarity: BadgeRarity) => ({
    total: badges.filter((b) => b.rarity === rarity).length,
    unlocked: unlockedBadges.filter((ub) => ub.badge?.rarity === rarity).length,
  })

  const rarityStats = {
    common: countByRarity('common'),
    rare: countByRarity('rare'),
    epic: countByRarity('epic'),
    legendary: countByRarity('legendary'),
  }

  return (
    <div className="space-y-8">
      {/* Header avec stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte profil */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <UserAvatar2D
                name={profile?.full_name}
                state={profile?.avatar_state || 'neutral'}
                color={profile?.avatar_color}
                level={profile?.current_level}
                size="xl"
                showState={true}
              />
              <h2 className="mt-4 text-xl font-bold">
                {profile?.full_name || 'Utilisateur'}
              </h2>
              <p className="text-slate-500 text-sm">
                Niveau {profile?.current_level || 1}
              </p>

              <div className="w-full mt-6">
                <XPBar
                  currentXP={profile?.total_xp || 0}
                  currentLevel={profile?.current_level || 1}
                  xpToday={profile?.xp_today || 0}
                  size="md"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progression badges */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Collection de badges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progression globale */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Progression totale</span>
                <span className="text-sm font-medium">
                  {unlockedCount} / {totalBadges} badges
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            {/* Stats par rareté */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'common', label: 'Commun', color: 'text-slate-600', bg: 'bg-slate-100' },
                { key: 'rare', label: 'Rare', color: 'text-blue-600', bg: 'bg-blue-100' },
                { key: 'epic', label: 'Épique', color: 'text-purple-600', bg: 'bg-purple-100' },
                { key: 'legendary', label: 'Légendaire', color: 'text-amber-600', bg: 'bg-amber-100' },
              ].map(({ key, label, color, bg }) => {
                const stats = rarityStats[key as BadgeRarity]
                return (
                  <div
                    key={key}
                    className={cn('rounded-lg p-3 text-center', bg)}
                  >
                    <p className={cn('text-2xl font-bold', color)}>
                      {stats.unlocked}/{stats.total}
                    </p>
                    <p className="text-xs text-slate-600">{label}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-600 mr-2">Filtrer :</span>
        {[
          { value: 'all', label: 'Tous' },
          { value: 'common', label: 'Commun' },
          { value: 'rare', label: 'Rare' },
          { value: 'epic', label: 'Épique' },
          { value: 'legendary', label: 'Légendaire' },
        ].map(({ value, label }) => (
          <Button
            key={value}
            variant={rarityFilter === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRarityFilter(value as RarityFilter)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Badges débloqués */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Badges débloqués ({filteredUnlocked.length})
        </h2>
        {filteredUnlocked.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {filteredUnlocked.map((userBadge) => (
              userBadge.badge && (
                <BadgeCard
                  key={userBadge.id}
                  badge={userBadge.badge}
                  isUnlocked={true}
                  unlockedAt={userBadge.unlocked_at}
                  size="md"
                />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucun badge débloqué dans cette catégorie</p>
          </div>
        )}
      </div>

      {/* Badges verrouillés */}
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
          <Lock className="w-5 h-5 text-slate-400" />
          Badges à débloquer ({filteredLocked.length})
        </h2>
        {filteredLocked.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {filteredLocked.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isUnlocked={false}
                size="md"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-green-500">
            <Trophy className="w-12 h-12 mx-auto mb-2" />
            <p className="font-medium">
              Félicitations ! Vous avez débloqué tous les badges de cette catégorie !
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
