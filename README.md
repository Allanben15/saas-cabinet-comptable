# 🎯 Cabinet SaaS - Plateforme Gamifiée pour Cabinets Comptables

Plateforme collaborative et gamifiée conçue pour améliorer l'engagement, la productivité et la rétention des équipes en cabinet d'expertise comptable.

---

## 🚀 NOUVEAU ? COMMENCEZ ICI

**👉 Lisez [START_HERE.md](START_HERE.md) - Point d'entrée unique du projet**

Ce fichier vous guidera vers les bons documents selon votre rôle (développeur, PM, reviewer).

---

## 🤖 Méthodologie de Développement

**Ce projet est développé à 100% avec l'assistance d'IA et validé par un développeur senior full stack.**

### 📚 Documents Essentiels

1. **[PROMPT_COMPLET_V2.md](PROMPT_COMPLET_V2.md)** ⭐ **DOCUMENT PRINCIPAL**
   - Prompt complet pour l'IA
   - Stack NestJS + Prisma + Three.js
   - Schéma base de données complet
   - 12 sprints détaillés
   - **→ À fournir à l'IA pour générer le code**

2. **[RESUME_FONCTIONNALITES.md](RESUME_FONCTIONNALITES.md)** ✨
   - Toutes les fonctionnalités détaillées
   - Mockups UI
   - Cas d'usage et ROI
   - **→ Pour comprendre le produit**

3. **[SUIVI.md](SUIVI.md)** ✅
   - Tracking des tâches
   - Progression quotidienne
   - **→ À mettre à jour tous les jours**

