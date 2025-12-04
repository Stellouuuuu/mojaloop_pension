import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Sparkline } from "@/components/ui/sparkline";

interface KPICardProps {
  title: string;
  value: string | number;
  numericValue?: number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: number[];
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-card",
  success: "bg-primary/5 border-primary/20",
  warning: "bg-accent/10 border-accent/30",
  danger: "bg-destructive/5 border-destructive/20",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-primary/10 text-primary",
  warning: "bg-accent/20 text-accent-foreground",
  danger: "bg-destructive/10 text-destructive",
};

const sparklineColors = {
  default: "primary" as const,
  success: "primary" as const,
  warning: "accent" as const,
  danger: "destructive" as const,
};

export function KPICard({ 
  title, 
  value, 
  numericValue,
  subtitle, 
  icon: Icon, 
  trend, 
  sparklineData,
  variant = "default" 
}: KPICardProps) {
  // Parse numeric value for animation if string contains a number
  const displayNumeric = numericValue ?? (typeof value === 'number' ? value : null);
  
  return (
    <div
      className={cn(
        "rounded-xl p-4 sm:p-6 border transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <div className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-foreground">
            {displayNumeric !== null ? (
              <AnimatedNumber 
                value={displayNumeric} 
                formatFn={(n) => typeof value === 'string' ? value : n.toLocaleString()}
              />
            ) : (
              value
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>}
          
          {/* Sparkline */}
          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-3">
              <Sparkline 
                data={sparklineData} 
                color={sparklineColors[variant]}
                height={24}
              />
            </div>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-primary" : "text-destructive"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", 
          iconVariantStyles[variant]
        )}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}
