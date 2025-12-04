import { AlertTriangle, Clock, XCircle, ChevronRight, FileWarning, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  type: "critical" | "urgent" | "warning" | "info";
  title: string;
  count: number;
  urgentCount?: number;
  time: string;
  detail: string;
  href: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Paiements rejetés",
    count: 12,
    urgentCount: 5,
    time: "Il y a 5 min",
    detail: "5 critiques à traiter immédiatement",
    href: "/payments?status=rejected",
  },
  {
    id: "2",
    type: "urgent",
    title: "Validations en attente",
    count: 45,
    urgentCount: 10,
    time: "Depuis 2 jours",
    detail: "10 urgentes sur 45 dossiers",
    href: "/eligibility?status=pending",
  },
  {
    id: "3",
    type: "warning",
    title: "Documents manquants",
    count: 8,
    time: "Rappel envoyé il y a 3h",
    detail: "3 pensionnés sans réponse depuis 7j",
    href: "/pensioners?filter=missing-docs",
  },
  {
    id: "4",
    type: "info",
    title: "Rapports à générer",
    count: 3,
    time: "Échéance demain",
    detail: "Rapports mensuels en attente",
    href: "/reports",
  },
];

const alertStyles = {
  critical: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: XCircle,
    iconColor: "text-destructive",
    badgeVariant: "destructive" as const,
  },
  urgent: {
    bg: "bg-alert-urgent/10",
    border: "border-alert-urgent/30",
    icon: Clock,
    iconColor: "text-alert-urgent",
    badgeVariant: "default" as const,
  },
  warning: {
    bg: "bg-alert-warning/10",
    border: "border-alert-warning/30",
    icon: FileWarning,
    iconColor: "text-alert-warning",
    badgeVariant: "secondary" as const,
  },
  info: {
    bg: "bg-muted/50",
    border: "border-border",
    icon: AlertTriangle,
    iconColor: "text-muted-foreground",
    badgeVariant: "outline" as const,
  },
};

const MAX_VISIBLE_ALERTS = 3;

export function AlertsPanel() {
  const navigate = useNavigate();
  const visibleAlerts = alerts.slice(0, MAX_VISIBLE_ALERTS);
  const hasMore = alerts.length > MAX_VISIBLE_ALERTS;

  const handleAlertClick = (href: string) => {
    navigate(href);
  };

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Alertes Actives</h3>
          <Badge variant="destructive" className="text-xs">
            {alerts.length}
          </Badge>
        </div>
      </div>
      <div className="space-y-3">
        {visibleAlerts.map((alert) => {
          const style = alertStyles[alert.type];
          const Icon = style.icon;
          return (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert.href)}
              className={cn(
                "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:translate-x-1 group",
                style.bg,
                style.border
              )}
            >
              <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0", style.bg)}>
                <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", style.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-foreground">{alert.title}</p>
                  {alert.urgentCount && (
                    <Badge variant={style.badgeVariant} className="text-[10px] px-1.5 py-0">
                      {alert.urgentCount} urgentes
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.detail}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">{alert.time}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className={cn("text-xl sm:text-2xl font-bold", style.iconColor)}>{alert.count}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button 
          onClick={() => navigate("/reports?tab=alerts")}
          className="w-full mt-4 py-2 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          Voir toutes les alertes ({alerts.length}) <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
