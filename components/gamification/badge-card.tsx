'use client'

/**
 * Composant BadgeCard
 * Affiche un badge avec son état (débloqué ou verrouillé)
 */

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Badge, BadgeRarity } from '@/types/database.types'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BadgeCardProps {
  badge: Badge
  isUnlocked?: boolean
  unlockedAt?: string
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  className?: string
}

// Configuration des raretés
const rarityConfig: Record<BadgeRarity, {
  label: string
  bgClass: string
  borderClass: string
  glowClass: string
}> = {
  common: {
    label: 'Commun',
    bgClass: 'bg-gradient-to-br from-slate-100 to-slate-200',
    borderClass: 'border-slate-300',
    glowClass: '',
  },
  rare: {
    label: 'Rare',
    bgClass: 'bg-gradient-to-br from-blue-100 to-indigo-200',
    borderClass: 'border-blue-400',
    glowClass: 'shadow-blue-200',
  },
  epic: {
    label: 'Épique',
    bgClass: 'bg-gradient-to-br from-purple-100 to-pink-200',
    borderClass: 'border-purple-400',
    glowClass: 'shadow-purple-200',
  },
  legendary: {
    label: 'Légendaire',
    bgClass: 'bg-gradient-to-br from-amber-100 via-yellow-200 to-orange-200',
    borderClass: 'border-amber-400',
    glowClass: 'shadow-amber-200 animate-pulse-slow',
  },
}

const sizeConfig = {
  sm: { card: 'w-20', icon: 'text-2xl', iconSize: 'w-12 h-12' },
  md: { card: 'w-28', icon: 'text-3xl', iconSize: 'w-16 h-16' },
  lg: { card: 'w-36', icon: 'text-4xl', iconSize: 'w-20 h-20' },
}

export function BadgeCard({
  badge,
  isUnlocked = false,
  unlockedAt,
  size = 'md',
  showDetails = true,
  className,
}: BadgeCardProps) {
  const rarity = rarityConfig[badge.rarity]
  const sizeInfo = sizeConfig[size]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              'relative overflow-hidden transition-all cursor-pointer',
              sizeInfo.card,
              isUnlocked
                ? 'hover:scale-105'
                : 'opacity-50 grayscale hover:opacity-70',
              className
            )}
          >
            <CardContent className="p-3 flex flex-col items-center">
              {/* Icône du badge */}
              <div
                className={cn(
                  'rounded-full flex items-center justify-center border-2 shadow-lg transition-all',
                  sizeInfo.iconSize,
                  isUnlocked
                    ? cn(rarity.bgClass, rarity.borderClass, rarity.glowClass)
                    : 'bg-slate-200 border-slate-300'
                )}
              >
                {isUnlocked ? (
                  <span className={sizeInfo.icon}>{badge.icon}</span>
                ) : (
                  <Lock className="w-6 h-6 text-slate-400" />
                )}
              </div>

              {/* Nom du badge */}
              {showDetails && (
                <p className={cn(
                  'text-xs font-medium text-center mt-2 line-clamp-2',
                  isUnlocked ? 'text-slate-700' : 'text-slate-400'
                )}>
                  {badge.name}
                </p>
              )}

              {/* Indicateur de rareté */}
              {isUnlocked && badge.rarity !== 'common' && (
                <div className={cn(
                  'absolute top-1 right-1 w-2 h-2 rounded-full',
                  badge.rarity === 'rare' && 'bg-blue-500',
                  badge.rarity === 'epic' && 'bg-purple-500',
                  badge.rarity === 'legendary' && 'bg-amber-500 animate-pulse'
                )} />
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{badge.icon}</span>
              <div>
                <p className="font-semibold">{badge.name}</p>
                <p className={cn(
                  'text-xs',
                  badge.rarity === 'common' && 'text-slate-500',
                  badge.rarity === 'rare' && 'text-blue-500',
                  badge.rarity === 'epic' && 'text-purple-500',
                  badge.rarity === 'legendary' && 'text-amber-500'
                )}>
                  {rarity.label}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600">{badge.description}</p>
            {isUnlocked && unlockedAt && (
              <p className="text-xs text-slate-400">
                Débloqué {formatDistanceToNow(new Date(unlockedAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            )}
            {!isUnlocked && (
              <p className="text-xs text-slate-400 italic">
                Continuez pour débloquer ce badge !
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Composant pour afficher un badge nouvellement débloqué avec animation
interface BadgeUnlockAnimationProps {
  badge: Badge
  onComplete?: () => void
}

export function BadgeUnlockAnimation({ badge, onComplete }: BadgeUnlockAnimationProps) {
  const rarity = rarityConfig[badge.rarity]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative">
        {/* Cercles d'animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'w-40 h-40 rounded-full animate-ping opacity-30',
            rarity.bgClass
          )} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'w-32 h-32 rounded-full animate-ping opacity-40',
            rarity.bgClass
          )} style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Badge principal */}
        <div className="relative animate-bounce-in">
          <div
            className={cn(
              'w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-2xl',
              rarity.bgClass,
              rarity.borderClass
            )}
          >
            <span className="text-6xl">{badge.icon}</span>
          </div>
        </div>

        {/* Texte */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center text-white">
          <p className="text-sm text-white/70 mb-1">Nouveau badge débloqué !</p>
          <p className="text-xl font-bold">{badge.name}</p>
          <p className={cn(
            'text-sm',
            badge.rarity === 'common' && 'text-slate-300',
            badge.rarity === 'rare' && 'text-blue-300',
            badge.rarity === 'epic' && 'text-purple-300',
            badge.rarity === 'legendary' && 'text-amber-300'
          )}>
            {rarity.label}
          </p>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={onComplete}
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition-colors"
        >
          Cliquez pour continuer
        </button>
      </div>
    </div>
  )
}
