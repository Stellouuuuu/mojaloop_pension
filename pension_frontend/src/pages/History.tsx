import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Ban,
  Clock,
  Banknote,
  AlertTriangle,
  Eye,
  Search,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IndividualTransaction {
  transactionId: string;
  batchId: string;
  pensionerId: string;
  pensionerName: string;
  recipientName: string;
  recipientType: "pensioner" | "third-party";
  amount: number;
  finalDate: string;
  finalStatus: "success" | "failed" | "cancelled" | "pending";
  dfsp: string;
  paymentAccount: string;
  transferId?: string;
  errorCode?: string;
  errorMessage?: string;
  statusHistory?: { status: string; timestamp: string; detail: string }[];
}

// Mock individual transactions
const mockIndividualTransactions: IndividualTransaction[] = [
  {
    transactionId: "TX-2025-11-98765",
    batchId: "BN-PAIE-NOV-2025",
    pensionerId: "BN-2024-00145",
    pensionerName: "Kokou Mensah",
    recipientName: "Sophie Mensah",
    recipientType: "third-party",
    amount: 85000,
    finalDate: "2025-11-15 10:31:12",
    finalStatus: "success",
    dfsp: "Orange Money",
    paymentAccount: "+22997000001",
    transferId: "MOJAL-145-20251115-103112",
    statusHistory: [
      { status: "Soumis à Mojaloop", timestamp: "2025-11-15 10:30:00", detail: "Transaction initiée" },
      { status: "En attente", timestamp: "2025-11-15 10:30:45", detail: "Attente de confirmation du DFSP" },
      { status: "Réussi", timestamp: "2025-11-15 10:31:12", detail: "Paiement confirmé par Orange Money" },
    ],
  },
  {
    transactionId: "TX-2025-11-98766",
    batchId: "BN-PAIE-NOV-2025",
    pensionerId: "BN-2024-00892",
    pensionerName: "Adjovi Dossou",
    recipientName: "Adjovi Dossou",
    recipientType: "pensioner",
    amount: 120000,
    finalDate: "2025-11-15 10:31:45",
    finalStatus: "failed",
    dfsp: "Ecobank",
    paymentAccount: "BJ020001010100000000123",
    errorCode: "E001",
    errorMessage: "IBAN inconnu - Le compte bancaire n'existe pas dans le système Ecobank",
    statusHistory: [
      { status: "Soumis à Mojaloop", timestamp: "2025-11-15 10:30:00", detail: "Transaction initiée" },
      { status: "En attente", timestamp: "2025-11-15 10:31:00", detail: "Attente de confirmation du DFSP" },
      { status: "Rejeté", timestamp: "2025-11-15 10:31:45", detail: "Erreur E001: IBAN inconnu" },
    ],
  },
  {
    transactionId: "TX-2025-11-98767",
    batchId: "BN-PAIE-NOV-2025",
    pensionerId: "BN-2024-00567",
    pensionerName: "Sossou Agbangla",
    recipientName: "Marie Agbangla",
    recipientType: "third-party",
    amount: 75000,
    finalDate: "2025-11-15 10:32:03",
    finalStatus: "success",
    dfsp: "MTN Mobile",
    paymentAccount: "+22996000002",
    transferId: "MOJAL-567-20251115-103203",
    statusHistory: [
      { status: "Soumis à Mojaloop", timestamp: "2025-11-15 10:30:00", detail: "Transaction initiée" },
      { status: "En attente", timestamp: "2025-11-15 10:31:30", detail: "Attente de confirmation du DFSP" },
      { status: "Réussi", timestamp: "2025-11-15 10:32:03", detail: "Paiement confirmé par MTN Mobile" },
    ],
  },
  {
    transactionId: "TX-2025-11-98768",
    batchId: "BN-PAIE-NOV-2025",
    pensionerId: "BN-2024-01456",
    pensionerName: "Yawa Tokpanou",
    recipientName: "Yawa Tokpanou",
    recipientType: "pensioner",
    amount: 110000,
    finalDate: "2025-11-15 10:32:45",
    finalStatus: "success",
    dfsp: "Orange Money",
    paymentAccount: "+22997000003",
    transferId: "MOJAL-1456-20251115-103245",
  },
  {
    transactionId: "TX-2025-11-98769",
    batchId: "BN-PAIE-NOV-2025",
    pensionerId: "BN-2024-00234",
    pensionerName: "Koffi Ahouansou",
    recipientName: "Jean Ahouansou",
    recipientType: "third-party",
    amount: 95000,
    finalDate: "2025-11-15 10:33:12",
    finalStatus: "failed",
    dfsp: "Bank of Africa",
    paymentAccount: "BJ020002020200000000456",
    errorCode: "E005",
    errorMessage: "Compte Mobile Inactif - Le compte n'a pas été utilisé depuis 180 jours",
    statusHistory: [
      { status: "Soumis à Mojaloop", timestamp: "2025-11-15 10:30:00", detail: "Transaction initiée" },
      { status: "En attente", timestamp: "2025-11-15 10:32:30", detail: "Attente de confirmation du DFSP" },
      { status: "Rejeté", timestamp: "2025-11-15 10:33:12", detail: "Erreur E005: Compte Mobile Inactif" },
    ],
  },
  {
    transactionId: "TX-2025-10-87654",
    batchId: "BN-PAIE-OCT-2025",
    pensionerId: "BN-2024-01789",
    pensionerName: "Akouavi Gbedo",
    recipientName: "Akouavi Gbedo",
    recipientType: "pensioner",
    amount: 88000,
    finalDate: "2025-10-15 14:21:30",
    finalStatus: "success",
    dfsp: "MTN Mobile",
    paymentAccount: "+22996000004",
    transferId: "MOJAL-1789-20251015-142130",
  },
  {
    transactionId: "TX-2025-10-87655",
    batchId: "BN-PAIE-OCT-2025",
    pensionerId: "BN-2024-02345",
    pensionerName: "Codjo Hounkpatin",
    recipientName: "Codjo Hounkpatin",
    recipientType: "pensioner",
    amount: 102000,
    finalDate: "2025-10-15 14:22:15",
    finalStatus: "success",
    dfsp: "Orange Money",
    paymentAccount: "+22997000005",
    transferId: "MOJAL-2345-20251015-142215",
  },
  {
    transactionId: "TX-2025-10-87656",
    batchId: "BN-PAIE-OCT-2025",
    pensionerId: "BN-2024-00678",
    pensionerName: "Ablavi Sossou",
    recipientName: "Ablavi Sossou",
    recipientType: "pensioner",
    amount: 78000,
    finalDate: "2025-10-15 14:23:05",
    finalStatus: "cancelled",
    dfsp: "Ecobank",
    paymentAccount: "BJ020001010100000000789",
    errorCode: "E006",
    errorMessage: "Plafond atteint - Le montant dépasse la limite journalière autorisée",
  },
];

