/**
 * Page d'accueil
 * Landing page pour présentation du projet
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
              CS
            </div>
            <span className="font-semibold text-xl">Cabinet SaaS</span>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Commencer</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Transformez votre cabinet avec la{' '}
            <span className="text-blue-600">gamification</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Une plateforme collaborative qui rend le travail en cabinet comptable
            plus engageant, productif et valorisant pour vos équipes.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Démarrer gratuitement</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Découvrir</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-2">
                ✅
              </div>
              <CardTitle>Gestion des tâches</CardTitle>
              <CardDescription>
                Tâches personnelles privées et professionnelles avec validation par pairs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Kanban et listes</li>
                <li>• Chiffrement E2E pour tâches perso</li>
                <li>• Système de validation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-2">
                🎯
              </div>
              <CardTitle>Gamification</CardTitle>
              <CardDescription>
                XP, niveaux, badges et avatars pour motiver vos équipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Système d&apos;XP et niveaux (1-20)</li>
                <li>• 10 badges de lancement</li>
                <li>• Avatars 2D personnalisables</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-2">
                📚
              </div>
              <CardTitle>Wiki collaboratif</CardTitle>
              <CardDescription>
                Base de connaissances partagée pour capitaliser l&apos;expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Éditeur Markdown</li>
                <li>• Recherche full-text</li>
                <li>• Versioning automatique</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-8">
            Objectifs Phase 1 (MVP)
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">-15%</div>
              <div className="text-sm text-gray-600">Réduction turnover juniors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">-30%</div>
              <div className="text-sm text-gray-600">Temps recherche info</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">2+</div>
              <div className="text-sm text-gray-600">Notes Wiki / mois</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">80%</div>
              <div className="text-sm text-gray-600">Taux d&apos;adoption (M+3)</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Cabinet SaaS - MVP Phase 1</p>
          <p className="text-sm mt-2">
            Plateforme gamifiée pour cabinets d&apos;expertise comptable
          </p>
        </div>
      </footer>
    </div>
  );
}
