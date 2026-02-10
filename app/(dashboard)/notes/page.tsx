'use client'

/**
 * Page de gestion des notes personnelles
 * Interface à deux colonnes : liste + éditeur
 */

import { useEffect } from 'react'
import { Plus, Search, Pin, Clock, Loader2 } from 'lucide-react'
import { useNotesStore, usePinnedNotes, useRecentNotes } from '@/lib/stores/notes-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NoteCard } from '@/components/notes/note-card'
import { NoteEditor } from '@/components/notes/note-editor'
import type { PersonalNote } from '@/types/database.types'

export default function NotesPage() {
  const {
    fetchNotes,
    isLoading,
    searchQuery,
    setSearchQuery,
    searchNotes,
    activeNote,
    setActiveNote,
    createNote,
  } = useNotesStore()

  const pinnedNotes = usePinnedNotes()
  const recentNotes = useRecentNotes(20)

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

  const handleNewNote = async () => {
    const result = await createNote({
      title: 'Nouvelle note',
      content: '',
      format: 'markdown',
    })
    if (result.note) {
      setActiveNote(result.note)
    }
  }

  const handleSelectNote = (note: PersonalNote) => {
    setActiveNote(note)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar - Liste des notes */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r pr-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Mes Notes
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Notes personnelles et privées
          </p>
        </div>

        {/* Recherche + Nouveau */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-9"
            />
          </div>
          <Button onClick={handleNewNote} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Liste des notes */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* Notes épinglées */}
              {pinnedNotes.length > 0 && !searchQuery && (
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
                    <Pin className="w-4 h-4" />
                    Épinglées ({pinnedNotes.length})
                  </h2>
                  <div className="space-y-2">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isActive={activeNote?.id === note.id}
                        onClick={() => handleSelectNote(note)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Notes récentes */}
              <div>
                <h2 className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
                  <Clock className="w-4 h-4" />
                  {searchQuery ? `Résultats (${recentNotes.length})` : 'Récentes'}
                </h2>
                {recentNotes.length > 0 ? (
                  <div className="space-y-2">
                    {recentNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isActive={activeNote?.id === note.id}
                        onClick={() => handleSelectNote(note)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p>Aucune note</p>
                    <Button
                      variant="link"
                      onClick={handleNewNote}
                      className="mt-2"
                    >
                      Créer une note
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Éditeur */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg border overflow-hidden">
        <NoteEditor
          note={activeNote}
          onClose={() => setActiveNote(null)}
        />
      </div>
    </div>
  )
}
