import { useState, useCallback, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Banknote,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronDown,
  Search,
  Loader2,
  History,
  FileText,
  UserCheck,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefetch } from "@/hooks/use-prefetch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: number;
  isProcessing?: boolean;
  children?: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const navItems: NavItem[] = [
  {
    title: "Tableau de Bord",
    href: "/",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
  },
  {
    title: "Gestion Pensionnés",
    href: "/pensioners",
    icon: Users,
    description: "CRUD pensionnés",
    children: [
      { title: "Pensionnés Actifs", href: "/pensioners", icon: UserCheck },
    ],
  },
  
  {
    title: "Lancement Paiements",
    href: "/payments",
    icon: Banknote,
    description: "Paiements de masse",
    isProcessing: true, // Mock: payments in progress
    children: [
      { title: "Nouveau Lot", href: "/payments", icon: Banknote },
      { title: "Historique Lot", href: "/lot/history", icon: FileText },
      { title: "Historique Transactions", href: "/payments/history", icon: History },
    ],
  },
  {
    title: "Erreurs & Rapports",
    href: "/reports",
    icon: AlertTriangle,
    description: "Gestion des erreurs",
    badge: 23, // Mock: pending errors count
    children: [
      { title: "Alertes Actives", href: "/reports", icon: AlertTriangle },
      { title: "Paiements Échoués", href: "/reports/failed", icon: FileText },
      { title: "Rapports Mensuels", href: "/reports/monthly", icon: FileText },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const location = useLocation();
  const { prefetch } = usePrefetch();

  const handleMouseEnter = useCallback((href: string) => {
    prefetch(href);
  }, [prefetch]);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return navItems;
    const query = searchQuery.toLowerCase();
    return navItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.children?.some(child => child.title.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const isItemActive = (item: NavItem) => {
    if (location.pathname === item.href) return true;
    if (item.children?.some(child => location.pathname === child.href)) return true;
    return false;
  };

  const NavItemContent = ({ item, isActive }: { item: NavItem; isActive: boolean }) => (
    <>
      <div className="relative flex items-center gap-3">
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-active-indicator rounded-r-full" />
        )}
        <div className="relative">
          <item.icon
            className={cn(
              "w-5 h-5 flex-shrink-0 transition-colors",
              isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
            )}
          />
          {/* Processing animation for payments */}
          {item.isProcessing && (
            <Loader2 className="absolute -top-1 -right-1 w-3 h-3 text-sidebar-primary animate-spin" />
          )}
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{item.title}</span>
              {/* Error badge */}
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="h-5 min-w-5 px-1.5 text-xs font-bold animate-pulse"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs text-sidebar-foreground/60 truncate">{item.description}</span>
          </div>
        )}
      </div>
      {/* Chevron for items with children */}
      {!collapsed && item.children && (
        <ChevronDown className={cn(
          "w-4 h-4 text-sidebar-foreground/50 transition-transform duration-200",
          openSubmenus.includes(item.title) && "rotate-180"
        )} />
      )}
    </>
  );

  const NavItemWrapper = ({ item }: { item: NavItem }) => {
    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;

    const linkClasses = cn(
      "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
      "hover:translate-x-1",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      // Animated underline effect
      "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-sidebar-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300",
      "hover:after:scale-x-100"
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <NavLink
              to={item.href}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={() => handleMouseEnter(item.href)}
              className={linkClasses}
            >
              <NavItemContent item={item} isActive={isActive} />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span>{item.title}</span>
            {item.badge && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    if (hasChildren) {
      return (
        <Collapsible
          open={openSubmenus.includes(item.title)}
          onOpenChange={() => toggleSubmenu(item.title)}
        >
          <CollapsibleTrigger asChild>
            <button
              onMouseEnter={() => handleMouseEnter(item.href)}
              className={cn(linkClasses, "w-full")}
            >
              <NavItemContent item={item} isActive={isActive} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="ml-6 mt-1 space-y-1 border-l-2 border-sidebar-border pl-3">
              {item.children?.map((child) => {
                const isChildActive = location.pathname === child.href;
                return (
                  <NavLink
                    key={child.href}
                    to={child.href}
                    onClick={() => setMobileOpen(false)}
                    onMouseEnter={() => handleMouseEnter(child.href)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-all duration-200",
                      "hover:translate-x-1",
                      isChildActive
                        ? "text-sidebar-primary font-medium bg-sidebar-accent/50"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                    )}
                  >
                    <child.icon className="w-4 h-4" />
                    <span>{child.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <NavLink
        to={item.href}
        onClick={() => setMobileOpen(false)}
        onMouseEnter={() => handleMouseEnter(item.href)}
        className={linkClasses}
      >
        <NavItemContent item={item} isActive={isActive} />
      </NavLink>
    );
  };

  const NavContent = () => (
    <>
      {/* Header with Logo - Darker green zone */}
      <div className="flex items-center h-14 sm:h-16 px-4 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm">BN</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sidebar-foreground font-semibold text-sm">Trésor Public</span>
              <span className="text-sidebar-foreground/70 text-xs">République du Bénin</span>
            </div>
          )}
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto lg:hidden p-1 text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search field - Lighter green zone */}
      {!collapsed && (
        <div className="px-3 py-3 bg-sidebar-lighter border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/50" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-sidebar-accent/30 border border-sidebar-border rounded-lg text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-primary"
            />
          </div>
        </div>
      )}

      {/* Navigation - Lighter green zone */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin bg-sidebar-lighter">
        <TooltipProvider>
          {filteredNavItems.map((item) => (
            <NavItemWrapper key={item.href} item={item} />
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer - Darker green zone */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1 bg-sidebar">
        <TooltipProvider>
          {collapsed ? (
            <>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all duration-200",
                      "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-1"
                    )}
                  >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Paramètres</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all duration-200",
                      "text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive hover:translate-x-1"
                    )}
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Déconnexion</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <button
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all duration-200",
                  "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-1"
                )}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Paramètres</span>
              </button>
              <button
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all duration-200",
                  "text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive hover:translate-x-1"
                )}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Déconnexion</span>
              </button>
            </>
          )}
        </TooltipProvider>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 lg:hidden p-2 bg-card border border-border rounded-lg shadow-sm"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar transition-transform duration-300 flex flex-col w-64 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex-col hidden lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <NavContent />

        {/* Collapse Toggle - Desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
      </aside>
    </>
  );
}
