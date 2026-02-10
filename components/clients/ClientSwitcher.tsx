'use client'

/**
 * ClientSwitcher
 * Composant de sélection de client avec recherche, favoris et récents
 * Intégré dans la sidebar ou comme popover
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Building2,
  ChevronDown,
  Search,
  Star,
  StarOff,
  Clock,
  X,
  Check,
  Plus,
  Globe,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useClientContext,
  useActiveClientName,
  type Client,
  type ClientWithRole,
} from '@/lib/stores/client-context'

// Couleurs par type de client
const CLIENT_TYPE_COLORS: Record<Client['type'], string> = {
  TPE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PME: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ETI: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  GE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

// Bouton trigger pour ouvrir le switcher
export function ClientSwitcherTrigger() {
  const { openSwitcher, activeClient, isLoading } = useClientContext()
  const clientName = useActiveClientName()

  return (
    <button
      onClick={openSwitcher}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3 rounded-xl',
        'bg-secondary/50 hover:bg-secondary/80 transition-all duration-200',
        'border border-border/50 hover:border-border'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg',
          activeClient?.color ? '' : 'bg-gradient-to-br from-violet-500 to-purple-600'
        )}
        style={activeClient?.color ? { backgroundColor: activeClient.color } : undefined}
      >
        {activeClient ? (
          <Building2 className="h-5 w-5 text-white" />
        ) : (
          <Globe className="h-5 w-5 text-white" />
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium truncate text-foreground">
          {isLoading ? 'Chargement...' : clientName}
        </p>
        <p className="text-xs text-muted-foreground">
          {activeClient ? activeClient.type : 'Tous les clients'}
        </p>
      </div>

      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </button>
  )
}

// Modal de sélection de client
export function ClientSwitcherModal() {
  const {
    isSwitcherOpen,
    closeSwitcher,
    activeClient,
    setActiveClient,
    allClients,
    favoriteClients,
    recentClients,
    toggleFavorite,
    loadAllClients,
    isLoading,
  } = useClientContext()

  const [searchQuery, setSearchQuery] = useState('')

  // Charger les clients à l'ouverture
  useEffect(() => {
    if (isSwitcherOpen) {
      loadAllClients()
    }
  }, [isSwitcherOpen, loadAllClients])

  // Filtrer les clients
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return allClients

    const query = searchQuery.toLowerCase()
    return allClients.filter(
      client =>
        client.name.toLowerCase().includes(query) ||
        client.siren?.includes(query)
    )
  }, [allClients, searchQuery])

  const handleSelect = async (client: Client | null) => {
    await setActiveClient(client)
  }

  return (
    <Dialog open={isSwitcherOpen} onOpenChange={closeSwitcher}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Sélectionner un client
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Option "Tous les clients" */}
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors',
              !activeClient
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-muted'
            )}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">Tous les clients</span>
            {!activeClient && <Check className="h-4 w-4 text-primary ml-auto" />}
          </button>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Liste des clients */}
          {!isLoading && (
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {/* Favoris */}
              {favoriteClients.length > 0 && !searchQuery && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Favoris
                  </p>
                  {favoriteClients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      isActive={activeClient?.id === client.id}
                      onSelect={handleSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}

              {/* Récents */}
              {recentClients.length > 0 && !searchQuery && favoriteClients.length === 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Récents
                  </p>
                  {recentClients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      isActive={activeClient?.id === client.id}
                      onSelect={handleSelect}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}

              {/* Tous les clients ou résultats de recherche */}
              <div className="space-y-1">
                {(searchQuery || (favoriteClients.length === 0 && recentClients.length === 0)) && (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    {searchQuery ? `Résultats (${filteredClients.length})` : 'Tous les clients'}
                  </p>
                )}

                {filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>{searchQuery ? 'Aucun client trouvé' : 'Aucun client'}</p>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      isActive={activeClient?.id === client.id}
                      onSelect={handleSelect}
                      onToggleFavorite={toggleFavorite}
                      showFavorite={searchQuery !== ''}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Bouton nouveau client */}
          <div className="pt-2 border-t">
            <Button variant="outline" className="w-full" onClick={closeSwitcher}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Ligne d'un client
function ClientRow({
  client,
  isActive,
  onSelect,
  onToggleFavorite,
  showFavorite = true,
}: {
  client: Client | ClientWithRole
  isActive: boolean
  onSelect: (client: Client) => void
  onToggleFavorite: (id: string) => void
  showFavorite?: boolean
}) {
  const isFavorite = 'isFavorite' in client ? client.isFavorite : false

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all group cursor-pointer',
        isActive
          ? 'bg-primary/10 border border-primary/30'
          : 'hover:bg-muted'
      )}
      onClick={() => onSelect(client)}
    >
      {/* Couleur / Avatar */}
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
        style={{ backgroundColor: client.color || '#6366f1' }}
      >
        <Building2 className="h-4 w-4 text-white" />
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{client.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {client.siren && <span>{client.siren}</span>}
          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', CLIENT_TYPE_COLORS[client.type])}>
            {client.type}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {showFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(client.id)
            }}
            className={cn(
              'p-1 rounded transition-colors',
              isFavorite
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-muted-foreground hover:text-amber-500 opacity-0 group-hover:opacity-100'
            )}
          >
            {isFavorite ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
          </button>
        )}

        {isActive && <Check className="h-4 w-4 text-primary" />}
      </div>
    </div>
  )
}

// Composant complet (Trigger + Modal)
export function ClientSwitcher() {
  return (
    <>
      <ClientSwitcherTrigger />
      <ClientSwitcherModal />
    </>
  )
}

export default ClientSwitcher
