import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Search,
  Download,
  Filter,
  Calendar as CalendarIcon,
  User,
  FileEdit,
  UserPlus,
  UserMinus,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActionType = "creation" | "modification" | "suspension" | "reactivation" | "paiement" | "validation" | "rejet";
type PeriodFilter = "today" | "week" | "month" | "custom";

interface AuditEntry {
  id: string;
  timestamp: Date;
  agentName: string;
  agentId: string;
  pensionerId: string;
  pensionerName: string;
  actionType: ActionType;
  description: string;
  details?: string;
  ipAddress: string;
}

const actionTypeConfig: Record<ActionType, { label: string; icon: React.ElementType; color: string }> = {
  creation: { label: "Création", icon: UserPlus, color: "bg-success/10 text-success border-success/20" },
  modification: { label: "Modification", icon: FileEdit, color: "bg-primary/10 text-primary border-primary/20" },
  suspension: { label: "Suspension", icon: UserMinus, color: "bg-destructive/10 text-destructive border-destructive/20" },
  reactivation: { label: "Réactivation", icon: CheckCircle, color: "bg-success/10 text-success border-success/20" },
  paiement: { label: "Paiement", icon: CreditCard, color: "bg-primary/10 text-primary border-primary/20" },
  validation: { label: "Validation", icon: CheckCircle, color: "bg-success/10 text-success border-success/20" },
  rejet: { label: "Rejet", icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

// Mock data
const mockAuditEntries: AuditEntry[] = [
  {
    id: "AUD-001",
    timestamp: new Date(2025, 10, 26, 14, 32),
    agentName: "Marie Dupont",
    agentId: "AGT-001",
    pensionerId: "PEN-1234",
    pensionerName: "Jean Martin",
    actionType: "validation",
    description: "Dossier validé et approuvé pour paiement",
    details: "Vérification des documents complète. RIB vérifié.",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-002",
    timestamp: new Date(2025, 10, 26, 11, 15),
    agentName: "Pierre Durand",
    agentId: "AGT-002",
    pensionerId: "PEN-5678",
    pensionerName: "Marie Lefebvre",
    actionType: "modification",
    description: "Mise à jour des coordonnées bancaires",
    details: "Ancien RIB: FR76****1234 → Nouveau RIB: FR76****5678",
    ipAddress: "192.168.1.32",
  },
  {
    id: "AUD-003",
    timestamp: new Date(2025, 10, 26, 9, 45),
    agentName: "Sophie Bernard",
    agentId: "AGT-003",
    pensionerId: "PEN-9012",
    pensionerName: "Paul Moreau",
    actionType: "suspension",
    description: "Suspension temporaire du compte",
    details: "Motif: Documents d'identité expirés. En attente de renouvellement.",
    ipAddress: "192.168.1.28",
  },
  {
    id: "AUD-004",
    timestamp: new Date(2025, 10, 25, 16, 20),
    agentName: "Marie Dupont",
    agentId: "AGT-001",
    pensionerId: "PEN-3456",
    pensionerName: "Claire Petit",
    actionType: "creation",
    description: "Création d'un nouveau dossier pensionné",
    details: "Dossier initial créé. En attente de validation des documents.",
    ipAddress: "192.168.1.45",
  },
  {
    id: "AUD-005",
    timestamp: new Date(2025, 10, 25, 14, 10),
    agentName: "Lucas Martin",
    agentId: "AGT-004",
    pensionerId: "PEN-7890",
    pensionerName: "François Dubois",
    actionType: "paiement",
    description: "Paiement mensuel initié",
    details: "Montant: 1,250.00 € - Méthode: Virement bancaire",
    ipAddress: "192.168.1.51",
  },
  {
    id: "AUD-006",
    timestamp: new Date(2025, 10, 25, 10, 30),
    agentName: "Pierre Durand",
    agentId: "AGT-002",
    pensionerId: "PEN-2345",
    pensionerName: "Anne Richard",
    actionType: "rejet",
    description: "Dossier rejeté - documents incomplets",
    details: "Manquant: Certificat de vie, Justificatif de domicile",
    ipAddress: "192.168.1.32",
  },
  {
    id: "AUD-007",
    timestamp: new Date(2025, 10, 24, 15, 45),
    agentName: "Sophie Bernard",
    agentId: "AGT-003",
    pensionerId: "PEN-6789",
    pensionerName: "Michel Laurent",
    actionType: "reactivation",
    description: "Compte réactivé après mise à jour",
    details: "Documents renouvelés reçus et validés.",
    ipAddress: "192.168.1.28",
  },
  {
    id: "AUD-008",
    timestamp: new Date(2025, 10, 24, 11, 20),
    agentName: "Marie Dupont",
    agentId: "AGT-001",
    pensionerId: "PEN-0123",
    pensionerName: "Isabelle Thomas",
    actionType: "modification",
    description: "Changement d'adresse postale",
    details: "Nouvelle adresse: 15 Rue des Lilas, 75020 Paris",
    ipAddress: "192.168.1.45",
  },
];

export default function PensionersHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("week");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showFilters, setShowFilters] = useState(false);

  // Filter entries based on all criteria
  const filteredEntries = mockAuditEntries.filter((entry) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      entry.agentName.toLowerCase().includes(searchLower) ||
      entry.pensionerId.toLowerCase().includes(searchLower) ||
      entry.pensionerName.toLowerCase().includes(searchLower) ||
      entry.description.toLowerCase().includes(searchLower);

    // Action type filter
    const matchesActionType = actionTypeFilter === "all" || entry.actionType === actionTypeFilter;

    // Agent filter
    const matchesAgent = agentFilter === "all" || entry.agentId === agentFilter;

    // Period filter
    const now = new Date();
    let matchesPeriod = true;
    if (periodFilter === "today") {
      matchesPeriod = entry.timestamp.toDateString() === now.toDateString();
    } else if (periodFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesPeriod = entry.timestamp >= weekAgo;
    } else if (periodFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesPeriod = entry.timestamp >= monthAgo;
    } else if (periodFilter === "custom" && dateRange.from) {
      matchesPeriod = entry.timestamp >= dateRange.from && (!dateRange.to || entry.timestamp <= dateRange.to);
    }

    return matchesSearch && matchesActionType && matchesAgent && matchesPeriod;
  });

  // Get unique agents for filter
  const uniqueAgents = Array.from(new Set(mockAuditEntries.map((e) => JSON.stringify({ id: e.agentId, name: e.agentName })))).map((s) => JSON.parse(s));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historique des Opérations</h1>
        <p className="text-muted-foreground">Journal d'audit global des actions et des changements de statut.</p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search and Quick Period Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par agent, ID pensionné, ou action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={showFilters ? "secondary" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Quick Period Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center mr-2">Période :</span>
            {[
              { value: "today", label: "Aujourd'hui" },
              { value: "week", label: "Cette semaine" },
              { value: "month", label: "Ce mois" },
              { value: "custom", label: "Personnalisée" },
            ].map((period) => (
              <Button
                key={period.value}
                variant={periodFilter === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriodFilter(period.value as PeriodFilter)}
              >
                {period.value === "custom" && <CalendarIcon className="h-4 w-4 mr-1" />}
                {period.label}
              </Button>
            ))}

            {periodFilter === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2">
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: fr })} - {format(dateRange.to, "dd/MM/yyyy", { locale: fr })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: fr })
                      )
                    ) : (
                      "Sélectionner dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type d'action</label>
                <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les actions</SelectItem>
                    {Object.entries(actionTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Agent</label>
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les agents</SelectItem>
                    {uniqueAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {agent.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActionTypeFilter("all");
                    setAgentFilter("all");
                    setPeriodFilter("week");
                    setDateRange({});
                    setSearchQuery("");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredEntries.length} entrée{filteredEntries.length > 1 ? "s" : ""} trouvée{filteredEntries.length > 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          {actionTypeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {actionTypeConfig[actionTypeFilter as ActionType]?.label}
              <button onClick={() => setActionTypeFilter("all")} className="ml-1 hover:text-destructive">
                ×
              </button>
            </Badge>
          )}
          {agentFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {uniqueAgents.find((a) => a.id === agentFilter)?.name}
              <button onClick={() => setAgentFilter("all")} className="ml-1 hover:text-destructive">
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Audit Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Date & Heure</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Pensionné</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
                  <TableHead className="w-[80px]">Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Clock className="h-8 w-8" />
                        <p>Aucune entrée trouvée pour les critères sélectionnés</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => {
                    const config = actionTypeConfig[entry.actionType];
                    const ActionIcon = config.icon;

                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{format(entry.timestamp, "dd MMM yyyy", { locale: fr })}</div>
                            <div className="text-xs text-muted-foreground">{format(entry.timestamp, "HH:mm", { locale: fr })}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{entry.agentName}</div>
                              <div className="text-xs text-muted-foreground">{entry.agentId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{entry.pensionerName}</div>
                            <div className="text-xs text-muted-foreground">{entry.pensionerId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1", config.color)}>
                            <ActionIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-[300px]">
                          <p className="truncate text-sm">{entry.description}</p>
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-semibold mb-1">Détails de l'opération</h4>
                                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                                </div>
                                {entry.details && (
                                  <div>
                                    <h5 className="text-sm font-medium mb-1">Informations complémentaires</h5>
                                    <p className="text-sm text-muted-foreground">{entry.details}</p>
                                  </div>
                                )}
                                <div className="pt-2 border-t">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>ID: {entry.id}</span>
                                    <span>IP: {entry.ipAddress}</span>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
