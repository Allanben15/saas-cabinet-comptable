'use client'

/**
 * SpaceSwitcher
 * Composant de basculement entre espace partagé et personnel
 * Avec indicateur visuel clair de la zone de confidentialité
 */

import { Users, Lock, Globe, Shield, Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SpaceType = 'shared' | 'personal'

interface SpaceSwitcherProps {
  value: SpaceType
  onChange: (space: SpaceType) => void
  sharedCount?: number
  personalCount?: number
  className?: string
}

export function SpaceSwitcher({
  value,
  onChange,
  sharedCount = 0,
  personalCount = 0,
  className,
}: SpaceSwitcherProps) {
  return (
    <div className={cn('flex items-center bg-muted/50 rounded-xl p-1', className)}>
      <SpaceButton
        active={value === 'shared'}
        onClick={() => onChange('shared')}
        icon={Globe}
        label="Espace Partagé"
        count={sharedCount}
        activeColor="bg-blue-500 text-white"
        description="Visible par l'équipe"
      />

      <SpaceButton
        active={value === 'personal'}
        onClick={() => onChange('personal')}
        icon={Lock}
        label="Espace Personnel"
        count={personalCount}
        activeColor="bg-purple-500 text-white"
        description="Privé et chiffré"
      />
    </div>
  )
}

interface SpaceButtonProps {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
  count?: number
  activeColor: string
  description: string
}

function SpaceButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  activeColor,
}: SpaceButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200',
        'text-sm font-medium',
        active
          ? activeColor
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-full text-xs',
            active ? 'bg-white/20' : 'bg-muted'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// Bannière d'avertissement espace
interface SpaceBannerProps {
  space: SpaceType
  className?: string
}

export function SpaceBanner({ space, className }: SpaceBannerProps) {
  const isShared = space === 'shared'

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border-l-4',
        isShared
          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-700 dark:text-blue-300'
          : 'bg-purple-50 dark:bg-purple-950/30 border-purple-500 text-purple-700 dark:text-purple-300',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isShared ? (
          <>
            <Eye className="h-4 w-4" />
            <span className="font-medium">Espace Collaboratif</span>
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            <span className="font-medium">Espace Personnel</span>
          </>
        )}
      </div>

      <span className="text-sm opacity-80">
        {isShared
          ? 'Ce contenu est visible par votre équipe'
          : 'Ce contenu est chiffré et privé'}
      </span>
    </div>
  )
}

// Badge indicateur inline
interface SpaceBadgeProps {
  space: SpaceType
  size?: 'sm' | 'md'
  className?: string
}

export function SpaceBadge({ space, size = 'md', className }: SpaceBadgeProps) {
  const isShared = space === 'shared'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        isShared
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        className
      )}
    >
      {isShared ? (
        <>
          <Users className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
          <span>Partagé</span>
        </>
      ) : (
        <>
          <Lock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
          <span>Personnel</span>
        </>
      )}
    </span>
  )
}

// Indicateur de visibilité dans les formulaires
interface VisibilityIndicatorProps {
  isPersonal: boolean
  className?: string
}

export function VisibilityIndicator({ isPersonal, className }: VisibilityIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        isPersonal ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground',
        className
      )}
    >
      {isPersonal ? (
        <>
          <EyeOff className="h-4 w-4" />
          <span>Visible uniquement par vous</span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          <span>Visible par votre équipe</span>
        </>
      )}
    </div>
  )
}

export default SpaceSwitcher
