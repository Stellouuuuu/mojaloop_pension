import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  UserRound,
  Smartphone,
  Building2,
  PauseCircle,
  Bell,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddPensionerForm from "@/components/pensioners/AddPensionerForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Pensioner {
  id: string;
  uniqueId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  amount: number;
  paymentMethod: "mobile" | "bank";
  paymentDetails: string;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  pendingSince?: number; // days since pending
  hasDisability?: boolean;
}

const mockPensioners: Pensioner[] = [
  {
    id: "1",
    uniqueId: "BN-2024-00145",
    firstName: "Kokou",
    lastName: "Mensah",
    birthDate: "1958-03-15",
    age: 66,
    amount: 85000,
    paymentMethod: "mobile",
    paymentDetails: "+229 97 00 00 01",
    status: "approved",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    uniqueId: "BN-2024-00892",
    firstName: "Adjovi",
    lastName: "Dossou",
    birthDate: "1960-07-22",
    age: 64,
    amount: 120000,
    paymentMethod: "bank",
    paymentDetails: "BJ02 0001 0101 0000 0000 0123",
    status: "approved",
    createdAt: "2024-02-10",
  },
  {
    id: "3",
    uniqueId: "BN-2024-01234",
    firstName: "Akpaki",
    lastName: "Houessou",
    birthDate: "1962-11-08",
    age: 62,
    amount: 95000,
    paymentMethod: "mobile",
    paymentDetails: "+229 96 00 00 02",
    status: "pending",
    createdAt: "2024-03-05",
    pendingSince: 15,
  },
  {
    id: "4",
    uniqueId: "BN-2024-00567",
    firstName: "Sossou",
    lastName: "Agbangla",
    birthDate: "1955-05-30",
    age: 69,
    amount: 75000,
    paymentMethod: "mobile",
    paymentDetails: "+229 97 00 00 03",
    status: "approved",
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    uniqueId: "BN-2024-02345",
    firstName: "Yawa",
    lastName: "Tokpanou",
    birthDate: "1959-09-12",
    age: 65,
    amount: 110000,
    paymentMethod: "bank",
    paymentDetails: "BJ02 0002 0202 0000 0000 0456",
    status: "rejected",
    createdAt: "2024-03-12",
  },
  {
    id: "6",
    uniqueId: "BN-2024-03456",
    firstName: "Kodjo",
    lastName: "Amoussou",
    birthDate: "1950-02-18",
    age: 74,
    amount: 95000,
    paymentMethod: "bank",
    paymentDetails: "BJ02 0003 0303 0000 0000 0789",
    status: "approved",
    createdAt: "2024-01-08",
    hasDisability: true,
  },
  {
    id: "7",
    uniqueId: "BN-2024-04567",
    firstName: "Afi",
    lastName: "Gbaguidi",
    birthDate: "1948-06-25",
    age: 76,
    amount: 105000,
    paymentMethod: "mobile",
    paymentDetails: "+229 95 00 00 04",
    status: "pending",
    createdAt: "2024-03-01",
    pendingSince: 8,
  },
];

const statusConfig = {
  approved: {
    icon: CheckCircle,
    label: "Approuvé",
    className: "text-primary bg-primary/10",
  },
  pending: {
    icon: Clock,
    label: "En attente",
    className: "text-alert-warning bg-alert-warning/10",
  },
  rejected: {
    icon: XCircle,
    label: "Rejeté",
    className: "text-destructive bg-destructive/10",
  },
};

type FilterType = "status" | "payment" | "age";
type FilterValue = string;

interface ActiveFilter {
  type: FilterType;
  value: FilterValue;
  label: string;
}

