import { useState } from "react";
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  User,
  CreditCard,
  FileText,
  Check,
  Smartphone,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AddPensionerFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  // Step 1: Identity
  firstName: string;
  lastName: string;
  uniqueId: string;
  birthDate: string;
  amount: string;
  // Step 2: Address
  street: string;
  city: string;
  region: string;
  // Step 2: Payment
  paymentMethod: "mobile" | "bank";
  mobileOperator: string;
  mobileNumber: string;
  bankName: string;
  iban: string;
  // Step 2: Documents
  birthCertificate: File | null;
  identityDocument: File | null;
  lifeCertificate: File | null;
  // Hidden field
  createdBy: string;
}

const mobileOperators = [
  { value: "orange", label: "Orange Money" },
  { value: "mtn", label: "MTN Mobile Money" },
  { value: "moov", label: "Moov Money" },
  { value: "celtiis", label: "Celtiis Cash" },
];

const regions = [
  { value: "alibori", label: "Alibori" },
  { value: "atacora", label: "Atacora" },
  { value: "atlantique", label: "Atlantique" },
  { value: "borgou", label: "Borgou" },
  { value: "collines", label: "Collines" },
  { value: "couffo", label: "Couffo" },
  { value: "donga", label: "Donga" },
  { value: "littoral", label: "Littoral" },
  { value: "mono", label: "Mono" },
  { value: "oueme", label: "Ouémé" },
  { value: "plateau", label: "Plateau" },
  { value: "zou", label: "Zou" },
];

