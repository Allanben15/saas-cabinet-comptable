'use client'

/**
 * Composant XPBar
 * Barre de progression XP animée avec niveau
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { XP_CONFIG } from '@/lib/stores/gamification-store'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface XPBarProps {
  currentXP: number
  currentLevel: number
  xpToday?: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function XPBar({
  currentXP,
  currentLevel,
  xpToday = 0,
  showDetails = true,
  size = 'md',
  className,
}: XPBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Calculs XP
  const xpForCurrentLevel = XP_CONFIG.calculateXPForLevel(currentLevel)
  const xpForNextLevel = XP_CONFIG.calculateXPForLevel(currentLevel + 1)
  const xpInCurrentLevel = currentXP - xpForCurrentLevel
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel
  const progressPercent = xpNeededForLevel > 0
    ? (xpInCurrentLevel / xpNeededForLevel) * 100
    : 100

  // Animation de la barre
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent)
    }, 100)
    return () => clearTimeout(timer)
  }, [progressPercent])

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  const isMaxLevel = currentLevel >= XP_CONFIG.MAX_LEVEL
  const dailyCapReached = xpToday >= XP_CONFIG.DAILY_CAP

  return (
    <TooltipProvider>
      <div className={cn('space-y-2', className)}>
        {/* Niveau et XP */}
        {showDetails && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span className="text-lg">⭐</span>
                    <span>Niveau {currentLevel}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Niveau actuel : {currentLevel}/{XP_CONFIG.MAX_LEVEL}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-slate-500">
                  {currentXP.toLocaleString()} XP
                  {!isMaxLevel && (
                    <span className="text-slate-400">
                      {' '}/ {xpForNextLevel.toLocaleString()}
                    </span>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isMaxLevel
                    ? 'Niveau maximum atteint !'
                    : `${xpNeededForLevel - xpInCurrentLevel} XP restants pour le niveau ${currentLevel + 1}`}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Barre de progression */}
        <div className={cn(
          'relative w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          {/* Barre de fond avec gradient */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out',
              isMaxLevel
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600'
            )}
            style={{ width: `${animatedProgress}%` }}
          />

          {/* Effet de brillance */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>

        {/* XP du jour */}
        {showDetails && (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  'flex items-center gap-1',
                  dailyCapReached && 'text-amber-600'
                )}>
                  {dailyCapReached ? '🔥' : '📈'} +{xpToday} XP aujourd&apos;hui
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {dailyCapReached ? (
                  <p>Plafond quotidien atteint ! Revenez demain.</p>
                ) : (
                  <p>
                    Encore {XP_CONFIG.DAILY_CAP - xpToday} XP disponibles aujourd&apos;hui
                  </p>
                )}
              </TooltipContent>
            </Tooltip>

            <span className="text-slate-400">
              Plafond : {XP_CONFIG.DAILY_CAP} XP/jour
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
