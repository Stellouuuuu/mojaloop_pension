import { Sparkles, TrendingUp } from "lucide-react";

export function MotivationalBanner() {
  return (
    <div className="gov-banner relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-primary-foreground/80">Trésor Public du Bénin</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
            L'efficacité au service de nos retraités
          </h2>
          <p className="text-primary-foreground/80 text-sm md:text-base max-w-xl">
            Ensemble, assurons une gestion transparente et rapide des pensions pour améliorer la vie de plus de 100 000 bénéficiaires.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-accent">
              <TrendingUp className="w-5 h-5" />
              <span className="text-2xl font-bold">95%</span>
            </div>
            <p className="text-xs text-primary-foreground/70 mt-1">Taux de succès</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">&lt;48h</div>
            <p className="text-xs text-primary-foreground/70 mt-1">Délai traitement</p>
          </div>
        </div>
      </div>
    </div>
  );
}
