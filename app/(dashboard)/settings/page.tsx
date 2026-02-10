'use client'

/**
 * Page Paramètres
 * Permet de personnaliser le profil et l'avatar 3D
 */

import { useState } from 'react'
import { User, Palette, Bell, Shield, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar3D } from '@/components/avatar'
import { AvatarCreator } from '@/components/avatar'
import { UserAvatar2D } from '@/components/gamification/user-avatar-2d'
import { toast } from 'sonner'

const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#64748b', // Slate
]

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuthStore()
  const [isAvatarCreatorOpen, setIsAvatarCreatorOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || '#6366f1')

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_color: avatarColor,
        })
        .eq('id', profile.id)

      if (error) throw error

      await refreshProfile()
      toast.success('Profil mis à jour')
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarCreated = async (avatarUrl: string) => {
    if (!profile) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', profile.id)

      if (error) throw error

      await refreshProfile()
      toast.success('Avatar 3D mis à jour !')
    } catch (error) {
      console.error('Erreur mise à jour avatar:', error)
      toast.error('Erreur lors de la mise à jour de l\'avatar')
    }
  }

  const handleRemoveAvatar3D = async () => {
    if (!profile) return

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id)

      if (error) throw error

      await refreshProfile()
      toast.success('Avatar 3D supprimé')
    } catch (error) {
      console.error('Erreur suppression avatar:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Paramètres
        </h1>
        <p className="text-slate-500 mt-1">
          Personnalisez votre profil et vos préférences
        </p>
      </div>

      {/* Avatar 3D */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Avatar 3D
          </CardTitle>
          <CardDescription>
            Créez votre avatar 3D personnalisé avec Ready Player Me
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Prévisualisation Avatar */}
            <div className="flex flex-col items-center gap-4">
              <Avatar3D
                avatarUrl={profile?.avatar_url || undefined}
                size="xl"
                enableControls={true}
                autoRotate={!profile?.avatar_url}
                showEnvironment={true}
              />
              <p className="text-sm text-slate-500">
                {profile?.avatar_url ? 'Votre avatar 3D' : 'Avatar par défaut'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex-1 space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Personnalisation complète</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Choisissez votre visage, coiffure, vêtements, accessoires et bien plus
                  avec le créateur d'avatar Ready Player Me.
                </p>
                <Button onClick={() => setIsAvatarCreatorOpen(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {profile?.avatar_url ? 'Modifier mon avatar' : 'Créer mon avatar 3D'}
                </Button>
              </div>

              {profile?.avatar_url && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleRemoveAvatar3D}
                >
                  Supprimer l'avatar 3D
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profil de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Informations du profil
          </CardTitle>
          <CardDescription>
            Vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-slate-50 dark:bg-slate-800"
            />
            <p className="text-xs text-slate-500">L'email ne peut pas être modifié</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </CardContent>
      </Card>

      {/* Avatar 2D (fallback) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-500" />
            Avatar 2D (fallback)
          </CardTitle>
          <CardDescription>
            Avatar simplifié utilisé quand l'avatar 3D n'est pas disponible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-8">
            {/* Prévisualisation */}
            <div className="flex flex-col items-center gap-2">
              <UserAvatar2D
                name={fullName || profile?.full_name}
                state={profile?.avatar_state || 'neutral'}
                color={avatarColor}
                level={profile?.current_level}
                size="xl"
                showState={true}
              />
              <p className="text-sm text-slate-500">Aperçu</p>
            </div>

            {/* Sélecteur de couleur */}
            <div className="flex-1">
              <Label className="mb-3 block">Couleur de l'avatar</Label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-full transition-all ${
                      avatarColor === color
                        ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setAvatarColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications - placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Notifications
          </CardTitle>
          <CardDescription>
            Gérez vos préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">
            Les paramètres de notifications seront disponibles prochainement.
          </p>
        </CardContent>
      </Card>

      {/* Sécurité - placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Options de sécurité et confidentialité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">
            Les paramètres de sécurité seront disponibles prochainement.
          </p>
        </CardContent>
      </Card>

      {/* Modal créateur d'avatar */}
      <AvatarCreator
        isOpen={isAvatarCreatorOpen}
        onClose={() => setIsAvatarCreatorOpen(false)}
        onAvatarCreated={handleAvatarCreated}
      />
    </div>
  )
}