const transactionStatusConfig = {
  success: { icon: CheckCircle, label: "Réussi", className: "text-primary bg-primary/10" },
  failed: { icon: XCircle, label: "Rejeté", className: "text-destructive bg-destructive/10" },
  cancelled: { icon: Ban, label: "Annulé", className: "text-muted-foreground bg-muted" },
  pending: { icon: Clock, label: "En Attente", className: "text-accent-foreground bg-accent/20" },
};

export default function History() {
  const [transactions] = useState<IndividualTransaction[]>(mockIndividualTransactions);
  const [selectedIndividualTransaction, setSelectedIndividualTransaction] = useState<IndividualTransaction | null>(null);
  const [transactionSearchQuery, setTransactionSearchQuery] = useState("");
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<string>("all");
  const [transactionRecipientFilter, setTransactionRecipientFilter] = useState<string>("all");
  const [transactionPeriodFilter, setTransactionPeriodFilter] = useState<string>("all");

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = txn.transactionId.toLowerCase().includes(transactionSearchQuery.toLowerCase()) ||
      txn.pensionerName.toLowerCase().includes(transactionSearchQuery.toLowerCase()) ||
      txn.recipientName.toLowerCase().includes(transactionSearchQuery.toLowerCase()) ||
      txn.batchId.toLowerCase().includes(transactionSearchQuery.toLowerCase());
    const matchesStatus = transactionStatusFilter === "all" || txn.finalStatus === transactionStatusFilter;
    const matchesRecipient = transactionRecipientFilter === "all" || txn.recipientType === transactionRecipientFilter;
    const matchesPeriod = transactionPeriodFilter === "all" || txn.batchId.includes(transactionPeriodFilter);
    return matchesSearch && matchesStatus && matchesRecipient && matchesPeriod;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historique Des Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Suivi des historiques des transactions de paiement des pensionnés.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Journal des Transactions Individuelles</h2>
            <p className="text-sm text-muted-foreground mt-1">Historique détaillé de chaque paiement traité</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher (ID, nom, lot...)"
              value={transactionSearchQuery}
              onChange={(e) => setTransactionSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={transactionPeriodFilter} onValueChange={setTransactionPeriodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes périodes</SelectItem>
              <SelectItem value="NOV-2025">Novembre 2025</SelectItem>
              <SelectItem value="OCT-2025">Octobre 2025</SelectItem>
              <SelectItem value="SEPT-2025">Septembre 2025</SelectItem>
            </SelectContent>
          </Select>
          <Select value={transactionStatusFilter} onValueChange={setTransactionStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="success">Réussi</SelectItem>
              <SelectItem value="failed">Rejeté</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
              <SelectItem value="pending">En Attente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={transactionRecipientFilter} onValueChange={setTransactionRecipientFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Destinataire" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous destinataires</SelectItem>
              <SelectItem value="pensioner">Pensionnés</SelectItem>
              <SelectItem value="third-party">Tiers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ID Transaction</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ID du Lot</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Bénéficiaire</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Destinataire</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date Finale</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Statut Final</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => {
                const StatusIcon = transactionStatusConfig[txn.finalStatus].icon;
                return (
                  <tr key={txn.transactionId} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-foreground">{txn.transactionId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">{txn.batchId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{txn.pensionerName}</p>
                        <p className="text-xs text-muted-foreground">{txn.pensionerId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">{txn.recipientName}</span>
                        {txn.recipientType === "third-party" && (
                          <Badge variant="outline" className="text-xs">
                            👥 Tiers
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-foreground">
                        {txn.amount.toLocaleString()} XOF
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">{txn.finalDate}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn("w-4 h-4", transactionStatusConfig[txn.finalStatus].className.split(' ')[0])} />
                        <span className={cn("text-sm font-medium", transactionStatusConfig[txn.finalStatus].className.split(' ')[0])}>
                          {transactionStatusConfig[txn.finalStatus].label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIndividualTransaction(txn)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Voir Détail
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune transaction trouvée pour les critères sélectionnés</p>
            </div>
          )}
        </div>
      </div>

      {/* Individual Transaction Detail Modal */}
      <Dialog open={selectedIndividualTransaction !== null} onOpenChange={() => setSelectedIndividualTransaction(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail de la Transaction</DialogTitle>
            <DialogDescription>
              Traçabilité complète de la transaction {selectedIndividualTransaction?.transactionId}
            </DialogDescription>
          </DialogHeader>

          {selectedIndividualTransaction && (
            <div className="space-y-6 py-4">
              {/* Section 1: Synthèse de Paiement */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-primary" />
                  Synthèse de Paiement
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID du Lot</p>
                    <p className="font-medium text-foreground">{selectedIndividualTransaction.batchId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ID de la Transaction</p>
                    <p className="font-mono font-medium text-foreground">{selectedIndividualTransaction.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Montant</p>
                    <p className="font-semibold text-lg text-primary">{selectedIndividualTransaction.amount.toLocaleString()} XOF</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">DFSP</p>
                    <p className="font-medium text-foreground">{selectedIndividualTransaction.dfsp}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nom du Destinataire Réel</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{selectedIndividualTransaction.recipientName}</p>
                      {selectedIndividualTransaction.recipientType === "third-party" && (
                        <Badge variant="outline" className="text-xs">👥 Tiers</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coordonnées de Paiement</p>
                    <p className="font-mono text-sm text-foreground">{selectedIndividualTransaction.paymentAccount}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Statut et Raison */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  {selectedIndividualTransaction.finalStatus === "success" ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                  Statut et Raison
                </h3>
                {selectedIndividualTransaction.finalStatus === "success" ? (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold text-primary">Paiement Réussi</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          La transaction a été confirmée avec succès par {selectedIndividualTransaction.dfsp}
                        </p>
                        {selectedIndividualTransaction.transferId && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium">Mojaloop Transfer ID:</span> {selectedIndividualTransaction.transferId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-destructive mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-destructive">Paiement Rejeté</p>
                        {selectedIndividualTransaction.errorCode && (
                          <p className="text-sm font-medium text-destructive/90 mt-2">
                            Code d'erreur: {selectedIndividualTransaction.errorCode}
                          </p>
                        )}
                        {selectedIndividualTransaction.errorMessage && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Motif technique:</span> {selectedIndividualTransaction.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Historique Technique */}
              {selectedIndividualTransaction.statusHistory && selectedIndividualTransaction.statusHistory.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent-foreground" />
                    Historique Technique
                  </h3>
                  <div className="space-y-3">
                    {selectedIndividualTransaction.statusHistory.map((history, idx) => (
                      <div key={idx} className="flex gap-4 pb-3 border-b last:border-b-0">
                        <div className="w-24 flex-shrink-0">
                          <p className="text-xs text-muted-foreground">{history.timestamp}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{history.status}</p>
                          <p className="text-xs text-muted-foreground mt-1">{history.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pensionné</p>
                    <p className="font-medium text-foreground">{selectedIndividualTransaction.pensionerName}</p>
                    <p className="text-xs text-muted-foreground">{selectedIndividualTransaction.pensionerId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date de Finalisation</p>
                    <p className="font-medium text-foreground">{selectedIndividualTransaction.finalDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setSelectedIndividualTransaction(null)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}