import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  MapPin,
  Building2,
  Smartphone,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: "success" | "failed" | "pending";
  batchId: string;
  reference: string;
}

interface AuditEntry {
  id: string;
  action: string;
  agent: string;
  date: string;
  details: string;
}

interface Document {
  id: string;
  type: string;
  name: string;
  uploadDate: string;
  status: "approved" | "pending" | "rejected";
  url: string;
}

// Mock data - in real app, this would come from an API
const mockPensionerData = {
  id: "1",
  uniqueId: "BN-2024-00145",
  firstName: "Kokou",
  lastName: "Mensah",
  birthDate: "1958-03-15",
  age: 66,
  amount: 85000,
  paymentMethod: "mobile" as const,
  mobileOperator: "Orange Money",
  mobileNumber: "+229 97 00 00 01",
  bankName: "",
  iban: "",
  street: "Avenue Jean-Paul II",
  city: "Cotonou",
  region: "Littoral",
  status: "approved" as const,
  createdAt: "2024-01-15",
  createdBy: "Agent Marie Dupont",
  documents: [
    {
      id: "1",
      type: "Certificat de Naissance",
      name: "cert_naissance_mensah.pdf",
      uploadDate: "2024-01-15",
      status: "approved" as const,
      url: "#",
    },
    {
      id: "2",
      type: "Pièce d'Identité",
      name: "cni_mensah.pdf",
      uploadDate: "2024-01-15",
      status: "approved" as const,
      url: "#",
    },
    {
      id: "3",
      type: "Certificat de Vie",
      name: "cert_vie_mensah.pdf",
      uploadDate: "2024-01-15",
      status: "approved" as const,
      url: "#",
    },
  ],
  payments: [
    {
      id: "1",
      date: "2024-11-01",
      amount: 85000,
      status: "success" as const,
      batchId: "LOT-NOV-2024",
      reference: "REF-202411-00145",
    },
    {
      id: "2",
      date: "2024-10-01",
      amount: 85000,
      status: "success" as const,
      batchId: "LOT-OCT-2024",
      reference: "REF-202410-00145",
    },
    {
      id: "3",
      date: "2024-09-01",
      amount: 85000,
      status: "success" as const,
      batchId: "LOT-SEP-2024",
      reference: "REF-202409-00145",
    },
  ],
  auditHistory: [
    {
      id: "1",
      action: "Dossier approuvé",
      agent: "Validateur Jean Martin",
      date: "2024-01-16 10:30",
      details: "Tous les documents validés",
    },
    {
      id: "2",
      action: "Documents téléchargés",
      agent: "Agent Marie Dupont",
      date: "2024-01-15 14:20",
      details: "3 documents ajoutés",
    },
    {
      id: "3",
      action: "Dossier créé",
      agent: "Agent Marie Dupont",
      date: "2024-01-15 14:15",
      details: "Nouveau bénéficiaire enregistré",
    },
  ],
};

const statusConfig = {
  approved: {
    icon: CheckCircle,
    label: "Approuvé",
    className: "bg-primary/10 text-primary",
  },
  pending: {
    icon: Clock,
    label: "En attente",
    className: "bg-alert-warning/10 text-alert-warning",
  },
  rejected: {
    icon: XCircle,
    label: "Rejeté",
    className: "bg-destructive/10 text-destructive",
  },
};

const paymentStatusConfig = {
  success: {
    icon: CheckCircle,
    label: "Succès",
    className: "bg-primary/10 text-primary",
  },
  failed: {
    icon: XCircle,
    label: "Échec",
    className: "bg-destructive/10 text-destructive",
  },
  pending: {
    icon: Clock,
    label: "En cours",
    className: "bg-alert-warning/10 text-alert-warning",
  },
};

export default function PensionerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pensioner] = useState(mockPensionerData);

  const status = statusConfig[pensioner.status];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/pensioners")}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {pensioner.firstName} {pensioner.lastName}
          </h1>
          <p className="text-muted-foreground mt-1">
            ID: {pensioner.uniqueId}
          </p>
        </div>
        <Badge className={cn("gap-1.5", status.className)}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Prénom</p>
                  <p className="font-medium">{pensioner.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nom</p>
                  <p className="font-medium">{pensioner.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Date de Naissance
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">
                      {new Date(pensioner.birthDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Âge</p>
                  <p className="font-medium">{pensioner.age} ans</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-3">Adresse Complète</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{pensioner.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {pensioner.city}, {pensioner.region}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Informations de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Montant Mensuel
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {pensioner.amount.toLocaleString()} XOF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Méthode de Paiement
                  </p>
                  <div className="flex items-center gap-2">
                    {pensioner.paymentMethod === "mobile" ? (
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    )}
                    <p className="font-medium">
                      {pensioner.paymentMethod === "mobile"
                        ? "Mobile Money"
                        : "Virement Bancaire"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {pensioner.paymentMethod === "mobile" ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Opérateur</p>
                    <p className="font-medium">{pensioner.mobileOperator}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Numéro Mobile Money
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="font-mono font-medium">
                        {pensioner.mobileNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Banque</p>
                    <p className="font-medium">{pensioner.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">IBAN</p>
                    <p className="font-mono font-medium">{pensioner.iban}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des Paiements</CardTitle>
              <CardDescription>
                Liste des versements effectués pour ce bénéficiaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pensioner.payments.map((payment) => {
                    const paymentStatus = paymentStatusConfig[payment.status];
                    const PaymentStatusIcon = paymentStatus.icon;
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.date).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.batchId}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {payment.reference}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {payment.amount.toLocaleString()} XOF
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("gap-1.5", paymentStatus.className)}
                          >
                            <PaymentStatusIcon className="w-3 h-3" />
                            {paymentStatus.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Documents & Audit */}
        <div className="space-y-6">
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Pièces Justificatives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pensioner.documents.map((doc) => {
                const docStatus = statusConfig[doc.status];
                const DocStatusIcon = docStatus.icon;
                return (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.type}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={cn("text-xs gap-1", docStatus.className)}
                        >
                          <DocStatusIcon className="w-2.5 h-2.5" />
                          {docStatus.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.uploadDate).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Creation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Informations du Dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date de Création</p>
                <p className="font-medium">
                  {new Date(pensioner.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Créé Par</p>
                <p className="font-medium">{pensioner.createdBy}</p>
              </div>
            </CardContent>
          </Card>

          {/* Audit History */}
          <Card>
            <CardHeader>
              <CardTitle>Historique d'Audit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pensioner.auditHistory.map((entry, index) => (
                  <div key={entry.id} className="relative">
                    {index !== pensioner.auditHistory.length - 1 && (
                      <div className="absolute left-2 top-8 bottom-0 w-px bg-border" />
                    )}
                    <div className="flex gap-3">
                      <div className="w-4 h-4 rounded-full bg-primary mt-1 ring-4 ring-background relative z-10" />
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-sm text-foreground">
                          {entry.action}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.agent}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.date}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.details}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
