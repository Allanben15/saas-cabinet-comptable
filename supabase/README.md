# Configuration Supabase pour Cabinet SaaS

## Option 1 : Supabase Cloud (Recommandé pour démarrer)

### Étape 1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Cliquez sur "New Project"
4. Choisissez un nom (ex: `cabinet-saas-dev`)
5. Définissez un mot de passe pour la base de données
6. Sélectionnez la région la plus proche (ex: `eu-west-1` pour la France)
7. Attendez ~2 minutes que le projet soit créé

### Étape 2 : Récupérer les clés API

1. Dans votre projet Supabase, allez dans **Settings > API**
2. Copiez :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (gardez-le secret !)

### Étape 3 : Mettre à jour .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
```

### Étape 4 : Exécuter le schéma SQL

1. Dans Supabase Dashboard, allez dans **SQL Editor**
2. Cliquez sur "New Query"
3. Copiez-collez le contenu de `migrations/001_initial_schema.sql`
4. Cliquez sur "Run"

### Étape 5 : Configurer l'authentification

1. Allez dans **Authentication > URL Configuration**
2. Ajoutez `http://localhost:3000/auth/callback` dans "Redirect URLs"

### Étape 6 : (Optionnel) Désactiver la confirmation email pour le dev

1. Allez dans **Authentication > Providers > Email**
2. Désactivez "Confirm email"

---

## Option 2 : Supabase Local (Nécessite Docker)

Si Docker est installé sur votre machine :

```bash
# Installer Supabase CLI
npm install -g supabase

# Démarrer Supabase local
supabase start

# Appliquer les migrations
supabase db push
```

Les clés locales seront affichées après `supabase start`.

---

## Structure des tables

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (XP, niveau, avatar) |
| `tasks` | Tâches personnelles et professionnelles |
| `wiki_notes` | Notes Wiki collaboratives |
| `badges` | Définition des badges |
| `user_badges` | Badges débloqués par utilisateur |
| `xp_transactions` | Historique des gains d'XP |
| `audit_logs` | Logs RGPD |

## Row Level Security (RLS)

Toutes les tables ont des politiques RLS activées :
- Les utilisateurs ne voient que leurs propres données
- Les notes Wiki publiées sont visibles par tous
- Les profils sont visibles par tous les utilisateurs authentifiés
