'use client'

/**
 * Composant TaskCard
 * Affiche une tâche individuelle dans le Kanban
 */

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, TaskPriority } from '@/types/database.types'
import { useTasksStore } from '@/lib/stores/tasks-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; icon: typeof AlertCircle }> = {
  low: { label: 'Basse', color: 'bg-slate-100 text-slate-700', icon: Clock },
  medium: { label: 'Moyenne', color: 'bg-blue-100 text-blue-700', icon: Clock },
  high: { label: 'Haute', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteTask, completeTask } = useTasksStore()

  const priority = priorityConfig[task.priority]
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  const handleDelete = async () => {
    if (!confirm('Supprimer cette tâche ?')) return
    setIsDeleting(true)
    await deleteTask(task.id)
    setIsDeleting(false)
  }

  const handleComplete = async () => {
    const result = await completeTask(task.id)
    if (result.xpGained > 0) {
      // On pourrait afficher une notification toast ici
      console.log(`+${result.xpGained} XP !`)
    }
  }

  return (
    <Card className={cn(
      'group cursor-pointer transition-all hover:shadow-md',
      isOverdue && 'border-red-200 bg-red-50/50',
      task.status === 'completed' && 'opacity-75'
    )}>
      <CardContent className="p-4">
        {/* Header avec titre et menu */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={cn(
            'font-medium text-sm line-clamp-2',
            task.status === 'completed' && 'line-through text-slate-500'
          )}>
            {task.title}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== 'completed' && (
                <>
                  <DropdownMenuItem onClick={handleComplete}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Terminer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(task)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer avec badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type */}
          <Badge variant="outline" className="text-xs">
            {task.task_type === 'personal' ? 'Perso' : 'Pro'}
          </Badge>

          {/* Priorité */}
          <Badge className={cn('text-xs', priority.color)}>
            <priority.icon className="w-3 h-3 mr-1" />
            {priority.label}
          </Badge>

          {/* Date d'échéance */}
          {task.due_date && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                isOverdue && 'border-red-300 text-red-600'
              )}
            >
              <Calendar className="w-3 h-3 mr-1" />
              {formatDistanceToNow(new Date(task.due_date), {
                addSuffix: true,
                locale: fr,
              })}
            </Badge>
          )}

          {/* XP */}
          {task.xp_awarded > 0 && task.status === 'completed' && (
            <Badge className="text-xs bg-green-100 text-green-700">
              +{task.xp_awarded} XP
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
