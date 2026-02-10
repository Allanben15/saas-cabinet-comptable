'use client'

/**
 * Composant UserAvatar2D
 * Avatar 2D interactif avec différents états
 */

import { cn } from '@/lib/utils'
import type { AvatarState } from '@/types/database.types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface UserAvatar2DProps {
  name?: string | null
  state?: AvatarState
  color?: string
  level?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLevel?: boolean
  showState?: boolean
  className?: string
}

// Configuration des états
const stateConfig: Record<AvatarState, {
  emoji: string
  label: string
  bgClass: string
  animation: string
}> = {
  neutral: {
    emoji: '😊',
    label: 'Prêt à travailler',
    bgClass: 'bg-gradient-to-br from-slate-100 to-slate-200',
    animation: '',
  },
  productive: {
    emoji: '💪',
    label: 'En forme !',
    bgClass: 'bg-gradient-to-br from-green-100 to-emerald-200',
    animation: 'animate-pulse-slow',
  },
  tired: {
    emoji: '😴',
    label: 'Plafond XP atteint',
    bgClass: 'bg-gradient-to-br from-amber-100 to-orange-200',
    animation: '',
  },
}

// Configuration des tailles
const sizeConfig = {
  sm: { container: 'w-10 h-10', emoji: 'text-lg', level: 'w-4 h-4 text-[10px]' },
  md: { container: 'w-14 h-14', emoji: 'text-2xl', level: 'w-5 h-5 text-xs' },
  lg: { container: 'w-20 h-20', emoji: 'text-4xl', level: 'w-6 h-6 text-xs' },
  xl: { container: 'w-28 h-28', emoji: 'text-5xl', level: 'w-8 h-8 text-sm' },
}

export function UserAvatar2D({
  name,
  state = 'neutral',
  color = '#6366f1',
  level,
  size = 'md',
  showLevel = true,
  showState = true,
  className,
}: UserAvatar2DProps) {
  const stateInfo = stateConfig[state]
  const sizeInfo = sizeConfig[size]

  // Générer les initiales à partir du nom
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('relative inline-block', className)}>
            {/* Avatar principal */}
            <div
              className={cn(
                'rounded-full flex items-center justify-center shadow-lg transition-all',
                sizeInfo.container,
                stateInfo.bgClass,
                stateInfo.animation
              )}
              style={{
                borderWidth: '3px',
                borderColor: color,
              }}
            >
              {/* Emoji d'état ou initiales */}
              {showState ? (
                <span className={sizeInfo.emoji}>{stateInfo.emoji}</span>
              ) : (
                <span
                  className={cn('font-bold', sizeInfo.emoji)}
                  style={{ color }}
                >
                  {initials}
                </span>
              )}
            </div>

            {/* Badge de niveau */}
            {showLevel && level && (
              <div
                className={cn(
                  'absolute -bottom-1 -right-1 rounded-full flex items-center justify-center font-bold text-white shadow-md',
                  sizeInfo.level
                )}
                style={{ backgroundColor: color }}
              >
                {level}
              </div>
            )}

            {/* Indicateur d'état (petit point) */}
            {showState && state === 'productive' && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-center">
            {name && <p className="font-medium">{name}</p>}
            {level && <p className="text-xs text-slate-500">Niveau {level}</p>}
            <p className="text-xs text-slate-400 mt-1">{stateInfo.label}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Composant pour la personnalisation de l'avatar
interface AvatarCustomizerProps {
  currentColor: string
  onColorChange: (color: string) => void
}

const avatarColors = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#0ea5e9', // Sky
  '#6b7280', // Gray
]

export function AvatarCustomizer({ currentColor, onColorChange }: AvatarCustomizerProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Couleur de l&apos;avatar</p>
      <div className="flex flex-wrap gap-2">
        {avatarColors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={cn(
              'w-8 h-8 rounded-full transition-all hover:scale-110',
              currentColor === color && 'ring-2 ring-offset-2 ring-slate-400'
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}
