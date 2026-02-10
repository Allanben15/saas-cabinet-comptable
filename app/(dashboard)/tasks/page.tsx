'use client'

/**
 * Page de gestion des tâches
 * Affiche un tableau Kanban avec toutes les tâches
 */

import { useEffect, useState } from 'react'
import { Plus, Filter, Loader2 } from 'lucide-react'
import type { Task, TaskType, TaskStatus } from '@/types/database.types'
import { useTasksStore, useTasksByStatus } from '@/lib/stores/tasks-store'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaskColumn } from '@/components/tasks/task-column'
import { TaskForm } from '@/components/tasks/task-form'

const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_validation', 'completed']

export default function TasksPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { fetchTasks, isLoading, filter, setFilter } = useTasksStore()
  const tasksByStatus = useTasksByStatus()

  // Charger les tâches au montage
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setEditingTask(null)
    }
  }

  // Filtrer les tâches par type
  const filterTasksByType = (tasks: Task[]) => {
    if (filter.type === 'all') return tasks
    return tasks.filter((t) => t.task_type === filter.type)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Mes Tâches
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez vos tâches personnelles et professionnelles
          </p>
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">Filtrer par :</span>
        </div>

        <Select
          value={filter.type}
          onValueChange={(value) => setFilter({ type: value as TaskType | 'all' })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de tâche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les tâches</SelectItem>
            <SelectItem value="personal">Personnelles</SelectItem>
            <SelectItem value="professional">Professionnelles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          {statuses.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={filterTasksByType(tasksByStatus[status])}
              onEditTask={handleEditTask}
            />
          ))}
        </div>
      )}

      {/* Formulaire de tâche */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        task={editingTask}
      />
    </div>
  )
}
