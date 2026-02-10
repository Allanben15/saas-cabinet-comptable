'use client'

/**
 * Page de visualisation/édition d'une note Wiki
 * Auto-save avec retry, offline support et indicateur visuel
 */

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft,
  Edit,
  Save,
  Send,
  Eye,
  User,
  Loader2,
  Trash2,
} from 'lucide-react'
import { useWikiStore } from '@/lib/stores/wiki-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useAutoSave } from '@/hooks/useAutoSave'
import type { WikiNoteWithAuthor } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SaveIndicator } from '@/components/ui/SaveIndicator'
import { toast } from 'sonner'

export default function WikiNotePage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string

  const { fetchNote, updateNote, publishNote, deleteNote } = useWikiStore()
  const { user } = useAuthStore()

  const [note, setNote] = useState<WikiNoteWithAuthor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // État d'édition
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')

  // Données pour l'auto-save
  const autoSaveData = useMemo(() => {
    const tagsArray = editTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)

    return {
      title: editTitle,
      content: editContent,
      tags: tagsArray,
    }
  }, [editTitle, editContent, editTags])

  // Hook d'auto-save avec retry et offline support
  const {
    saveStatus,
    forceSave,
    isSaving: autoSaving,
    hasUnsavedChanges,
    getDraft,
    clearDraft,
  } = useAutoSave({
    data: autoSaveData,
    entityId: isEditing ? note?.id || null : null, // Active seulement en mode édition
    entityType: 'wiki_notes',
    saveInterval: 3000,
    enabled: isEditing,
    onSaveSuccess: () => {
      setNote((prev) =>
        prev ? { ...prev, ...autoSaveData } : null
      )
    },
    onSaveError: (error) => {
      console.error('Erreur auto-save Wiki:', error)
    },
  })

  // Charger la note
  useEffect(() => {
    async function loadNote() {
      setIsLoading(true)
      const data = await fetchNote(noteId)
      if (data) {
        setNote(data)
        setEditTitle(data.title)
        setEditContent(data.content)
        setEditTags(data.tags?.join(', ') || '')

        // Vérifier s'il y a un draft local
        const draft = getDraft()
        if (draft && (draft.title || draft.content)) {
          toast.info('Brouillon Wiki trouvé', {
            description: 'Des modifications non sauvegardées ont été récupérées.',
            action: {
              label: 'Restaurer',
              onClick: () => {
                setEditTitle(draft.title as string || data.title)
                setEditContent(draft.content as string || data.content)
                if (draft.tags) {
                  setEditTags((draft.tags as string[]).join(', '))
                }
                setIsEditing(true)
              },
            },
          })
          clearDraft()
        }
      }
      setIsLoading(false)
    }
    loadNote()
  }, [noteId, fetchNote, getDraft, clearDraft])

  const isAuthor = user?.id === note?.author_id
  const canEdit = isAuthor && !note?.is_published

  const handleSave = async () => {
    if (!note) return

    setIsSaving(true)

    // Forcer la sauvegarde via le hook
    await forceSave()

    const tagsArray = editTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)

    setNote({
      ...note,
      title: editTitle,
      content: editContent,
      tags: tagsArray,
    })
    setIsEditing(false)
    setIsSaving(false)
    toast.success('Note sauvegardée')
  }

  const handlePublish = async () => {
    if (!note) return

    // Sauvegarder d'abord
    await handleSave()

    const result = await publishNote(note.id)
    if (result.error) {
      alert(result.error)
    } else {
      alert(`Note publiée ! +${result.xpGained} XP`)
      // Recharger la note
      const data = await fetchNote(noteId)
      if (data) setNote(data)
    }
  }

  const handleDelete = async () => {
    if (!note) return
    if (!confirm('Supprimer cette note définitivement ?')) return

    await deleteNote(note.id)
    router.push('/wiki')
  }

  // Rendu Markdown simplifié
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-4">')
      .replace(/\n/gim, '<br />')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Note non trouvée</p>
        <Button onClick={() => router.push('/wiki')}>
          Retour au Wiki
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation */}
      <Button
        variant="ghost"
        onClick={() => router.push('/wiki')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour au Wiki
      </Button>

      {/* Header */}
      <div className="mb-8">
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 px-0 mb-4"
          />
        ) : (
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {note.title}
          </h1>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{note.author?.full_name || 'Anonyme'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{note.view_count || 0} vues</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(note.created_at), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
          {!note.is_published && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Brouillon
            </Badge>
          )}
        </div>

        {/* Tags */}
        {isEditing ? (
          <Input
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="Tags séparés par des virgules"
            className="mb-4"
          />
        ) : (
          note.tags &&
          note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )
        )}
      </div>

      {/* Actions */}
      {isAuthor && (
        <div className="flex items-center gap-2 mb-6">
          {isEditing ? (
            <>
              {/* Indicateur d'auto-save */}
              <SaveIndicator
                status={saveStatus.status}
                lastSaved={saveStatus.lastSaved}
                onRetry={forceSave}
                className="mr-2"
              />

              <Button onClick={handleSave} disabled={isSaving || autoSaving} variant={hasUnsavedChanges ? 'default' : 'outline'}>
                {(isSaving || autoSaving) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {hasUnsavedChanges ? 'Sauvegarder' : 'Sauvegardé'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(note.title)
                  setEditContent(note.content)
                  setEditTags(note.tags?.join(', ') || '')
                }}
              >
                Annuler
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              )}
              {!note.is_published && (
                <Button onClick={handlePublish}>
                  <Send className="w-4 h-4 mr-2" />
                  Publier (+20 XP)
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )}

      {/* Contenu */}
      <Card>
        <CardContent className="p-8">
          {isEditing ? (
            <div>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Contenu en Markdown..."
                rows={20}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                {editContent.length} caractères (minimum 200 pour publier)
              </p>
            </div>
          ) : (
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: `<p class="mb-4">${renderMarkdown(note.content)}</p>`,
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
