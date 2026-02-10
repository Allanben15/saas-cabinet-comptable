'use client'

/**
 * Composant AvatarCreator
 * Intègre Ready Player Me pour la création d'avatars 3D personnalisables
 */

import { useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AvatarCreatorProps {
  isOpen: boolean
  onClose: () => void
  onAvatarCreated: (avatarUrl: string) => void
}

// Configuration Ready Player Me
const READY_PLAYER_ME_SUBDOMAIN = 'demo' // Utiliser 'demo' pour le développement
const READY_PLAYER_ME_CONFIG = {
  clearCache: true,
  bodyType: 'fullbody',
  quickStart: false,
  language: 'fr',
}

export function AvatarCreator({
  isOpen,
  onClose,
  onAvatarCreated,
}: AvatarCreatorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Construire l'URL Ready Player Me
  const getAvatarCreatorUrl = () => {
    const params = new URLSearchParams({
      frameApi: 'true',
      clearCache: String(READY_PLAYER_ME_CONFIG.clearCache),
      bodyType: READY_PLAYER_ME_CONFIG.bodyType,
      quickStart: String(READY_PLAYER_ME_CONFIG.quickStart),
      language: READY_PLAYER_ME_CONFIG.language,
    })
    return `https://${READY_PLAYER_ME_SUBDOMAIN}.readyplayer.me/avatar?${params.toString()}`
  }

  // Gérer les messages de l'iframe
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Vérifier l'origine
      if (!event.origin.includes('readyplayer.me')) return

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

        // Avatar créé avec succès
        if (data.source === 'readyplayerme' && data.eventName === 'v1.avatar.exported') {
          const avatarUrl = data.data.url
          onAvatarCreated(avatarUrl)
          onClose()
        }

        // Utilisateur a fermé le créateur
        if (data.source === 'readyplayerme' && data.eventName === 'v1.frame.close') {
          onClose()
        }
      } catch {
        // Message non-JSON, ignorer
      }
    },
    [onAvatarCreated, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('message', handleMessage)
      return () => window.removeEventListener('message', handleMessage)
    }
  }, [isOpen, handleMessage])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Personnaliser votre avatar 3D</DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full min-h-0">
          {isOpen && (
            <iframe
              ref={iframeRef}
              src={getAvatarCreatorUrl()}
              className="w-full h-[calc(85vh-60px)] border-0"
              allow="camera *; microphone *; clipboard-write"
              title="Ready Player Me Avatar Creator"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
