'use client'

/**
 * SaveIndicator
 * Composant d'affichage de l'état de sauvegarde
 * États : idle, saving, saved, error, offline
 */

import { Check, Cloud, CloudOff, Loader2, WifiOff, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { SaveStatus } from '@/hooks/useAutoSave'

interface SaveIndicatorProps {
  status: SaveStatus['status']
  lastSaved: Date | null
  onRetry?: () => void
  className?: string
  showLastSaved?: boolean
}

export function SaveIndicator({
  status,
  lastSaved,
  onRetry,
  className,
  showLastSaved = true,
}: SaveIndicatorProps) {
  const content: Record<SaveStatus['status'], React.ReactNode> = {
    idle: lastSaved && showLastSaved ? (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Cloud className="h-4 w-4" />
        <span>
          Enregistré {formatDistanceToNow(lastSaved, { addSuffix: true, locale: fr })}
        </span>
      </div>
    ) : null,

    saving: (
      <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="font-medium">Enregistrement...</span>
      </div>
    ),

    saved: (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <Check className="h-4 w-4" />
        <span className="font-medium">Enregistré</span>
      </div>
    ),

    error: (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-destructive hover:underline transition-colors"
      >
        <CloudOff className="h-4 w-4" />
        <span>Erreur</span>
        <RefreshCw className="h-3 w-3" />
      </button>
    ),

    offline: (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <WifiOff className="h-4 w-4" />
        <span>Hors ligne - Sauvegardé localement</span>
      </div>
    ),
  }

  const currentContent = content[status]
  if (!currentContent) return null

  return (
    <div className={cn('flex items-center text-sm', className)}>
      {currentContent}
    </div>
  )
}

// Composant compact pour la barre d'outils
export function SaveIndicatorCompact({
  status,
  onRetry,
  className,
}: Omit<SaveIndicatorProps, 'lastSaved' | 'showLastSaved'>) {
  const icons: Record<SaveStatus['status'], React.ReactNode> = {
    idle: <Cloud className="h-4 w-4 text-muted-foreground" />,
    saving: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    saved: <Check className="h-4 w-4 text-green-500" />,
    error: (
      <button onClick={onRetry} className="text-destructive hover:text-destructive/80">
        <CloudOff className="h-4 w-4" />
      </button>
    ),
    offline: <WifiOff className="h-4 w-4 text-amber-500" />,
  }

  return (
    <div className={cn('flex items-center', className)} title={status}>
      {icons[status]}
    </div>
  )
}

// Badge animé pour le header
export function SaveBadge({ status }: { status: SaveStatus['status'] }) {
  const configs: Record<SaveStatus['status'], { bg: string; text: string; label: string }> = {
    idle: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Prêt' },
    saving: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Sauvegarde...' },
    saved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Enregistré' },
    error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Erreur' },
    offline: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'Hors ligne' },
  }

  const config = configs[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300',
        config.bg,
        config.text
      )}
    >
      {status === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'saved' && <Check className="h-3 w-3" />}
      {config.label}
    </span>
  )
}

export default SaveIndicator
