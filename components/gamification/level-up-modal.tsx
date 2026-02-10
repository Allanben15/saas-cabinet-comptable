'use client'

/**
 * Composant LevelUpModal
 * Modal de célébration pour le passage de niveau avec confetti
 */

import { useEffect, useState } from 'react'
import { Sparkles, Star, Trophy, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
  previousLevel: number
}

// Composant Confetti simple
function Confetti() {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    color: string
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  previousLevel,
}: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      // Arrêter les confetti après 3 secondes
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Déterminer le rang basé sur le niveau (100 niveaux)
  const getRank = (level: number) => {
    if (level >= 100) return { title: 'Légende', emoji: '👑', color: 'text-amber-500' }
    if (level >= 90) return { title: 'Élite', emoji: '💫', color: 'text-rose-500' }
    if (level >= 75) return { title: 'Champion', emoji: '🏅', color: 'text-orange-500' }
    if (level >= 50) return { title: 'Maître', emoji: '🏆', color: 'text-yellow-500' }
    if (level >= 25) return { title: 'Expert', emoji: '💎', color: 'text-purple-500' }
    if (level >= 10) return { title: 'Confirmé', emoji: '⭐', color: 'text-blue-500' }
    return { title: 'Débutant', emoji: '🌱', color: 'text-green-500' }
  }

  const rank = getRank(newLevel)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden border-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
        {/* Confetti */}
        {showConfetti && <Confetti />}

        {/* Fond étoilé */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <Star
              key={i}
              className="absolute text-white/10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${8 + Math.random() * 12}px`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Contenu */}
        <div className="relative z-10 text-center py-8">
          {/* Icône */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl animate-bounce-slow">
              <span className="text-5xl">{rank.emoji}</span>
            </div>
            <div className="absolute -right-2 -top-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          {/* Titre */}
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Level Up !
            <Sparkles className="w-6 h-6 text-amber-400" />
          </h2>

          {/* Nouveau niveau */}
          <div className="mb-6">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 animate-pulse">
              {newLevel}
            </div>
            <p className="text-white/70 text-sm mt-1">
              Niveau {previousLevel} → Niveau {newLevel}
            </p>
          </div>

          {/* Rang */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Trophy className={cn('w-5 h-5', rank.color)} />
            <span className="text-white font-medium">
              Rang : {rank.title}
            </span>
          </div>

          {/* Message motivant */}
          <p className="text-white/80 mb-8 max-w-xs mx-auto">
            {newLevel >= 100
              ? 'Incroyable ! Vous avez atteint le niveau maximum. Vous êtes une légende !'
              : newLevel >= 75
              ? 'Extraordinaire ! Vous êtes parmi les meilleurs !'
              : newLevel >= 50
              ? 'Impressionnant ! Vous avez atteint la maîtrise.'
              : newLevel >= 25
              ? 'Excellent ! Vous êtes maintenant un expert reconnu.'
              : 'Continuez comme ça ! Chaque niveau vous rapproche de l\'expertise.'}
          </p>

          {/* Bouton */}
          <Button
            onClick={onClose}
            className="bg-white text-indigo-900 hover:bg-white/90 font-semibold px-8"
          >
            Continuer l&apos;aventure
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
