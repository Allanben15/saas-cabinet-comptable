'use client'

/**
 * Composant TaskColumn
 * Colonne Kanban pour un statut de tâche
 */

import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types/database.types'
import { useTasksStore } from '@/lib/stores/tasks-store'
import { TaskCard } from './task-card'

interface TaskColumnProps {
  status: TaskStatus
  tasks: Task[]
  onEditTask: (task: Task) => void
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: {
    label: 'À faire',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
  },
  in_progress: {
    label: 'En cours',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  in_validation: {
    label: 'En validation',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  completed: {
    label: 'Terminé',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
}

export function TaskColumn({ status, tasks, onEditTask }: TaskColumnProps) {
  const config = statusConfig[status]
  const { updateTaskStatus } = useTasksStore()

  // Gérer le drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-slate-50')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-slate-50')
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-slate-50')

    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      await updateTaskStatus(taskId, status)
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  return (
    <div
      className="flex flex-col min-h-[500px] w-64 sm:w-72 flex-shrink-0 snap-start"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn('font-medium', config.color)}>
            {config.label}
          </span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            config.bgColor,
            config.color
          )}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="flex-1 space-y-3 p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-slate-400 dark:text-slate-500">
            Aucune tâche
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              className="cursor-grab active:cursor-grabbing"
            >
              <TaskCard task={task} onEdit={onEditTask} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
