'use client'

/**
 * Page de connexion - Design moderne premium
 * Permet aux utilisateurs de se connecter avec email/password
 */

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'

// Schema de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [error, setError] = useState<string | null>(null)
  const { signIn, status } = useAuthStore()
  const isLoading = status === 'loading'

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormData) {
    setError(null)

    const result = await signIn(data.email, data.password)

    if (result.error) {
      setError(result.error)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <Card variant="glass" className="border-border/30">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-center">
          Connexion
        </CardTitle>
        <CardDescription className="text-center">
          Connectez-vous pour acceder a votre espace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-xl text-sm",
                "bg-destructive/10 border border-destructive/20 text-destructive",
                "animate-fade-in-down"
              )}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                      <Input
                        type="email"
                        placeholder="votre@email.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className={cn(
                          "pl-11 h-12 rounded-xl",
                          "bg-secondary/30 border-border/50",
                          "focus:bg-secondary/50 focus:border-primary/50",
                          "transition-all duration-300"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                      <Input
                        type="password"
                        placeholder="Votre mot de passe"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className={cn(
                          "pl-11 h-12 rounded-xl",
                          "bg-secondary/30 border-border/50",
                          "focus:bg-secondary/50 focus:border-primary/50",
                          "transition-all duration-300"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-2">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-4 text-muted-foreground">
              Pas encore de compte ?
            </span>
          </div>
        </div>

        <Button variant="outline" asChild className="w-full group">
          <Link href="/register">
            Creer un compte
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card variant="glass" className="border-border/30">
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  )
}
