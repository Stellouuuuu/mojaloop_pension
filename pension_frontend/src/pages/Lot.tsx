import { useState, useEffect, useMemo } from "react";
import {
    Search,
    Download,
    Eye,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Fonction utilitaire pour Tailwind CSS
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// --- Interfaces de Données ---

type TransactionStatus = "success" | "failed" | "pending";
type BatchOverallStatus = "completed" | "partial" | "failed";

interface PaymentTransaction {
    transactionId: string; // unique_id dans l'API
    pensionerId: string; // (msisdn ou unique_id)
    pensionerName: string; // first_name + last_name
    amount: number;
    dfsp: string; // FSP ID (manquant dans l'API, utiliser un placeholder)
    status: TransactionStatus;
    timestamp: string; // created_at dans l'API
    partyId: string; // Pensioner ID
    fspId: string; // Placeholder
    errorCode?: string;
    errorMessage?: string;
}

interface BatchHistory {
    batchId: string; // batch_id de l'API
    batchCode: string; // batch_code de l'API
    date: string; // created_at de la première transaction
    totalAmount: number;
    totalCount: number; // total_payments de l'API
    successCount: number;
    failedCount: number;
    status: BatchOverallStatus;
    initiatedBy: string;
    currency: string;
    payments: PaymentTransaction[];
}

// Fonction de regroupement des données brutes de l'API en lots
function groupDataIntoBatches(apiData: any[]): BatchHistory[] {
    if (!apiData || apiData.length === 0) return [];

    const batchesMap = new Map<number, BatchHistory>();

    for (const item of apiData) {
        const batchKey = item.batch_id;
        const isNewBatch = !batchesMap.has(batchKey);

        // Conversion et préparation de la transaction
        const transaction: PaymentTransaction = {
            transactionId: item.unique_id,
            pensionerId: item.msisdn || item.unique_id, // Utiliser msisdn comme ID
            pensionerName: `${item.first_name} ${item.last_name}`,
            amount: parseFloat(item.amount),
            dfsp: "Moov/MTN (Placeholder)", // DFSP n'est pas dans l'API, on utilise un placeholder
            status: item.status as TransactionStatus,
            timestamp: new Date(item.created_at).toLocaleString(), // Formatage pour l'affichage
            partyId: item.msisdn,
            fspId: "TBD",
            errorCode: item.status === 'failed' ? 'ERROR_CODE' : undefined,
            errorMessage: item.status === 'failed' ? 'Raison de l\'échec' : undefined,
        };

        if (isNewBatch) {
            // Pour les nouveaux lots, on initialise la structure
            const totalPayments = item.total_payments;
            const successCount = item.status === 'success' ? 1 : 0;
            const failedCount = item.status === 'failed' ? 1 : 0;

            batchesMap.set(batchKey, {
                batchId: String(item.batch_id),
                batchCode: item.batch_code,
                date: new Date(item.created_at).toLocaleString(),
                totalAmount: parseFloat(item.total_amount),
                totalCount: totalPayments, // Utiliser total_payments du premier élément comme référence
                successCount: successCount,
                failedCount: failedCount,
                status: 'pending', // Statut temporaire, sera ajusté plus tard
                initiatedBy: item.initiated_by,
                currency: item.currency || 'N/A',
                payments: [transaction],
            });
        } else {
            // Pour les lots existants, on met à jour les compteurs et ajoute la transaction
            const batch = batchesMap.get(batchKey)!;
            batch.payments.push(transaction);

            // On recalcule les compteurs basés sur les transactions déjà ajoutées
            batch.successCount = batch.payments.filter(p => p.status === 'success').length;
            batch.failedCount = batch.payments.filter(p => p.status === 'failed').length;
        }
    }

    // Seconde passe pour déterminer le statut global du lot (BatchOverallStatus)
    return Array.from(batchesMap.values()).map(batch => {
        const processedCount = batch.successCount + batch.failedCount;
        const pendingCount = batch.totalCount - processedCount;

        if (processedCount === batch.totalCount) {
            batch.status = batch.failedCount === 0 ? 'completed' : 'partial'; // Si tous traités, mais certains échoués -> partial
        } else if (pendingCount > 0) {
            batch.status = 'partial';
        } else if (batch.failedCount === batch.totalCount) {
            batch.status = 'failed';
        }
        return batch;
    });
}

// --- Configuration pour l'affichage des statuts ---
const statusConfig = {
    completed: { label: "Complété", className: "bg-primary/10 text-primary", icon: CheckCircle },
    partial: { label: "Partiel", className: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
    failed: { label: "Échoué", className: "bg-destructive/10 text-destructive", icon: XCircle },
    pending: { label: "En cours", className: "bg-blue-100 text-blue-700", icon: Clock },
    success: { label: "Réussi", className: "bg-primary/10 text-primary", icon: CheckCircle },
};


export default function PaymentsHistory() {
    const [batchHistory, setBatchHistory] = useState<BatchHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<BatchOverallStatus | "all">("all");
    const [selectedBatch, setSelectedBatch] = useState<BatchHistory | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);

    // Fonction de téléchargement du reçu (simulée)
    const handleDownloadReceipt = (transactionId: string) => {
        console.log(`Téléchargement du reçu pour la transaction: ${transactionId}`);
        // Logique API ou de génération de PDF ici
        alert(`Téléchargement du reçu pour ${transactionId} simulé. (Voir la console pour le log)`);
    };

    // --- Logique de Fetch & Groupement ---
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                // Utilisation de la même API pour simuler la récupération de toutes les transactions
                const res = await fetch("http://localhost:5000/with-pensioners");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const json = await res.json();
                const groupedData = groupDataIntoBatches(json.data);

                setBatchHistory(groupedData);
            } catch (err: any) {
                setError(err.message || "Erreur lors du chargement des données.");
                setBatchHistory([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // --- Logique de Filtrage (useMemo pour la performance) ---
    const filteredHistory = useMemo(() => {
        return batchHistory.filter(b => {
            const matchSearch = b.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.initiatedBy.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === "all" || b.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [batchHistory, searchQuery, statusFilter]);

    // --- Logique d'affichage du Tableau ---

    const renderTableBody = () => {
        if (loading) {
            return (
                <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                    <p className="text-muted-foreground">Chargement des lots...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-6 text-center text-destructive flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Erreur de connexion à l'API: {error}
                </div>
            );
        }

        if (filteredHistory.length === 0) {
            return (
                <div className="p-12 text-center text-muted-foreground">
                    <p>Aucun lot trouvé correspondant à vos critères de recherche.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="data-table min-w-full divide-y divide-border">
                    <thead>
                        <tr className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <th className="px-6 py-3">ID du Lot</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Montant Total</th>
                            <th className="px-6 py-3">Paiements</th>
                            <th className="px-6 py-3">Taux de Réussite</th>
                            <th className="px-6 py-3">Statut</th>
                            <th className="px-6 py-3">Initié par</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredHistory.map((batch) => {
                            const config = statusConfig[batch.status] || statusConfig.partial;
                            const successRate = batch.totalCount ? (batch.successCount / batch.totalCount) * 100 : 0;

                            return (
                                <tr key={batch.batchId} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-foreground">
                                        {batch.batchCode}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {batch.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-foreground">
                                        {batch.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {batch.currency}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <p className="text-foreground font-medium">{batch.totalCount} paiements</p>
                                            <p className="text-xs text-muted-foreground">
                                                <span className="text-primary">{batch.successCount} réussis</span> • <span className="text-destructive">{batch.failedCount} échoués</span>
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                <Progress value={successRate} className="h-full bg-primary" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">
                                                {successRate.toFixed(0)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.className)}>
                                            <config.icon className="w-3 h-3 mr-1" />
                                            {config.label}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-sm">{batch.initiatedBy}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedBatch(batch)}
                                            className="gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Détails
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // --- Le JSX de la page ---
    return (
        <div className="space-y-6">
            {/* En-tête de la page */}
            <div>
                <h1 className="text-2xl font-bold">Historique des Lots de Paiement</h1>
                <p className="text-muted-foreground mt-1">Consultation de tous les lots déjà exécutés</p>
            </div>

            {/* Barre de filtres et d'actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par ID lot ou utilisateur..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter as (value: string) => void}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="completed">Complété</SelectItem>
                        <SelectItem value="partial">Partiel</SelectItem>
                        <SelectItem value="failed">Échoué</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exporter
                </Button>
            </div>

            {/* Tableau historique */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                {renderTableBody()}
            </div>

            {/* --- Dialogs détails lot --- */}
            <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Détails du Lot : {selectedBatch?.batchCode}</DialogTitle>
                        <DialogDescription>
                            {selectedBatch?.totalCount} transactions traitées le {selectedBatch?.date}.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBatch && (
                        <div className="space-y-4 pt-4">
                            <h4 className="font-semibold text-lg border-b pb-2">Transactions du Lot</h4>
                            <div className="space-y-3">
                                {selectedBatch.payments.map((payment) => {
                                    const statusCfg = statusConfig[payment.status] || statusConfig.pending;
                                    return (
                                        <div
                                            key={payment.transactionId}
                                            className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-medium text-foreground">{payment.pensionerName}</p>
                                                        <Badge variant="outline" className="text-xs font-mono">
                                                            ID: {payment.pensionerId}
                                                        </Badge>
                                                        <Badge className={cn("text-xs", statusCfg.className)}>
                                                            <statusCfg.icon className="w-3 h-3 mr-1" />
                                                            {statusCfg.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-1 text-sm text-muted-foreground">
                                                        <span className="font-semibold text-primary">{payment.amount.toLocaleString()} {selectedBatch.currency}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>DFSP: {payment.dfsp}</span>
                                                    </div>
                                                    {(payment.errorCode || payment.errorMessage) && (
                                                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                                                            <XCircle className="w-4 h-4"/> {payment.errorCode}: {payment.errorMessage}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    // 🛑 CORRECTION CLÉ : Stopper la propagation pour ne pas fermer le Dialog Batch
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTransaction(payment);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* --- Dialogs détails transaction (Pensionnaire) --- */}
            <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Détails Transaction</DialogTitle>
                        <DialogDescription>
                            Informations complètes sur le paiement <span className="font-mono">{selectedTransaction?.transactionId}</span>
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <>
                            {/* Grille des détails du pensionnaire */}
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-4">
                                <div className="text-muted-foreground">Pensionnaire:</div>
                                <div className="font-medium">{selectedTransaction.pensionerName}</div>

                                <div className="text-muted-foreground">ID Pensionnaire:</div>
                                <div className="font-mono text-xs break-all">{selectedTransaction.pensionerId}</div>

                                <div className="text-muted-foreground">Montant:</div>
                                <div className="font-medium text-primary">
                                    {selectedTransaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedBatch?.currency || 'N/A'}
                                </div>

                                <div className="text-muted-foreground">DFSP (FSP):</div>
                                <div className="font-medium">{selectedTransaction.dfsp}</div>

                                <div className="text-muted-foreground">Statut:</div>
                                <div className="font-medium">
                                    {statusConfig[selectedTransaction.status]?.label || "Inconnu"}
                                </div>

                                <div className="text-muted-foreground">Date:</div>
                                <div className="font-medium">{selectedTransaction.timestamp}</div>

                                <div className="text-muted-foreground">ID Transaction:</div>
                                <div className="font-mono text-xs break-all">{selectedTransaction.transactionId}</div>

                                {selectedTransaction.errorCode && (
                                    <>
                                        <div className="text-muted-foreground text-destructive">Erreur Code:</div>
                                        <div className="font-medium text-destructive">{selectedTransaction.errorCode}</div>

                                        <div className="text-muted-foreground text-destructive">Message:</div>
                                        <div className="font-medium text-destructive col-span-1">{selectedTransaction.errorMessage}</div>
                                    </>
                                )}
                            </div>

                            {/* Bouton de Téléchargement */}
                            <div className="pt-4 border-t mt-4 flex justify-end">
                                <Button
                                    onClick={() => handleDownloadReceipt(selectedTransaction.transactionId)}
                                    className="gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Télécharger le Reçu
                                </Button>
                            </div>
                        </>
                    )}

                </DialogContent>
            </Dialog>
        </div>
    );
}