import { useState } from "react";
import { CheckCircle, XCircle, Clock, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  pensionerName: string;
  pensionerId: string;
  amount: number;
  method: string;
  status: "success" | "failed" | "pending";
  time: string;
  date: string;
}

const payments: Payment[] = [
  {
    id: "1",
    pensionerName: "Kokou Mensah",
    pensionerId: "BN-2024-00145",
    amount: 85000,
    method: "Orange Money",
    status: "success",
    time: "14:32",
    date: "2024-01-15",
  },
  {
    id: "2",
    pensionerName: "Adjovi Dossou",
    pensionerId: "BN-2024-00892",
    amount: 120000,
    method: "MTN Mobile",
    status: "success",
    time: "14:28",
    date: "2024-01-15",
  },
  {
    id: "3",
    pensionerName: "Akpaki Houessou",
    pensionerId: "BN-2024-01234",
    amount: 95000,
    method: "Ecobank",
    status: "failed",
    time: "14:25",
    date: "2024-01-15",
  },
  {
    id: "4",
    pensionerName: "Sossou Agbangla",
    pensionerId: "BN-2024-00567",
    amount: 75000,
    method: "Orange Money",
    status: "pending",
    time: "14:20",
    date: "2024-01-14",
  },
];

const statusConfig = {
  success: {
    icon: CheckCircle,
    label: "Réussi",
    className: "text-primary bg-primary/10",
  },
  failed: {
    icon: XCircle,
    label: "Échoué",
    className: "text-destructive bg-destructive/10",
  },
  pending: {
    icon: Clock,
    label: "En cours",
    className: "text-accent-foreground bg-accent/20",
  },
};

type FilterType = "all" | "success" | "failed" | "pending";
type MethodFilter = "all" | "Orange Money" | "MTN Mobile" | "Ecobank";

export function RecentPayments() {
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");

  const filteredPayments = payments.filter((payment) => {
    const statusMatch = statusFilter === "all" || payment.status === statusFilter;
    const methodMatch = methodFilter === "all" || payment.method === methodFilter;
    return statusMatch && methodMatch;
  });

  const filterButtons: { value: FilterType; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "success", label: "Réussis" },
    { value: "pending", label: "En cours" },
    { value: "failed", label: "Échoués" },
  ];

  const methodButtons: { value: MethodFilter; label: string }[] = [
    { value: "all", label: "Tous" },
    { value: "Orange Money", label: "Orange" },
    { value: "MTN Mobile", label: "MTN" },
    { value: "Ecobank", label: "Ecobank" },
  ];

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-foreground">Paiements Récents</h3>
        <button className="text-sm text-primary hover:underline flex items-center gap-1 self-start sm:self-auto">
          Voir tout <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex flex-wrap gap-1">
            {filterButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={statusFilter === btn.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-7 text-xs transition-all",
                  statusFilter === btn.value && "shadow-sm"
                )}
                onClick={() => setStatusFilter(btn.value)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 sm:ml-auto">
          {methodButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={methodFilter === btn.value ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setMethodFilter(btn.value)}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bénéficiaire</th>
              <th>Montant</th>
              <th>Méthode</th>
              <th>Statut</th>
              <th>Heure</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => {
              const status = statusConfig[payment.status];
              const StatusIcon = status.icon;
              return (
                <tr key={payment.id} className="cursor-pointer">
                  <td>
                    <div>
                      <p className="font-medium text-foreground">{payment.pensionerName}</p>
                      <p className="text-xs text-muted-foreground">{payment.pensionerId}</p>
                    </div>
                  </td>
                  <td className="font-semibold text-foreground">
                    {payment.amount.toLocaleString()} XOF
                  </td>
                  <td className="text-muted-foreground">{payment.method}</td>
                  <td>
                    <span className={cn("status-badge gap-1.5", status.className)}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{payment.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredPayments.map((payment) => {
          const status = statusConfig[payment.status];
          const StatusIcon = status.icon;
          return (
            <div
              key={payment.id}
              className="bg-muted/30 rounded-lg p-4 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{payment.pensionerName}</p>
                  <p className="text-xs text-muted-foreground">{payment.pensionerId}</p>
                </div>
                <span className={cn("status-badge gap-1 shrink-0", status.className)}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-foreground">
                    {payment.amount.toLocaleString()} XOF
                  </p>
                  <p className="text-xs text-muted-foreground">{payment.method}</p>
                </div>
                <p className="text-xs text-muted-foreground">{payment.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPayments.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Aucun paiement trouvé avec ces filtres
        </div>
      )}
    </div>
  );
}
