/**
 * Hook useAutoSave
 * Auto-sauvegarde avec debounce, retry automatique, support offline
 * et protection contre la fermeture non sauvegardée
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type EntityType = 'personal_notes' | 'wiki_notes' | 'tasks'

interface AutoSaveConfig<T> {
  data: T
  entityId: string | null
  entityType: EntityType
  saveInterval?: number
  enabled?: boolean
  onSaveSuccess?: () => void
  onSaveError?: (error: string) => void
}

export interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'offline'
  lastSaved: Date | null
  error: string | null
}

export function useAutoSave<T extends Record<string, unknown>>({
  data,
  entityId,
  entityType,
  saveInterval = 2000,
  enabled = true,
  onSaveSuccess,
  onSaveError,
}: AutoSaveConfig<T>) {
  const supabase = createClient()

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'idle',
    lastSaved: null,
    error: null,
  })

  const previousDataRef = useRef<string>(JSON.stringify(data))
  const debounceRef = useRef<NodeJS.Timeout>(undefined)
  const retryCount = useRef(0)
  const maxRetries = 3

  // Fonction de sauvegarde
  const save = useCallback(async (payload: T): Promise<boolean> => {
    if (!entityId) return false

    try {
      setSaveStatus(prev => ({ ...prev, status: 'saving', error: null }))

      const { error } = await supabase
        .from(entityType)
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entityId)

      if (error) throw error

      retryCount.current = 0
      setSaveStatus({
        status: 'saved',
        lastSaved: new Date(),
        error: null,
      })

      onSaveSuccess?.()

      // Reset à idle après 3 secondes
      setTimeout(() => {
        setSaveStatus(prev =>
          prev.status === 'saved' ? { ...prev, status: 'idle' } : prev
        )
      }, 3000)

      return true
    } catch (error) {
      retryCount.current++
      const errorMessage = error instanceof Error ? error.message : 'Erreur de sauvegarde'

      // Retry automatique (max 3 fois)
      if (retryCount.current < maxRetries) {
        setTimeout(() => save(payload), 1000 * retryCount.current)
        return false
      }

      setSaveStatus({
        status: 'error',
        lastSaved: saveStatus.lastSaved,
        error: errorMessage,
      })

      // Sauvegarde locale de secours
      if (entityId) {
        const draftKey = `draft_${entityType}_${entityId}`
        localStorage.setItem(draftKey, JSON.stringify({
          data: payload,
          savedAt: new Date().toISOString(),
        }))
      }

      onSaveError?.(errorMessage)

      toast.error('Erreur de sauvegarde', {
        description: 'Modifications conservées localement',
        action: {
          label: 'Réessayer',
          onClick: () => {
            retryCount.current = 0
            save(payload)
          },
        },
      })

      return false
    }
  }, [entityId, entityType, supabase, onSaveSuccess, onSaveError, saveStatus.lastSaved])

  // Auto-save sur changement de données
  useEffect(() => {
    if (!enabled || !entityId) return

    const currentData = JSON.stringify(data)
    if (currentData === previousDataRef.current) return

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      previousDataRef.current = currentData

      if (navigator.onLine) {
        save(data)
      } else {
        setSaveStatus(prev => ({ ...prev, status: 'offline' }))
        // Sauvegarde locale
        const draftKey = `draft_${entityType}_${entityId}`
        localStorage.setItem(draftKey, JSON.stringify({
          data,
          savedAt: new Date().toISOString(),
        }))
        toast.info('Mode hors-ligne', {
          description: 'Modifications sauvegardées localement',
        })
      }
    }, saveInterval)

    return () => clearTimeout(debounceRef.current)
  }, [data, entityId, enabled, saveInterval, entityType, save])

  // Sync quand on revient en ligne
  useEffect(() => {
    const handleOnline = () => {
      if (saveStatus.status === 'offline' && entityId) {
        const draftKey = `draft_${entityType}_${entityId}`
        const draft = localStorage.getItem(draftKey)
        if (draft) {
          const { data: savedData } = JSON.parse(draft)
          save(savedData)
          localStorage.removeItem(draftKey)
        }
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [entityId, entityType, save, saveStatus.status])

  // Protection contre la fermeture non sauvegardée
  useEffect(() => {
    const handleUnload = (e: BeforeUnloadEvent) => {
      const hasUnsavedChanges = JSON.stringify(data) !== previousDataRef.current
      const isSaving = saveStatus.status === 'saving'

      if (hasUnsavedChanges || isSaving) {
        e.preventDefault()
        e.returnValue = 'Modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [data, saveStatus.status])

  // Forcer la sauvegarde manuellement
  const forceSave = useCallback(() => {
    if (entityId && enabled) {
      retryCount.current = 0
      return save(data)
    }
    return Promise.resolve(false)
  }, [data, entityId, enabled, save])

  // Récupérer un draft local
  const getDraft = useCallback((): T | null => {
    if (!entityId) return null
    const draftKey = `draft_${entityType}_${entityId}`
    const draft = localStorage.getItem(draftKey)
    if (draft) {
      const { data: savedData } = JSON.parse(draft)
      return savedData as T
    }
    return null
  }, [entityId, entityType])

  // Supprimer un draft local
  const clearDraft = useCallback(() => {
    if (!entityId) return
    const draftKey = `draft_${entityType}_${entityId}`
    localStorage.removeItem(draftKey)
  }, [entityId, entityType])

  return {
    saveStatus,
    forceSave,
    isSaving: saveStatus.status === 'saving',
    hasUnsavedChanges: JSON.stringify(data) !== previousDataRef.current,
    getDraft,
    clearDraft,
  }
}

export default useAutoSave
