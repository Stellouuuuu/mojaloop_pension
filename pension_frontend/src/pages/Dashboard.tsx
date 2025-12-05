import { Users, Banknote, CheckCircle, AlertTriangle } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
import { MotivationalBanner } from "@/components/dashboard/MotivationalBanner";
import { LazySection } from "@/components/ui/lazy-section";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { getDashboardKPIs } from "@/api/api";


// Sample sparkline data (7 days trend)
interface DashboardKPIs {
  activePensioners: number;
  paidThisMonth: number;
  successRate: number;
  errors: number;
}

const sparklineData = {
  pensioners: [105200, 106100, 106800, 107200, 107800, 108100, 108542],
  payments: [7.8, 7.9, 8.0, 8.0, 8.1, 8.15, 8.2],
  successRate: [97.2, 97.4, 97.5, 97.6, 97.5, 97.7, 97.8],
  errors: [18, 20, 25, 22, 19, 21, 23],
};

const PaymentsSkeleton = () => (
  <div className="bg-card rounded-xl border p-4 sm:p-6">
    <div className="flex justify-between mb-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
);

const AlertsSkeleton = () => (
  <div className="bg-card rounded-xl border p-6">
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardKPIs, Error>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard/kpis");
      return res.data;
    },
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {(error as Error).message}</p>;

  if (!data) return <p>Aucune donnée disponible</p>;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Tableau de Bord</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble du système de gestion des pensions</p>
      </div>

      {/* Motivational Banner */}
      <MotivationalBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
        title="Pensionnés Actifs"
        value={data.activePensioners.toLocaleString()}
        icon={Users}
        variant="success"
      />
      <KPICard
        title="Payé ce Mois"
        value={`${data.paidThisMonth.toLocaleString()} XOF`}
        icon={Banknote}
        variant="default"
      />
      <KPICard
        title="Taux de Succès"
        value={`${data.successRate}%`}
        icon={CheckCircle}
        variant="success"
      />
      <KPICard
        title="Erreurs à Traiter"
        value={data.errors}
        icon={AlertTriangle}
        variant="danger"
      />
      </div>

      {/* Main Content Grid - Lazy Loaded */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Recent Payments */}
        <div className="lg:col-span-2">
          <LazySection fallback={<PaymentsSkeleton />}>
            <RecentPayments />
          </LazySection>
        </div>

        {/* Right Column - Alerts & Actions */}
        <div className="space-y-4 sm:space-y-6">
          <LazySection fallback={<AlertsSkeleton />}>
            <AlertsPanel />
          </LazySection>
          <LazySection>
            <QuickActions />
          </LazySection>
        </div>
      </div>
    </div>
  );
}