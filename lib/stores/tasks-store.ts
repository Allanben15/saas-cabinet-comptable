/**
 * Store Zustand pour la gestion des tâches
 * Gère le CRUD des tâches personnelles et professionnelles
 */

import { create } from 'zustand'
import type { Task, TaskInsert, TaskUpdate, TaskStatus, TaskType } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

interface TasksState {
  // État
  tasks: Task[]
  isLoading: boolean
  error: string | null

  // Filtres
  filter: {
    type: TaskType | 'all'
    status: TaskStatus | 'all'
  }

  // Actions
  setFilter: (filter: Partial<TasksState['filter']>) => void

  // CRUD
  fetchTasks: () => Promise<void>
  createTask: (task: TaskInsert) => Promise<{ error: string | null; task: Task | null }>
  updateTask: (id: string, updates: TaskUpdate) => Promise<{ error: string | null }>
  deleteTask: (id: string) => Promise<{ error: string | null }>

  // Actions spécifiques
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<{ error: string | null }>
  completeTask: (id: string) => Promise<{ error: string | null; xpGained: number }>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  // État initial
  tasks: [],
  isLoading: false,
  error: null,
  filter: {
    type: 'all',
    status: 'all',
  },

  // Setters
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter }
  })),

  // Récupérer toutes les tâches de l'utilisateur
  fetchTasks: async () => {
    const supabase = createClient()
    set({ isLoading: true, error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ isLoading: false, error: 'Non authentifié' })
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ tasks: data || [], isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des tâches'
      })
    }
  },

  // Créer une nouvelle tâche
  createTask: async (taskData) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: 'Non authentifié', task: null }
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Ajouter la tâche au state local
      set((state) => ({
        tasks: [data, ...state.tasks]
      }))

      return { error: null, task: data }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la création'
      set({ error: message })
      return { error: message, task: null }
    }
  },

  // Mettre à jour une tâche
  updateTask: async (id, updates) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Mettre à jour le state local
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      }))

      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      set({ error: message })
      return { error: message }
    }
  },

  // Supprimer une tâche
  deleteTask: async (id) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Supprimer du state local
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id)
      }))

      return { error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression'
      set({ error: message })
      return { error: message }
    }
  },

  // Mettre à jour le statut d'une tâche
  updateTaskStatus: async (id, status) => {
    return get().updateTask(id, { status })
  },

  // Compléter une tâche et gagner de l'XP
  completeTask: async (id) => {
    const supabase = createClient()
    set({ error: null })

    try {
      const task = get().tasks.find((t) => t.id === id)
      if (!task) {
        return { error: 'Tâche non trouvée', xpGained: 0 }
      }

      // Calculer l'XP à attribuer
      let xpAmount = task.task_type === 'personal' ? 5 : 30

      // Bonus si avant la deadline
      if (task.due_date && new Date(task.due_date) > new Date()) {
        xpAmount += 50
      }

      // Mettre à jour la tâche comme complétée
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          status: 'completed' as TaskStatus,
          completed_at: new Date().toISOString(),
          xp_awarded: xpAmount,
          xp_claimed: true,
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Ajouter l'XP via la fonction Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const sourceType = task.task_type === 'personal' ? 'task_personal' : 'task_professional'
        await supabase.rpc('add_xp_to_user', {
          p_user_id: user.id,
          p_xp_amount: xpAmount,
          p_source_type: sourceType,
          p_source_id: id,
          p_reason: `Tâche complétée: ${task.title}`,
        })
      }

      // Mettre à jour le state local
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: 'completed' as TaskStatus,
                completed_at: new Date().toISOString(),
                xp_awarded: xpAmount,
                xp_claimed: true,
              }
            : t
        )
      }))

      return { error: null, xpGained: xpAmount }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la complétion'
      set({ error: message })
      return { error: message, xpGained: 0 }
    }
  },
}))

// Sélecteurs pour filtrer les tâches
export const useFilteredTasks = () => {
  const { tasks, filter } = useTasksStore()

  return tasks.filter((task) => {
    if (filter.type !== 'all' && task.task_type !== filter.type) return false
    if (filter.status !== 'all' && task.status !== filter.status) return false
    return true
  })
}

// Sélecteur pour grouper les tâches par statut (Kanban)
export const useTasksByStatus = () => {
  const { tasks } = useTasksStore()

  return {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    in_validation: tasks.filter((t) => t.status === 'in_validation'),
    completed: tasks.filter((t) => t.status === 'completed'),
  }
}
