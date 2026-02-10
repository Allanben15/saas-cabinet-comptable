'use client'

/**
 * Page d'inscription - Design moderne premium
 * Permet aux utilisateurs de creer un compte
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle, User, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'

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
const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { signUp, status } = useAuthStore()
  const isLoading = status === 'loading'

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: RegisterFormData) {
    setError(null)

    const result = await signUp(data.email, data.password, data.fullName)

    if (result.error) {
      setError(result.error)
      return
    }

    // Afficher le message de succes (attente confirmation email)
    setSuccess(true)
  }

  // Affichage apres inscription reussie
  if (success) {
    return (
      <Card variant="glass" className="border-border/30">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Success icon */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full blur-lg opacity-40 animate-pulse-slow" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold">Inscription reussie !</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Un email de confirmation a ete envoye a votre adresse.
                Veuillez cliquer sur le lien dans l&apos;email pour activer votre compte.
              </p>
            </div>

            <Button variant="gradient" asChild className="w-full group mt-4">
              <Link href="/login">
                Retour a la connexion
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="glass" className="border-border/30">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-center">
          Creer un compte
        </CardTitle>
        <CardDescription className="text-center">
          Rejoignez votre equipe sur Cabinet SaaS
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
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Nom complet</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                      <Input
                        placeholder="Jean Dupont"
                        autoComplete="name"
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
                        placeholder="Minimum 6 caracteres"
                        autoComplete="new-password"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                      <Input
                        type="password"
                        placeholder="Repetez le mot de passe"
                        autoComplete="new-password"
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
                  <Sparkles className="w-5 h-5" />
                  Creer mon compte
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
              Deja un compte ?
            </span>
          </div>
        </div>

        <Button variant="outline" asChild className="w-full group">
          <Link href="/login">
            Se connecter
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
