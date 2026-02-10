'use client'

/**
 * Theme Toggle - Bouton pour switcher entre dark et light mode
 * Design moderne avec animation fluide
 */

import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'default' | 'minimal' | 'dropdown'
  className?: string
}

export function ThemeToggle({ variant = 'default', className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Éviter l'hydratation mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn(
        'w-10 h-10 rounded-xl bg-secondary/50 animate-pulse',
        className
      )} />
    )
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'p-2 rounded-xl transition-all duration-300',
          'bg-secondary/50 hover:bg-secondary',
          'text-muted-foreground hover:text-foreground',
          'hover:scale-105 active:scale-95',
          className
        )}
        title={resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    )
  }

  // Default variant - 3 options
  return (
    <div className={cn(
      'flex items-center gap-1 p-1 rounded-xl',
      'bg-secondary/30 backdrop-blur-sm',
      'border border-border/50',
      className
    )}>
      <ThemeButton
        active={theme === 'light'}
        onClick={() => setTheme('light')}
        title="Mode clair"
      >
        <Sun className="w-4 h-4" />
      </ThemeButton>
      <ThemeButton
        active={theme === 'dark'}
        onClick={() => setTheme('dark')}
        title="Mode sombre"
      >
        <Moon className="w-4 h-4" />
      </ThemeButton>
      <ThemeButton
        active={theme === 'system'}
        onClick={() => setTheme('system')}
        title="Système"
      >
        <Monitor className="w-4 h-4" />
      </ThemeButton>
    </div>
  )
}

interface ThemeButtonProps {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}

function ThemeButton({ active, onClick, title, children }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded-lg transition-all duration-300',
        active
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      )}
    >
      {children}
    </button>
  )
}
