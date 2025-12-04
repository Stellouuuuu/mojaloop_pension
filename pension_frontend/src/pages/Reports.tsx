import { useState } from "react";
import {
  Search,
  Download,
  FileText,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  ChevronRight,
  Calendar,
  PieChart,
  BarChart3,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ErrorRecord {
  id: string;
  pensionerId: string;
  pensionerName: string;
  dfsp: string;
  errorCode: string;
  errorMessage: string;
  amount: number;
  timestamp: string;
  retryCount: number;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
  details: string;
}

const errorRecords: ErrorRecord[] = [
  {
    id: "1",
    pensionerId: "BN-2024-01234",
    pensionerName: "Akpaki Houessou",
    dfsp: "MTN Mobile",
    errorCode: "PAYEE_FSP_REJECTED",
    errorMessage: "Numéro de téléphone invalide ou inactif",
    amount: 95000,
    timestamp: "2024-03-19T14:32:00",
    retryCount: 2,
  },
  {
    id: "2",
    pensionerId: "BN-2024-02567",
    pensionerName: "Yaovi Agossou",
    dfsp: "Orange Money",
    errorCode: "INSUFFICIENT_FUNDS",
    errorMessage: "Solde insuffisant sur le compte Trésor",
    amount: 88000,
    timestamp: "2024-03-19T14:28:00",
    retryCount: 1,
  },
  {
    id: "3",
    pensionerId: "BN-2024-00789",
    pensionerName: "Afi Mensah",
    dfsp: "Ecobank",
    errorCode: "IBAN_INVALID",
    errorMessage: "Format IBAN incorrect",
    amount: 112000,
    timestamp: "2024-03-19T14:15:00",
    retryCount: 0,
  },
  {
    id: "4",
    pensionerId: "BN-2024-03456",
    pensionerName: "Koku Dossou",
    dfsp: "MTN Mobile",
    errorCode: "TIMEOUT",
    errorMessage: "Délai de réponse dépassé du DFSP",
    amount: 76000,
    timestamp: "2024-03-19T13:45:00",
    retryCount: 3,
  },
];

const auditLogs: AuditLog[] = [
  {
    id: "1",
    action: "PAYMENT_LAUNCHED",
    user: "Agent Trésor A",
    target: "Lot #2847",
    timestamp: "2024-03-19T14:00:00",
    details: "Lancement de 1,247 paiements pour un total de 98.5M XOF",
  },
  {
    id: "2",
    action: "PENSIONER_APPROVED",
    user: "Superviseur B",
    target: "BN-2024-03456",
    timestamp: "2024-03-19T13:45:00",
    details: "Approbation du dossier de Kodjo Amoussou",
  },
  {
    id: "3",
    action: "RETRY_PAYMENT",
    user: "Agent Trésor A",
    target: "BN-2024-01234",
    timestamp: "2024-03-19T13:30:00",
    details: "Tentative de réessai du paiement (2/3)",
  },
  {
    id: "4",
    action: "PENSIONER_REJECTED",
    user: "Superviseur B",
    target: "BN-2024-02345",
    timestamp: "2024-03-19T12:15:00",
    details: "Rejet pour documents incomplets",
  },
  {
    id: "5",
    action: "REPORT_EXPORTED",
    user: "Admin C",
    target: "Rapport Mars 2024",
    timestamp: "2024-03-19T11:00:00",
    details: "Export PDF du rapport mensuel",
  },
];

const dfspErrorStats = [
  { dfsp: "MTN Mobile", count: 8, percentage: 35 },
  { dfsp: "Orange Money", count: 6, percentage: 26 },
  { dfsp: "Ecobank", count: 5, percentage: 22 },
  { dfsp: "Bank of Africa", count: 4, percentage: 17 },
];

export default function Reports() {
  const [selectedError, setSelectedError] = useState<ErrorRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Erreurs & Rapports</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des erreurs et génération de rapports
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="march">
            <SelectTrigger className="w-40 bg-card">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="march">Mars 2024</SelectItem>
              <SelectItem value="february">Février 2024</SelectItem>
              <SelectItem value="january">Janvier 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Exporter Rapport
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="errors" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="errors" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Erreurs
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Rapports
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileText className="w-4 h-4" />
            Audit
          </TabsTrigger>
        </TabsList>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-6">
          {/* Error KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{errorRecords.length}</p>
                  <p className="text-sm text-muted-foreground">Erreurs ce mois</p>
                </div>
              </div>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-sm text-muted-foreground">Réessais en cours</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">87%</p>
                  <p className="text-sm text-muted-foreground">Taux résolution</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Distribution par DFSP</h3>
                <PieChart className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {dfspErrorStats.map((stat) => (
                  <div key={stat.dfsp} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{stat.dfsp}</span>
                      <span className="text-muted-foreground">{stat.count} erreurs ({stat.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive/70 rounded-full transition-all duration-500"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Codes Erreur Fréquents</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">PAYEE_FSP_REJECTED</span>
                  <span className="text-sm font-medium text-destructive">8</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">TIMEOUT</span>
                  <span className="text-sm font-medium text-destructive">5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">IBAN_INVALID</span>
                  <span className="text-sm font-medium text-destructive">4</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">INSUFFICIENT_FUNDS</span>
                  <span className="text-sm font-medium text-destructive">2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Table */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Erreurs Récentes</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher..." className="pl-10 w-64" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-36 bg-card">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Tous DFSP</SelectItem>
                    <SelectItem value="mtn">MTN Mobile</SelectItem>
                    <SelectItem value="orange">Orange Money</SelectItem>
                    <SelectItem value="ecobank">Ecobank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pensionné</th>
                    <th>DFSP</th>
                    <th>Code Erreur</th>
                    <th>Montant</th>
                    <th>Réessais</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {errorRecords.map((error) => (
                    <tr key={error.id}>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">{error.pensionerName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {error.pensionerId}
                          </p>
                        </div>
                      </td>
                      <td className="text-muted-foreground">{error.dfsp}</td>
                      <td>
                        <span className="status-badge status-error">{error.errorCode}</span>
                      </td>
                      <td className="font-semibold text-foreground">
                        {error.amount.toLocaleString()} XOF
                      </td>
                      <td>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            error.retryCount >= 3 ? "text-destructive" : "text-muted-foreground"
                          )}
                        >
                          {error.retryCount}/3
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1"
                            disabled={error.retryCount >= 3}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Réessayer
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={() => {
                              setSelectedError(error);
                              setIsDetailOpen(true);
                            }}
                          >
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Rapport Mensuel</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Rapport Mars 2024</p>
                      <p className="text-xs text-muted-foreground">Généré le 19/03/2024</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Rapport Février 2024</p>
                      <p className="text-xs text-muted-foreground">Généré le 01/03/2024</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Export de Données</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <FileText className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Liste des Pensionnés</p>
                    <p className="text-xs text-muted-foreground">Format Excel (.xlsx)</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <FileText className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Historique des Paiements</p>
                    <p className="text-xs text-muted-foreground">Format CSV</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <FileText className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Journal des Erreurs</p>
                    <p className="text-xs text-muted-foreground">Format PDF signé</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Journal d'Audit</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher action, utilisateur..." className="pl-10 w-80" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Utilisateur</th>
                    <th>Cible</th>
                    <th>Détails</th>
                    <th>Horodatage</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span
                          className={cn(
                            "status-badge",
                            log.action.includes("REJECTED") || log.action.includes("ERROR")
                              ? "status-error"
                              : log.action.includes("APPROVED") || log.action.includes("SUCCESS")
                              ? "status-success"
                              : "status-pending"
                          )}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="text-foreground">{log.user}</td>
                      <td className="font-mono text-sm text-muted-foreground">{log.target}</td>
                      <td className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Error Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Détail de l'Erreur
            </DialogTitle>
            <DialogDescription>
              {selectedError?.pensionerId}
            </DialogDescription>
          </DialogHeader>

          {selectedError && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bénéficiaire</p>
                  <p className="font-medium text-foreground">{selectedError.pensionerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-medium text-foreground">
                    {selectedError.amount.toLocaleString()} XOF
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">DFSP</p>
                <p className="font-medium text-foreground">{selectedError.dfsp}</p>
              </div>
              <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-sm font-mono text-destructive">{selectedError.errorCode}</p>
                <p className="text-sm text-foreground mt-1">{selectedError.errorMessage}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tentatives: {selectedError.retryCount}/3
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Notifier SMS
            </Button>
            <Button
              className="gap-2"
              disabled={selectedError?.retryCount ? selectedError.retryCount >= 3 : false}
            >
              <RotateCcw className="w-4 h-4" />
              Réessayer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