export default function Pensioners() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [selectedPensioner, setSelectedPensioner] = useState<Pensioner | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "bank">("mobile");

  const filterTags = [
    // Status filters
    { type: "status" as FilterType, value: "approved", label: "Approuvé", icon: CheckCircle, className: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" },
    { type: "status" as FilterType, value: "pending", label: "En attente", icon: Clock, className: "bg-alert-warning/10 text-alert-warning hover:bg-alert-warning/20 border-alert-warning/20" },
    { type: "status" as FilterType, value: "rejected", label: "Rejeté", icon: XCircle, className: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20" },
    // Payment method filters
    { type: "payment" as FilterType, value: "mobile", label: "Mobile Money", icon: Smartphone, className: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary" },
    { type: "payment" as FilterType, value: "bank", label: "Banque", icon: Building2, className: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary" },
    // Age filters
    { type: "age" as FilterType, value: "senior", label: "> 70 ans", icon: UserRound, className: "bg-alert-urgent/10 text-alert-urgent hover:bg-alert-urgent/20 border-alert-urgent/20" },
    { type: "age" as FilterType, value: "young", label: "< 65 ans", icon: UserRound, className: "bg-muted text-muted-foreground hover:bg-muted/80 border-muted" },
  ];

  const toggleFilter = (filter: { type: FilterType; value: FilterValue; label: string }) => {
    const exists = activeFilters.find(f => f.type === filter.type && f.value === filter.value);
    if (exists) {
      setActiveFilters(activeFilters.filter(f => !(f.type === filter.type && f.value === filter.value)));
    } else {
      // Remove other filters of the same type before adding
      const filtered = activeFilters.filter(f => f.type !== filter.type);
      setActiveFilters([...filtered, { type: filter.type, value: filter.value, label: filter.label }]);
    }
  };

  const clearFilters = () => setActiveFilters([]);

  const isFilterActive = (type: FilterType, value: FilterValue) => 
    activeFilters.some(f => f.type === type && f.value === value);

  const filteredPensioners = mockPensioners.filter((p) => {
    const matchesSearch =
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uniqueId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check all active filters
    const statusFilter = activeFilters.find(f => f.type === "status");
    const paymentFilter = activeFilters.find(f => f.type === "payment");
    const ageFilter = activeFilters.find(f => f.type === "age");

    const matchesStatus = !statusFilter || p.status === statusFilter.value;
    const matchesPayment = !paymentFilter || p.paymentMethod === paymentFilter.value;
    const matchesAge = !ageFilter || 
      (ageFilter.value === "senior" && p.age > 70) ||
      (ageFilter.value === "young" && p.age < 65);

    return matchesSearch && matchesStatus && matchesPayment && matchesAge;
  });

  const handleViewProfile = (pensioner: Pensioner) => {
    window.location.href = `/pensioners/${pensioner.id}`;
  };

  const handleQuickEdit = (pensioner: Pensioner) => {
    setSelectedPensioner(pensioner);
    setPaymentMethod(pensioner.paymentMethod);
    setIsEditModalOpen(true);
  };

  const handleSuspendPayment = (pensioner: Pensioner) => {
    setSelectedPensioner(pensioner);
    setIsSuspendDialogOpen(true);
  };

  const confirmSuspendPayment = () => {
    if (selectedPensioner) {
      toast({
        title: "Paiement suspendu",
        description: `Le paiement de ${selectedPensioner.firstName} ${selectedPensioner.lastName} a été suspendu.`,
      });
    }
    setIsSuspendDialogOpen(false);
    setSelectedPensioner(null);
  };

  const handleResendNotification = (pensioner: Pensioner) => {
    toast({
      title: "Notification envoyée",
      description: `Une notification a été renvoyée à ${pensioner.firstName} ${pensioner.lastName}.`,
    });
  };

  const saveQuickEdit = () => {
    toast({
      title: "Modifications enregistrées",
      description: "Les informations ont été mises à jour avec succès.",
    });
    setIsEditModalOpen(false);
    setSelectedPensioner(null);
  };

  // Visual indicators helpers
  const isPendingTooLong = (pensioner: Pensioner) => 
    pensioner.status === "pending" && pensioner.pendingSince && pensioner.pendingSince > 7;
  
  const needsSpecialAttention = (pensioner: Pensioner) => 
    pensioner.age > 70 || pensioner.hasDisability;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Pensionnés</h1>
          <p className="text-muted-foreground mt-1">Gérez les bénéficiaires et leurs informations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Pensionné
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl bg-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un Pensionné</DialogTitle>
              <DialogDescription>
                Remplissez les informations du nouveau bénéficiaire en 2 étapes
              </DialogDescription>
            </DialogHeader>
            <AddPensionerForm 
              onClose={() => setIsDialogOpen(false)} 
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters Bar with Tags */}
      <div className="bg-card rounded-xl border p-4 space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, prénom ou ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {filterTags.map((filter) => {
            const Icon = filter.icon;
            const isActive = isFilterActive(filter.type, filter.value);
            return (
              <Badge
                key={`${filter.type}-${filter.value}`}
                variant="outline"
                className={cn(
                  "cursor-pointer transition-all duration-200 px-3 py-1.5 text-sm font-medium",
                  isActive 
                    ? filter.className + " ring-2 ring-offset-2 ring-offset-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border-border"
                )}
                onClick={() => toggleFilter(filter)}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {filter.label}
              </Badge>
            );
          })}
          
          {activeFilters.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground h-7 px-2"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Effacer filtres
            </Button>
          )}
        </div>
      </div>

      {/* Pensioners Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Unique</th>
                <th>Bénéficiaire</th>
                <th>Âge</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPensioners.map((pensioner) => {
                const status = statusConfig[pensioner.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={pensioner.id}>
                    <td className="font-mono text-sm text-muted-foreground">
                      {pensioner.uniqueId}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-foreground">
                              {pensioner.firstName} {pensioner.lastName}
                            </p>
                            {/* Visual indicators */}
                            {isPendingTooLong(pensioner) && (
                              <span 
                                className="inline-flex items-center" 
                                title={`En attente depuis ${pensioner.pendingSince} jours`}
                              >
                                <Flame className="w-4 h-4 text-alert-critical animate-pulse" />
                              </span>
                            )}
                            {needsSpecialAttention(pensioner) && (
                              <span 
                                className="inline-flex items-center" 
                                title={pensioner.hasDisability ? "Attention particulière requise" : "Âge avancé (> 70 ans)"}
                              >
                                <UserRound className="w-4 h-4 text-alert-urgent" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Né le {new Date(pensioner.birthDate).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        "text-foreground",
                        pensioner.age > 70 && "font-semibold text-alert-urgent"
                      )}>
                        {pensioner.age} ans
                      </span>
                    </td>
                    <td className="font-semibold text-foreground">
                      {pensioner.amount.toLocaleString()} XOF
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {pensioner.paymentMethod === "mobile" ? (
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm text-foreground">
                            {pensioner.paymentMethod === "mobile" ? "Mobile" : "Banque"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                            {pensioner.paymentDetails}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className={cn("status-badge gap-1.5", status.className)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                        {pensioner.status === "pending" && pensioner.pendingSince && (
                          <span className="text-xs text-muted-foreground">
                            Depuis {pensioner.pendingSince}j
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover w-56">
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer"
                              onClick={() => handleViewProfile(pensioner)}
                            >
                              <Eye className="w-4 h-4" /> 
                              Voir Profil Détaillé
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer"
                              onClick={() => handleQuickEdit(pensioner)}
                            >
                              <Edit className="w-4 h-4" /> 
                              Modifier Informations Rapides
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer text-alert-warning"
                              onClick={() => handleSuspendPayment(pensioner)}
                            >
                              <PauseCircle className="w-4 h-4" /> 
                              Suspendre Paiement
                            </DropdownMenuItem>
                            {(pensioner.status === "pending" || pensioner.status === "rejected") && (
                              <DropdownMenuItem 
                                className="gap-2 cursor-pointer"
                                onClick={() => handleResendNotification(pensioner)}
                              >
                                <Bell className="w-4 h-4" /> 
                                Renvoyer Notification
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                              <Trash2 className="w-4 h-4" /> 
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Affichage de {filteredPensioners.length} sur {mockPensioners.length} pensionnés
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Modification Rapide</DialogTitle>
            <DialogDescription>
              {selectedPensioner && `${selectedPensioner.firstName} ${selectedPensioner.lastName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedPensioner && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Montant Pension (XOF)</Label>
                <Input 
                  id="edit-amount" 
                  type="number" 
                  defaultValue={selectedPensioner.amount} 
                />
              </div>
              <div className="space-y-3">
                <Label>Méthode de Paiement</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "mobile" | "bank")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="edit-mobile" />
                    <Label htmlFor="edit-mobile" className="font-normal cursor-pointer">
                      Mobile Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="edit-bank" />
                    <Label htmlFor="edit-bank" className="font-normal cursor-pointer">
                      Virement Bancaire
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentDetails">
                  {paymentMethod === "mobile" ? "Numéro de Téléphone" : "IBAN"}
                </Label>
                <Input
                  id="edit-paymentDetails"
                  defaultValue={selectedPensioner.paymentDetails}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveQuickEdit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Payment Confirmation */}
      <AlertDialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendre le paiement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir suspendre les paiements pour{" "}
              <strong>
                {selectedPensioner?.firstName} {selectedPensioner?.lastName}
              </strong>
              ? Cette action peut être annulée ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSuspendPayment}
              className="bg-alert-warning text-alert-warning-foreground hover:bg-alert-warning/90"
            >
              Suspendre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
