'use client'

/**
 * Composant NoteCard
 * Affiche une note dans la liste
 */

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Pin,
  PinOff,
  MoreVertical,
  Trash2,
  FileText,
  List,
  Code,
  AlignLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PersonalNote, NoteFormat } from '@/types/database.types'
import { useNotesStore } from '@/lib/stores/notes-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NoteCardProps {
  note: PersonalNote
  isActive?: boolean
  onClick?: () => void
}

const formatIcons: Record<NoteFormat, typeof FileText> = {
  markdown: Code,
  richtext: FileText,
  list: List,
  freeform: AlignLeft,
}

export function NoteCard({ note, isActive, onClick }: NoteCardProps) {
  const { togglePin, deleteNote } = useNotesStore()

  const FormatIcon = formatIcons[note.format]

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const result = await togglePin(note.id)
    if (result.error) {
      alert(result.error)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Supprimer cette note ?')) return
    await deleteNote(note.id)
  }

  // Extraire un aperçu du contenu
  const preview = note.content
    .replace(/[#*`_~\[\]]/g, '') // Retirer le markdown
    .slice(0, 100)
    .trim()

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md group',
        isActive && 'ring-2 ring-primary',
        note.is_pinned && 'border-amber-200 bg-amber-50/30'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {note.is_pinned && (
              <Pin className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
            <h3 className="font-medium text-sm truncate">
              {note.title || 'Sans titre'}
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleTogglePin}>
                {note.is_pinned ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    Désépingler
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    Épingler
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Aperçu */}
        {preview && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {preview}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <FormatIcon className="w-3 h-3" />
            <span className="capitalize">{note.format}</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(note.updated_at), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
