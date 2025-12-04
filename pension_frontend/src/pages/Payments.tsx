import { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Ban,
  UserCog,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import BatchFileUpload from "@/components/payments/BatchFileUpload";

interface Payment {
  id: string;
  pensionerId: string;
  pensionerName: string;
  amount: number;
  dfsp: string;
  status: "ready" | "processing" | "success" | "failed" | "blocked-expired" | "blocked-suspended";
  partyId: string;
  fspId: string;
  hasThirdParty?: boolean;
  thirdPartyName?: string;
  isExcluded?: boolean;
  errorCode?: string;
}

const statusConfig = {
  ready: { icon: CheckCircle, label: "Prêt", className: "text-primary bg-primary/10" },
  processing: { icon: Loader2, label: "En cours", className: "text-accent-foreground bg-accent/20" },
  success: { icon: CheckCircle, label: "Réussi", className: "text-primary bg-primary/10" },
  failed: { icon: XCircle, label: "Échoué", className: "text-destructive bg-destructive/10" },
  "blocked-expired": { icon: AlertTriangle, label: "Bloqué (expiré)", className: "text-destructive bg-destructive/10" },
  "blocked-suspended": { icon: Ban, label: "Bloqué (suspendu)", className: "text-destructive bg-destructive/10" },
};

export default function Payments() {
  const [batch, setBatch] = useState<Payment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // État du lot : aucun, chargé, en cours
  const hasBatch = batch.length > 0;
  const activePayments = batch.filter(p => !p.isExcluded && !p.status.startsWith("blocked"));
  const totalAmount = activePayments.reduce((sum, p) => sum + p.amount, 0);
  const processedCount = activePayments.filter(p => p.status === "success" || p.status === "failed").length;
  const progress = activePayments.length > 0 ? (processedCount / activePayments.length) * 100 : 0;

  // Simuler le traitement séquentiel
  useEffect(() => {
    if (!isProcessing || currentIndex >= activePayments.length) return;

    const timer = setTimeout(() => {
      setBatch(prev => prev.map((p) => {
        const activeIdx = activePayments.findIndex(ap => ap.id === p.id);
        if (activeIdx === -1) return p;

        if (activeIdx === currentIndex) {
          const success = Math.random() > 0.15;
          return {
            ...p,
            status: success ? "success" : "failed",
            errorCode: !success ? "E00" + Math.floor(Math.random() * 6 + 1) : undefined,
          };
        }
        if (activeIdx === currentIndex + 1) {
          return { ...p, status: "processing" };
        }
        return p;
      }));
      setCurrentIndex(prev => prev + 1);
    }, 900);

    return () => clearTimeout(timer);
  }, [isProcessing, currentIndex, activePayments.length]);

  // Réception du fichier uploadé
  const handleFileUploaded = (payments: Payment[]) => {
    // Tous les paiements du lot sont initialement "ready" (prêts)
    const initialBatch: Payment[] = payments.map(p => ({
      ...p,
      status: "ready",
      errorCode: undefined,
    }));

    setBatch(initialBatch);
    setCurrentIndex(0);
    setIsProcessing(false);
  };

  const handleLaunch = () => {
    if (!hasBatch || isProcessing) return;
    setIsProcessing(true);
    setCurrentIndex(0);

    // Démarrer le premier paiement (seulement s'il y en a)
    if (activePayments.length > 0) {
      setBatch(prev => prev.map((p) => {
        const isFirstActive = activePayments[0]?.id === p.id;
        return isFirstActive ? { ...p, status: "processing" as const } : p;
      }));
    }
  };

  const handleReset = () => {
    setBatch([]);
    setIsProcessing(false);
    setCurrentIndex(0);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paiements par Lot</h1>
          <p className="text-muted-foreground mt-1">Importez et lancez vos paiements en masse</p>
        </div>
      </div>

      {/* État initial : Upload */}
      {!hasBatch && (
        <div className="bg-card border rounded-2xl p-10 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Importer un nouveau lot de paiement</h2>
            <p className="text-muted-foreground mt-2">Fichier CSV ou Excel requis</p>
          </div>
          <BatchFileUpload onUpload={handleFileUploaded as any} />
        </div>
      )}

      {/* Lot chargé */}
      {hasBatch && (
        <>
          {/* Actions principales */}
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleLaunch}
                disabled={isProcessing || activePayments.length === 0}
                className={cn(
                  "gap-3",
                  // 🟢 Styles explicites pour le bouton vert (Lancer)
                  "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                <Play className="w-5 h-5" />
                {isProcessing ? "Traitement en cours..." : "Lancer les Paiements"}
              </Button>
              <Button 
                size="lg" 
                variant="outline" // ⚪ Style 'outline' pour le bouton gris (Réinitialiser)
                onClick={handleReset} 
                className="gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                Réinitialiser
              </Button>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{activePayments.length}</p>
              <p className="text-sm text-muted-foreground">dossiers à traiter</p>
            </div>
          </div>

          {/* Progression */}
          {isProcessing && (
            <div className="bg-card border rounded-xl p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Traitement en cours</h3>
                  <p className="text-sm text-muted-foreground">
                    {processedCount} / {activePayments.length} traités
                  </p>
                </div>
                <span className="text-2xl font-bold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-4" />
            </div>
          )}

          {/* Résumé rapide */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-primary">{(totalAmount / 1_000_000).toFixed(1)}M</p>
              <p className="text-sm text-muted-foreground">Montant total</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-emerald-600">
                {batch.filter(p => p.status === "success").length}
              </p>
              <p className="text-sm text-muted-foreground">Réussis</p>
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 text-center">
              <p className="text-3xl font-bold text-destructive">
                {batch.filter(p => p.status === "failed").length}
              </p>
              <p className="text-sm text-muted-foreground">Échoués</p>
            </div>
          </div>

          {/* Tableau des paiements */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/50">
              <h3 className="font-semibold">Détail des paiements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left border-b">
                  <tr>
                    <th className="pb-3 px-4">Bénéficiaire</th>
                    <th className="pb-3 px-4">Destinataire</th>
                    <th className="pb-3 px-4">Montant</th>
                    <th className="pb-3 px-4">DFSP</th>
                    <th className="pb-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.map((p) => {
                    const StatusIcon = statusConfig[p.status].icon;
                    const isSpinning = p.status === "processing";
                    const isBlocked = p.status.startsWith("blocked");

                    return (
                      <tr
                        key={p.id}
                        className={cn(
                          "border-b transition-colors",
                          p.isExcluded && "opacity-50 bg-muted/30",
                          isBlocked && "bg-destructive/5"
                        )}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{p.pensionerName}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.pensionerId}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {p.hasThirdParty ? (
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{p.thirdPartyName}</p>
                              <Badge variant="secondary" className="text-xs">
                                <UserCog className="w-3 h-3" />
                                Tiers
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-semibold">
                          {p.amount.toLocaleString()} XOF
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{p.dfsp}</td>
                        <td className="py-4 px-4">
                          <span className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium", statusConfig[p.status].className)}>
                            <StatusIcon className={cn("w-4 h-4", isSpinning && "animate-spin")} />
                            {statusConfig[p.status].label}
                          </span>
                          {p.errorCode && <Badge variant="outline" className="ml-2 text-xs">{p.errorCode}</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}