export default function AddPensionerForm({ onClose, onSuccess }: AddPensionerFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    uniqueId: "",
    birthDate: "",
    amount: "",
    street: "",
    city: "",
    region: "",
    paymentMethod: "mobile",
    mobileOperator: "",
    mobileNumber: "",
    bankName: "",
    iban: "",
    birthCertificate: null,
    identityDocument: null,
    lifeCertificate: null,
    createdBy: "Agent-001", // Would come from auth context in real app
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(formData.birthDate);
  const isEligible = age >= 60;

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "La date de naissance est requise";
    } else if (!isEligible) {
      newErrors.birthDate = "Le bénéficiaire doit avoir au moins 60 ans";
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Le montant doit être supérieur à 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.street.trim()) {
      newErrors.street = "L'adresse est requise";
    }
    if (!formData.city.trim()) {
      newErrors.city = "La ville est requise";
    }
    if (!formData.region) {
      newErrors.region = "La région est requise";
    }

    if (formData.paymentMethod === "mobile") {
      if (!formData.mobileOperator) {
        newErrors.mobileOperator = "L'opérateur est requis";
      }
      if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = "Le numéro est requis";
      }
    } else {
      if (!formData.bankName.trim()) {
        newErrors.bankName = "Le nom de la banque est requis";
      }
      if (!formData.iban.trim()) {
        newErrors.iban = "L'IBAN est requis";
      }
    }

    if (!formData.identityDocument) {
      newErrors.identityDocument = "La pièce d'identité est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep2()) {
      toast({
        title: "Pensionné ajouté",
        description: `${formData.firstName} ${formData.lastName} a été enregistré avec succès.`,
      });
      onSuccess?.();
      onClose();
    }
  };

  const handleFileChange = (field: "birthCertificate" | "identityDocument" | "lifeCertificate") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, [field]: file });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            currentStep === 1
              ? "bg-primary text-primary-foreground"
              : "bg-primary/20 text-primary"
          )}
        >
          {currentStep > 1 ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
          <span className="hidden sm:inline">Identité & Calcul</span>
          <span className="sm:hidden">1</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            currentStep === 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Paiement & Pièces</span>
          <span className="sm:hidden">2</span>
        </div>
      </div>

      {/* Step 1: Identity & Calculation */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Ex: Kokou"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Ex: Mensah"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="uniqueId">ID Unique (optionnel)</Label>
              <Input
                id="uniqueId"
                placeholder="Auto-généré si vide"
                value={formData.uniqueId}
                onChange={(e) => updateField("uniqueId", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Laissez vide pour générer automatiquement
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">
                Date de Naissance <span className="text-destructive">*</span>
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)}
                className={errors.birthDate ? "border-destructive" : ""}
              />
              {errors.birthDate && (
                <p className="text-xs text-destructive">{errors.birthDate}</p>
              )}
            </div>
          </div>

          {/* Age & Eligibility Display */}
          {formData.birthDate && (
            <div
              className={cn(
                "p-3 rounded-lg border flex items-center gap-3",
                isEligible
                  ? "bg-primary/10 border-primary/20"
                  : "bg-destructive/10 border-destructive/20"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                  isEligible ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
                )}
              >
                {age}
              </div>
              <div>
                <p className={cn("font-medium", isEligible ? "text-primary" : "text-destructive")}>
                  {isEligible ? "Éligible" : "Non éligible"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isEligible
                    ? "Le bénéficiaire remplit le critère d'âge"
                    : "Le bénéficiaire doit avoir au moins 60 ans"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">
              Montant Pension (XOF) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 85000"
              value={formData.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Payment & Documents */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fade-in">
          {/* Address Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Adresse Complète
            </h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="street">
                  Rue / Quartier <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="street"
                  placeholder="Ex: Quartier Zongo, Rue 123"
                  value={formData.street}
                  onChange={(e) => updateField("street", e.target.value)}
                  className={errors.street ? "border-destructive" : ""}
                />
                {errors.street && (
                  <p className="text-xs text-destructive">{errors.street}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    Ville <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="Ex: Cotonou"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">
                    Région <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => updateField("region", value)}
                  >
                    <SelectTrigger className={errors.region ? "border-destructive" : ""}>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.region && (
                    <p className="text-xs text-destructive">{errors.region}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Méthode de Paiement
            </h4>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(v) => updateField("paymentMethod", v)}
              className="flex gap-4"
            >
              <div
                className={cn(
                  "flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                  formData.paymentMethod === "mobile"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                )}
                onClick={() => updateField("paymentMethod", "mobile")}
              >
                <RadioGroupItem value="mobile" id="mobile" />
                <Smartphone className="w-5 h-5 text-primary" />
                <Label htmlFor="mobile" className="font-normal cursor-pointer flex-1">
                  Mobile Money
                </Label>
              </div>
              <div
                className={cn(
                  "flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                  formData.paymentMethod === "bank"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                )}
                onClick={() => updateField("paymentMethod", "bank")}
              >
                <RadioGroupItem value="bank" id="bank" />
                <Building2 className="w-5 h-5 text-primary" />
                <Label htmlFor="bank" className="font-normal cursor-pointer flex-1">
                  Banque
                </Label>
              </div>
            </RadioGroup>

            {/* Conditional Payment Fields */}
            {formData.paymentMethod === "mobile" ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="mobileOperator">
                    Opérateur <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.mobileOperator}
                    onValueChange={(value) => updateField("mobileOperator", value)}
                  >
                    <SelectTrigger className={errors.mobileOperator ? "border-destructive" : ""}>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mobileOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.mobileOperator && (
                    <p className="text-xs text-destructive">{errors.mobileOperator}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">
                    Numéro <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mobileNumber"
                    placeholder="+229 XX XX XX XX"
                    value={formData.mobileNumber}
                    onChange={(e) => updateField("mobileNumber", e.target.value)}
                    className={errors.mobileNumber ? "border-destructive" : ""}
                  />
                  {errors.mobileNumber && (
                    <p className="text-xs text-destructive">{errors.mobileNumber}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="bankName">
                    Nom de la Banque <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bankName"
                    placeholder="Ex: BOA Bénin"
                    value={formData.bankName}
                    onChange={(e) => updateField("bankName", e.target.value)}
                    className={errors.bankName ? "border-destructive" : ""}
                  />
                  {errors.bankName && (
                    <p className="text-xs text-destructive">{errors.bankName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">
                    IBAN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="iban"
                    placeholder="BJ02 XXXX XXXX..."
                    value={formData.iban}
                    onChange={(e) => updateField("iban", e.target.value)}
                    className={errors.iban ? "border-destructive" : ""}
                  />
                  {errors.iban && (
                    <p className="text-xs text-destructive">{errors.iban}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pièces Justificatives
            </h4>
            <div className="grid gap-3">
              {/* Identity Document - Required */}
              <div className="space-y-2">
                <Label>
                  Pièce d'Identité <span className="text-destructive">*</span>
                </Label>
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-4 transition-colors",
                    formData.identityDocument
                      ? "border-primary bg-primary/5"
                      : errors.identityDocument
                      ? "border-destructive bg-destructive/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange("identityDocument")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      formData.identityDocument ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {formData.identityDocument ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      {formData.identityDocument ? (
                        <>
                          <p className="text-sm font-medium text-foreground">
                            {formData.identityDocument.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cliquez pour changer
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-foreground">
                            Télécharger la pièce d'identité
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPG ou PNG (max 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {errors.identityDocument && (
                  <p className="text-xs text-destructive">{errors.identityDocument}</p>
                )}
              </div>

              {/* Birth Certificate - Optional */}
              <div className="space-y-2">
                <Label>Certificat de Naissance (optionnel)</Label>
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-3 transition-colors",
                    formData.birthCertificate
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange("birthCertificate")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded flex items-center justify-center",
                      formData.birthCertificate ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {formData.birthCertificate ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Upload className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">
                      {formData.birthCertificate?.name || "Certificat de naissance"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Life Certificate - Optional */}
              <div className="space-y-2">
                <Label>Certificat de Vie (optionnel)</Label>
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-3 transition-colors",
                    formData.lifeCertificate
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange("lifeCertificate")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded flex items-center justify-center",
                      formData.lifeCertificate ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {formData.lifeCertificate ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Upload className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">
                      {formData.lifeCertificate?.name || "Certificat de vie"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Source Info (Hidden but shown for transparency) */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Source du dossier:</span> {formData.createdBy} • {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        {currentStep === 1 ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleNext} disabled={!isEligible && formData.birthDate !== ""}>
              Continuer
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Retour
            </Button>
            <Button onClick={handleSubmit}>
              Enregistrer & Notifier
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
