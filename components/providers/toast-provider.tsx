'use client'

/**
 * Provider pour les notifications toast
 * Utilise Sonner pour des toasts élégants
 */

import { Toaster } from '@/components/ui/sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'group toast',
          title: 'text-sm font-semibold',
          description: 'text-sm opacity-90',
          success: 'bg-green-50 border-green-200 text-green-800',
          error: 'bg-red-50 border-red-200 text-red-800',
          info: 'bg-blue-50 border-blue-200 text-blue-800',
        },
      }}
    />
  )
}
