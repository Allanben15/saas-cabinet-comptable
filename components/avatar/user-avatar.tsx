'use client'

/**
 * Composant UserAvatar unifié
 * Affiche l'avatar 3D si disponible, sinon l'avatar 2D
 */

import { Suspense, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { UserAvatar2D } from '@/components/gamification/user-avatar-2d'
import type { AvatarState } from '@/types/database.types'

// Import dynamique pour éviter les erreurs SSR avec Three.js
const Avatar3D = dynamic(
  () => import('./avatar-3d').then((mod) => mod.Avatar3D),
  {
    ssr: false,
    loading: () => <AvatarPlaceholder />,
  }
)

interface UserAvatarProps {
  avatarUrl?: string | null
  name?: string | null
  state?: AvatarState
  color?: string
  level?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showState?: boolean
  enable3D?: boolean
  className?: string
}

// Placeholder pendant le chargement
function AvatarPlaceholder() {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse" />
  )
}

export function UserAvatar({
  avatarUrl,
  name,
  state = 'neutral',
  color = '#6366f1',
  level,
  size = 'md',
  showState = false,
  enable3D = true,
  className = '',
}: UserAvatarProps) {
  const [isClient, setIsClient] = useState(false)
  const has3DAvatar = enable3D && avatarUrl && avatarUrl.endsWith('.glb')

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Utiliser l'avatar 2D si pas de 3D ou si on est côté serveur
  if (!isClient || !has3DAvatar) {
    return (
      <UserAvatar2D
        name={name}
        state={state}
        color={color}
        level={level}
        size={size}
        showState={showState}
        className={className}
      />
    )
  }

  // Afficher l'avatar 3D
  return (
    <Suspense fallback={<AvatarPlaceholder />}>
      <Avatar3D
        avatarUrl={avatarUrl}
        size={size}
        autoRotate={false}
        showEnvironment={size === 'xl'}
        className={className}
      />
    </Suspense>
  )
}
