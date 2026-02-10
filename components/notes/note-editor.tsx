'use client'

/**
 * Composant NoteEditor
 * Éditeur de note avec support Markdown et preview
 * Utilise useAutoSave pour la sauvegarde automatique avec retry et offline support
 */

import { useState, useEffect, useMemo } from 'react'
import { Save, Eye, EyeOff, Trash2, Pin, PinOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PersonalNote, NoteFormat } from '@/types/database.types'
import { useNotesStore } from '@/lib/stores/notes-store'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SaveIndicator } from '@/components/ui/SaveIndicator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface NoteEditorProps {
  note: PersonalNote | null
  onClose?: () => void
}

export function NoteEditor({ note, onClose }: NoteEditorProps) {
  const { updateNote, deleteNote, togglePin, createNote, setActiveNote, fetchNotes } = useNotesStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [format, setFormat] = useState<NoteFormat>('markdown')
  const [showPreview, setShowPreview] = useState(false)

  // Données pour l'auto-save
  const autoSaveData = useMemo(() => ({
    title,
    content,
    format,
  }), [title, content, format])

  // Hook d'auto-save avec retry, offline support et protection beforeunload
  const {
    saveStatus,
    forceSave,
    isSaving,
    hasUnsavedChanges,
    getDraft,
    clearDraft,
  } = useAutoSave({
    data: autoSaveData,
    entityId: note?.id || null,
    entityType: 'personal_notes',
    saveInterval: 2000,
    enabled: !!note?.id,
    onSaveSuccess: () => {
      fetchNotes() // Rafraîchir la liste
    },
    onSaveError: (error) => {
      console.error('Erreur auto-save:', error)
    },
  })

  // Charger la note
  useEffect(() => {
    if (note) {
      // Vérifier s'il y a un draft local
      const draft = getDraft()
      if (draft && draft.title && draft.content) {
        // Proposer de restaurer le draft
        toast.info('Brouillon trouvé', {
          description: 'Des modifications non sauvegardées ont été récupérées.',
          action: {
            label: 'Restaurer',
            onClick: () => {
              setTitle(draft.title as string)
              setContent(draft.content as string)
              setFormat(draft.format as NoteFormat || 'markdown')
            },
          },
        })
        clearDraft()
      }

      setTitle(note.title)
      setContent(note.content)
      setFormat(note.format)
    } else {
      setTitle('')
      setContent('')
      setFormat('markdown')
    }
  }, [note, getDraft, clearDraft])

  // Sauvegarder manuellement
  const handleSave = async () => {
    if (!note) {
      // Créer une nouvelle note
      const result = await createNote({ title, content, format })
      if (result.note) {
        setActiveNote(result.note)
        toast.success('Note créée')
      }
    } else {
      // Forcer la sauvegarde
      await forceSave()
    }
  }

  // Supprimer
  const handleDelete = async () => {
    if (!note) return
    if (!confirm('Supprimer cette note ?')) return
    await deleteNote(note.id)
    onClose?.()
  }

  // Épingler
  const handleTogglePin = async () => {
    if (!note) return
    const result = await togglePin(note.id)
    if (result.error) {
      alert(result.error)
    }
  }

  // Rendu Markdown simplifié
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code class="bg-slate-100 px-1 rounded">$1</code>')
      .replace(/\n/gim, '<br />')
  }

  if (!note && !title && !content) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p className="mb-2">Sélectionnez une note ou créez-en une nouvelle</p>
          <Button onClick={() => setActiveNote({ id: '', title: 'Nouvelle note', content: '', format: 'markdown' } as PersonalNote)}>
            Nouvelle note
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <Select value={format} onValueChange={(v) => setFormat(v as NoteFormat)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="richtext">Texte riche</SelectItem>
              <SelectItem value="list">Liste</SelectItem>
              <SelectItem value="freeform">Libre</SelectItem>
            </SelectContent>
          </Select>

          {format === 'markdown' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Éditer
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Indicateur de sauvegarde */}
          {note && (
            <SaveIndicator
              status={saveStatus.status}
              lastSaved={saveStatus.lastSaved}
              onRetry={forceSave}
              className="text-xs"
            />
          )}

          {note && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTogglePin}
                title={note.is_pinned ? 'Désépingler' : 'Épingler'}
              >
                {note.is_pinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}

          <Button onClick={handleSave} disabled={isSaving || (!note && !title)} variant={hasUnsavedChanges ? 'default' : 'outline'}>
            <Save className="w-4 h-4 mr-2" />
            {note ? (hasUnsavedChanges ? 'Sauvegarder' : 'Sauvegardé') : 'Créer'}
          </Button>
        </div>
      </div>

      {/* Titre */}
      <div className="px-4 pt-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la note"
          className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0"
        />
      </div>

      {/* Contenu */}
      <div className="flex-1 p-4 overflow-auto">
        {showPreview && format === 'markdown' ? (
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Commencez à écrire..."
            className="min-h-[400px] resize-none border-none shadow-none focus-visible:ring-0 text-base"
          />
        )}
      </div>
    </div>
  )
}
