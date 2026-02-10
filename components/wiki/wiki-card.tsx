'use client'

/**
 * Composant WikiCard
 * Affiche une note Wiki dans la liste
 */

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Eye, User } from 'lucide-react'
import type { WikiNoteWithAuthor } from '@/types/database.types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WikiCardProps {
  note: WikiNoteWithAuthor
  onClick?: () => void
}

export function WikiCard({ note, onClick }: WikiCardProps) {
  // Extraire un aperçu du contenu
  const preview = note.content
    .replace(/[#*`_~\[\]]/g, '')
    .slice(0, 150)
    .trim()

  // Estimer le temps de lecture (200 mots/min)
  const wordCount = note.content.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Titre */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
          {note.title}
        </h3>

        {/* Aperçu */}
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {preview}...
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {note.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {note.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{note.author?.full_name || 'Anonyme'}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span>{readingTime} min de lecture</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{note.view_count || 0}</span>
            </div>
            <span>
              {formatDistanceToNow(new Date(note.created_at), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
