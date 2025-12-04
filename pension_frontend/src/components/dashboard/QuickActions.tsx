import { UserPlus, CreditCard, ClipboardCheck, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const actions = [
  {
    title: "Nouveau Pensionné",
    description: "Ajouter un bénéficiaire",
    icon: UserPlus,
    href: "/pensioners",
    variant: "default" as const,
    priority: 1,
  },
  {
    title: "Lancer Paiements",
    description: "Traiter le lot mensuel",
    icon: CreditCard,
    href: "/payments",
    variant: "default" as const,
    priority: 2,
  },
  {
    title: "Valider Dossiers",
    description: "45 en attente",
    icon: ClipboardCheck,
    href: "/eligibility",
    variant: "outline" as const,
    badge: 45,
    priority: 3,
  },
  {
    title: "Exporter Rapport",
    description: "Rapport mensuel",
    icon: FileSpreadsheet,
    href: "/reports",
    variant: "outline" as const,
    priority: 4,
  },
];

// Sort by priority (most frequent first)
const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-6">
      <h3 className="font-semibold text-foreground mb-3 sm:mb-4">Actions Rapides</h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {sortedActions.map((action) => (
          <Button
            key={action.title}
            variant={action.variant}
            className={`h-auto py-3 sm:py-4 flex flex-col items-start gap-0.5 sm:gap-1 relative ${
              action.variant === "default" 
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" 
                : "hover:bg-accent/50"
            }`}
            onClick={() => navigate(action.href)}
          >
            <action.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
            <span className="font-medium text-xs sm:text-sm">{action.title}</span>
            <span className="text-[10px] sm:text-xs opacity-80 font-normal hidden sm:block">{action.description}</span>
            {action.badge && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1.5 -right-1.5 text-[10px] px-1.5 py-0 bg-alert-warning text-alert-warning-foreground"
              >
                {action.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