**Workflow** : Développeur + IA → Code → Review Senior → Production

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités MVP Phase 1](#fonctionnalités-mvp-phase-1)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Configuration Supabase](#configuration-supabase)
- [Lancement du projet](#lancement-du-projet)
- [Structure du projet](#structure-du-projet)
- [Prochaines étapes](#prochaines-étapes)

---

## 🎯 Vue d'ensemble

### Objectifs Phase 1 (6 mois)

| Métrique | Baseline | Cible |
|----------|----------|-------|
| Turnover juniors | À définir | -15% |
| Temps recherche info | À définir | -30% |
| Contributions Wiki | 0 | 2/collaborateur/mois |
| Taux d'adoption (M+3) | 0% | 80% |

### Principes de conception

- ✅ **Simplicité** : MVP focalisé sur l'essentiel
- 🔒 **Confidentialité** : Chiffrement E2E pour tâches personnelles
- 🎮 **Gamification légère** : XP, niveaux, badges sans classement compétitif
- 🤝 **Collaboration** : Wiki partagé et validation par pairs

---

## ✨ Fonctionnalités MVP Phase 1

### 1. Gestion des tâches

- **Tâches personnelles** :
  - Notes et to-do privées
  - Chiffrement E2E (non visibles par les managers)
  - Mode offline
  - +5 XP par tâche terminée

- **Tâches professionnelles** :
  - Kanban et listes
  - Validation obligatoire par pair/manager
  - +30 XP si validée
  - +50 XP si livrée avant deadline

### 2. Wiki collaboratif

- Éditeur Markdown avec preview
- Recherche full-text (français)
- Tags obligatoires
- Versioning automatique
- +20 XP par note publiée (min 200 caractères)

### 3. Gamification

- **Système d'XP** :
  - Formule : `XP_requis(N) = 100 × N^1.3`
  - 20 niveaux maximum
  - Plafond quotidien : 500 XP/jour

- **Avatars 2D** :
  - 3 états : Neutre, Productif, Fatigué
  - 5 options de personnalisation

- **Badges** :
  - 10 badges de lancement
  - 4 raretés : Commun, Rare, Épique, Légendaire

### 4. Dashboard

- Vue personnelle (XP, niveau, tâches)
- Vue équipe **anonymisée** (XP collectif)
- Pas de classement individuel public

---

## 🛠 Stack technique

```
Frontend
├── Next.js 14 (App Router)
├── TypeScript
├── Tailwind CSS
├── shadcn/ui
├── Zustand (state)
└── TanStack Query (cache)

Backend
├── Supabase
│   ├── PostgreSQL
│   ├── Auth (SSO Google/Microsoft)
│   ├── Row Level Security (RLS)
│   └── Storage

Sécurité
├── E2E Encryption (libsodium)
└── Logs d'audit RGPD
```

---

## 📦 Installation

### Prérequis

- Node.js 18+ et npm
- Compte Supabase (gratuit : [supabase.com](https://supabase.com))
- Git

### 1. Cloner le projet

```bash
# Si vous lisez ce README, vous avez déjà le projet !
cd saas-cabinet-comptable
```

### 2. Installer les dépendances

```bash
npm install
```

---

## 🔧 Configuration Supabase

### Étape 1 : Créer un projet Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Cliquez sur **"New Project"**
3. Choisissez un nom, région, et mot de passe
4. Attendez que le projet soit prêt (2-3 min)

### Étape 2 : Récupérer les credentials

1. Dans votre projet, allez dans **Settings > API**
2. Copiez :
   - **Project URL** (commence par `https://xxx.supabase.co`)
   - **anon public key** (commence par `eyJ...`)

### Étape 3 : Configurer les variables d'environnement

Ouvrez le fichier `.env.local` et remplacez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
```

### Étape 4 : Exécuter les migrations SQL

1. Dans Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez tout le contenu de `supabase/migrations/001_initial_schema.sql`
4. Collez et exécutez (bouton **"Run"**)
5. Vérifiez qu'il n'y a pas d'erreurs

Cela créera :
- ✅ 7 tables (profiles, tasks, wiki_notes, badges, user_badges, xp_transactions, audit_logs)
- ✅ 3 fonctions (calcul XP et niveaux)
- ✅ 10 badges initiaux
- ✅ Row Level Security (RLS)

### Étape 5 : Configurer l'authentification

1. Dans Supabase, allez dans **Authentication > Providers**
2. Activez **Email** (activé par défaut)
3. *Optionnel* : Activez **Google** ou **Microsoft** :
   - Suivez les instructions pour obtenir Client ID et Secret
   - Ajoutez les redirect URLs

---

## 🚀 Lancement du projet

### Mode développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build de production

```bash
npm run build
npm start
```

### Linter

```bash
npm run lint
```

---

## 📁 Structure du projet

```
saas-cabinet-comptable/
├── app/                          # Routes Next.js 14 (App Router)
│   ├── (auth)/                   # Groupe de routes auth
│   │   ├── login/                # Page de connexion
│   │   └── register/             # Page d'inscription
│   ├── (dashboard)/              # Groupe de routes dashboard (protégées)
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── tasks/                # Gestion des tâches
│   │   ├── wiki/                 # Wiki collaboratif
│   │   └── profile/              # Profil utilisateur
│   ├── api/                      # API Routes
│   ├── layout.tsx                # Layout racine
│   └── page.tsx                  # Page d'accueil
│
├── components/                   # Composants React
│   ├── ui/                       # Composants shadcn/ui
│   ├── dashboard/                # Composants du dashboard
│   ├── tasks/                    # Composants de gestion de tâches
│   ├── wiki/                     # Composants Wiki
│   ├── gamification/             # Composants de gamification
│   │   ├── xp-bar.tsx            # Barre de progression XP
│   │   ├── user-avatar-2d.tsx    # Avatar 2D
│   │   └── badge-card.tsx        # Carte de badge
│   └── layout/                   # Composants de layout
│
├── lib/                          # Utilitaires et helpers
│   ├── supabase/                 # Clients Supabase
│   │   ├── client.ts             # Client-side
│   │   ├── server.ts             # Server-side
│   │   └── middleware.ts         # Middleware
│   ├── stores/                   # Stores Zustand
│   │   ├── auth-store.ts         # Store d'authentification
│   │   └── gamification-store.ts # Store de gamification
│   ├── hooks/                    # React Hooks personnalisés
│   └── utils.ts                  # Fonctions utilitaires
│
├── types/                        # Définitions TypeScript
│   ├── database.types.ts         # Types de base de données
│   └── supabase.ts               # Types Supabase
│
├── supabase/                     # Configuration Supabase
│   └── migrations/               # Migrations SQL
│       └── 001_initial_schema.sql
│
├── .env.local                    # Variables d'environnement (ne pas commit)
├── .env.local.example            # Template de variables
├── middleware.ts                 # Middleware Next.js
├── tailwind.config.ts            # Config Tailwind CSS
├── next.config.ts                # Config Next.js
└── README.md                     # Ce fichier
```

---

## 🗺️ Prochaines étapes

### Phase 1 - Sprints 1-2 (Mois 1-2)

- [ ] Implémenter l'authentification complète (Google/Microsoft SSO)
- [ ] Créer les pages de connexion et inscription
- [ ] Implémenter le CRUD complet des tâches
- [ ] Créer le système de validation par pairs
- [ ] Tester avec 5 beta-testeurs internes

### Phase 1 - Sprints 3-4 (Mois 3-4)

- [ ] Implémenter le système d'XP complet
- [ ] Créer les avatars 2D avec états
- [ ] Implémenter les 10 badges de lancement
- [ ] Créer le dashboard principal
- [ ] Beta fermée avec 20 utilisateurs

### Phase 1 - Sprints 5-6 (Mois 5-6)

- [ ] Implémenter le Wiki collaboratif
- [ ] Ajouter la recherche full-text
- [ ] Créer le dashboard équipe anonymisé
- [ ] Bug fixes et optimisations
- [ ] Déploiement production

### Phase 2 (Mois 7-12) - Hors scope MVP

- [ ] Avatar 3D interactif (si ROI prouvé)
- [ ] Application mobile native
- [ ] Intégrations comptables (logiciels métier)
- [ ] Lobby temps réel
- [ ] Streaks avancés

---

## 🔐 Sécurité & RGPD

### Conformité

- ✅ Chiffrement E2E pour données personnelles
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Logs d'audit immuables
- ✅ Export RGPD via `/api/me/export`
- ✅ Suppression : soft delete 30j puis hard delete

### Variables sensibles

⚠️ **Ne jamais commit** :
- `.env.local`
- Clés API Supabase service role
- Clés de chiffrement

---

## 📚 Ressources

### Documentation

- [Next.js 14](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

### Support

- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

## 🎉 Contributeurs

Créé avec ❤️ pour révolutionner l'expérience en cabinet comptable.

**Phase 1 MVP** - Janvier 2026
