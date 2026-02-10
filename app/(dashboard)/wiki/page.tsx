'use client'

/**
 * Page Wiki collaboratif
 * Affiche les notes publiques du cabinet
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Tag, Loader2, BookOpen } from 'lucide-react'
import { useWikiStore, useWikiTags, useFilteredWikiNotes } from '@/lib/stores/wiki-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { WikiCard } from '@/components/wiki/wiki-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function WikiPage() {
  const router = useRouter()
  const {
    fetchNotes,
    isLoading,
    searchQuery,
    setSearchQuery,
    searchNotes,
    selectedTags,
    setSelectedTags,
    createNote,
    setActiveNote,
  } = useWikiStore()

  const tags = useWikiTags()
  const notes = useFilteredWikiNotes()

  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Charger les notes au montage
  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchNotes(searchQuery)
      } else {
        fetchNotes()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchNotes, fetchNotes])

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleCreateNote = async () => {
    if (!newTitle.trim()) return

    setIsCreating(true)
    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)

    const result = await createNote({
      title: newTitle,
      content: newContent,
      tags: tagsArray,
    })

    setIsCreating(false)

    if (!result.error && result.note) {
      setShowNewDialog(false)
      setNewTitle('')
      setNewContent('')
      setNewTags('')
      // Rediriger vers l'édition de la note
      router.push(`/wiki/${result.note.id}`)
    }
  }

  const handleNoteClick = (noteId: string) => {
    router.push(`/wiki/${noteId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Wiki Cabinet
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Base de connaissances collaborative (+20 XP par note publiée)
          </p>
        </div>

        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle note
        </Button>
      </div>

      {/* Recherche */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans le Wiki..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-slate-400" />
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTags([])}
              className="text-xs"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      )}

      {/* Liste des notes */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <WikiCard
              key={note.id}
              note={note}
              onClick={() => handleNoteClick(note.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <BookOpen className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg mb-2">Aucune note dans le Wiki</p>
          <p className="text-sm mb-4">
            Soyez le premier à partager vos connaissances !
          </p>
          <Button onClick={() => setShowNewDialog(true)}>
            Créer la première note
          </Button>
        </div>
      )}

      {/* Dialog nouvelle note */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouvelle note Wiki</DialogTitle>
            <DialogDescription>
              Partagez vos connaissances avec le cabinet. Vous gagnerez +20 XP
              après publication.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Process déclaration TVA"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Contenu (Markdown)</Label>
              <Textarea
                id="content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="# Introduction&#10;&#10;Décrivez le sujet..."
                rows={6}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 200 caractères pour publier
              </p>
            </div>

            <div>
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input
                id="tags"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="tva, process, comptabilité"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewDialog(false)}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateNote}
                disabled={isCreating || !newTitle.trim()}
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Créer le brouillon
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
