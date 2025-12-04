import { useState, useCallback, useMemo, useEffect, InputHTMLAttributes } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import generatePDF from "../layout/generatePDF";
// --- Configuration API ---
const PAYMENT_API_BASE_URL = "http://192.168.1.108:3001";
const PAYMENT_API_ENDPOINT = "/payments/batch";

// --- Définitions de types pour l'API ---
interface PaymentParty {
  displayName: string;
  idType: "MSISDN" | "IBAN" | "EMAIL";
  idValue: string;
}

interface PaymentRequest {
  from: PaymentParty;
  to: PaymentParty;
  montant: string;
  devise: string;
  note: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
  errorCode?: string;
}

// --- Mock UI Components for Standalone File (Inclus pour la complétude) ---
const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({ children, className, variant = "default", size = "default", ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={cn(baseStyle, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className, variant = "default" }) => {
  const baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive text-destructive-foreground",
  };
  return (
    <div className={cn(baseStyle, variants[variant], className)}>
      {children}
    </div>
  );
};

const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement> & { className?: string }) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

const Select = ({ value, onValueChange, children, disabled }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className="flex h-10 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
  </div>
);
const SelectTrigger = ({ children, className }) => <div className={className}>{children}</div>;
const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
const SelectContent = ({ children }) => <>{children}</>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;
// ChevronDown est déjà importé de lucide-react

// --- End Mock UI Components ---

// Updated status types to reflect payment states
interface UploadedRow {
  id: string;
  // Assurez-vous d'avoir les colonnes nécessaires pour le paiement
  FromDisplayName?: string | number; 
  valeur_id?: string | number;
  type_id?: string | number;
  montant?: string | number;
  devise?: string | number;
  Note?: string | number;
  
  [key: string]: string | number | undefined; // Permet d'autres colonnes dynamiques
  
  status: "valid" | "error" | "processing" | "success" | "failed"; // Removed 'pending' and added final states
  statusMessage?: string;
}

interface BatchFileUploadProps {
  onDataLoaded?: (data: UploadedRow[]) => void;
}

const ROWS_PER_PAGE_OPTIONS = [25, 50, 100, 200, 500];

/**
 * Fonction simulée pour appeler l'API de paiement
 * @param paymentData L'objet de données de paiement
 * @returns Le résultat de l'opération
 * 
 * 
 */
async function generateAndDownloadReceipt(result: any) {
    const endpoint = "http://127.0.0.1:5000/generate_receipt";

    // --- 1. Préparation des données pour l'API Flask ---
    
    // Le contrôleur Flask attend une structure { success: true, data: { ... transaction data ... } }.
    // Le contrôleur Flask attend également des champs de nom complets dans 'from' et 'to'.

    const transactionId = result.homeTransactionId || result.transactionId || 'no-id';
    
    // Assurez-vous que les données existent dans le 'result' de la première API
    const paymentData = result.data || result; // Utilisez 'data' si l'API l'encapsule, sinon utilisez le résultat direct
    
    if (!paymentData || paymentData.success === false) {
        console.warn("Impossible de générer le reçu : données de transaction invalides ou échec.");
        return;
    }

    // Reconstruction de la partie 'from' pour assurer la présence de la clé 'name'
    const senderDataForPDF = {
        name: paymentData.from.displayName || paymentData.from.name || "Expéditeur Inconnu",
        idType: paymentData.from.idType,
        idValue: paymentData.from.idValue,
    };

    // Reconstruction de la partie 'to' pour assurer la présence de firstName/lastName
    const receiverDataForPDF = {
        firstName: paymentData.to.firstName || paymentData.to.name || "Bénéficiaire", 
        middleName: paymentData.to.middleName || "", 
        lastName: paymentData.to.lastName || "",
        idType: paymentData.to.idType,
        idValue: paymentData.to.idValue,
    };
    
    // Construction de l'objet final que Flask attend
    const apiResponseToSend = {
        success: true,
        data: {
            homeTransactionId: transactionId,
            currentState: "COMPLETED", 
            initiatedTimestamp: paymentData.initiatedTimestamp || new Date().toISOString(),
            completedTimestamp: paymentData.completedTimestamp || new Date().toISOString(),
            
            from: senderDataForPDF,
            to: receiverDataForPDF,
            amount: paymentData.amount || paymentData.montant,
            currency: paymentData.currency || paymentData.devise,
            note: paymentData.note || null,
        }
    };
    
    // --- 2. Requête POST vers l'API Flask ---

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Envoi de l'objet préparé
            body: JSON.stringify(apiResponseToSend) 
        });

        // 3. Vérification de la réponse HTTP
        if (!response.ok) {
            const errorText = await response.json().catch(() => response.text());
            throw new Error(`Erreur HTTP ${response.status}: ${JSON.stringify(errorText)}`);
        }

        // 4. Récupération des informations sur le fichier
        let filename = `recu_transaction_${transactionId}.pdf`; 
        const disposition = response.headers.get('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameMatch = disposition.match(/filename="(.+)"/i);
            if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1];
            }
        }

        // 5. Téléchargement
        const pdfBlob = await response.blob();
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log(`✅ Fichier PDF téléchargé avec succès : ${filename}`);

    } catch (error) {
        console.error("❌ Échec de la génération ou du téléchargement du PDF :", error);
        alert(`Impossible de générer le reçu. Détails : ${error.message}`);
    }
}
const simulateBatchPaymentAPI = async (paymentData: any): Promise<any> => {
    
    try {
        const response = await fetch(`${PAYMENT_API_BASE_URL}${PAYMENT_API_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            throw new Error('Erreur réseau');
        }

        const result = await response.json();
        
        // Appel de la fonction définie à l'extérieur
        generateAndDownloadReceipt(result); 
        
        return result;

    } catch (error) {
        return { success: false, transactionId: '', message: error.message || "Erreur de la couche réseau", errorCode: "NETWORK_ERROR" };
    }
    
};


export default function BatchFileUpload({ onDataLoaded }: BatchFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<UploadedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  // Filter can now include 'success' and 'failed'
  const [statusFilter, setStatusFilter] = useState<string>("all"); 

  // Payment process states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "in_progress" | "completed" | "failed">("idle");

  // Helper function to update a single row's status
  const updateRowStatus = useCallback((rowId: string, newStatus: UploadedRow['status'], message?: string) => {
    setData(currentData =>
      currentData.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            status: newStatus,
            statusMessage: message || row.statusMessage,
          };
        }
        return row;
      })
    );
  }, []);

  const REQUIRED_FIELDS = ["valeur_id", "type_id", "montant", "devise"];

  const validateRow = (row: Record<string, string | number>): { isValid: boolean, message: string } => {
    const missingFields = REQUIRED_FIELDS.filter(field => !row[field] || String(row[field]).trim() === "");
    
    if (missingFields.length > 0) {
      return { 
        isValid: false, 
        message: `Champs manquants: ${missingFields.join(", ")}` 
      };
    }
    
    // Basic format validation (example: montant must be a valid number string)
    if (isNaN(Number(row.montant))) {
      return { 
        isValid: false, 
        message: "Montant (montant) invalide." 
      };
    }

    return { isValid: true, message: "Prêt pour le paiement" };
  };

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setPaymentStatus("idle"); 
    
    // Reset data to prevent mixing files
    setData([]);
    setColumns([]);

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      let jsonData: Record<string, string | number>[] = [];

      // ... (Logique de lecture CSV/Excel inchangée) ...
      if (fileExtension === "csv") {
        const results = await new Promise<Papa.ParseResult<Record<string, string>>>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: resolve,
            error: reject,
          });
        });
        jsonData = results.data as Record<string, string | number>[];
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet);
      } else {
        setError("Format de fichier non supporté. Utilisez CSV ou Excel (.xlsx, .xls)");
        setIsLoading(false);
        return;
      }
      // ... (Fin de la logique de lecture CSV/Excel inchangée) ...

      if (jsonData.length === 0) {
        setError("Le fichier est vide");
        setIsLoading(false);
        return;
      }
      
      const cols = Object.keys(jsonData[0]).filter(
        (col) => col !== "status" && col !== "statusMessage" && col !== "id"
      );
      setColumns(cols);

      const processedData: UploadedRow[] = jsonData.map((row, index) => {
        const validationResult = validateRow(row);
        return {
          ...row,
          id: `row-${index + 1}`,
          status: validationResult.isValid ? "valid" : "error",
          statusMessage: validationResult.message,
        } as UploadedRow;
      });

      setData(processedData);
      setCurrentPage(1);
      onDataLoaded?.(processedData);
      setIsLoading(false);

    } catch (err) {
      setError(`Erreur lors du traitement du fichier: ${err instanceof Error ? err.message : "Erreur inconnue"}`);
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  // Handler for file interactions (drag/drop/select) - inchangé
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        setFile(droppedFile);
        processFile(droppedFile);
      }
    },
    [processFile]
  );
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        processFile(selectedFile);
      }
    },
    [processFile]
  );
  
  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setData([]);
    setColumns([]);
    setError(null);
    setCurrentPage(1);
    setIsProcessing(false);
    setPaymentProgress(0);
    setPaymentStatus("idle");
    setSearchQuery("");
    setStatusFilter("all");
  }, []);
  
  // CORE LOGIC CHANGE: Sequential processing and status update with API call
  const handleLaunchPayment = useCallback(async () => {
    // Ne considérer que les lignes qui n'ont pas d'erreur de données et qui ne sont pas déjà traitées
    const rowsToProcess = data.filter((r) => r.status === "valid" || r.status === "processing");

    if (rowsToProcess.length === 0 || isProcessing) return;

    // Reset progress/status and start
    setPaymentProgress(0);
    setPaymentStatus("in_progress");
    setIsProcessing(true);

    let failedCount = 0;

    for (let i = 0; i < rowsToProcess.length; i++) {
        const row = rowsToProcess[i];
        
        // 1. Update status to 'processing'
        updateRowStatus(row.id, "processing", "Soumission du paiement à l'API...");
        
        // Construire l'objet de requête API
        const paymentPayload: PaymentRequest = {
            from: { 
                displayName:"John Doe", 
                idType: "MSISDN", // Simplification: assume MSISDN for sender
                idValue: "22912345678"// MSISDN or other ID
            },
            to: { 
                idType: String(row.type_id), // Simplification: assume MSISDN for receiver
                idValue: String(row.valeur_id) 
            },
            amount: String(row.montant),
            currency: String(row.devise || "USD"),
            note: 'test',
        };

        let result: PaymentResponse;
        
        try {
            // 2. Appel de l'API simulée
            // Ajout d'un délai pour simuler une transaction réseau
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500)); 
            
            result = await simulateBatchPaymentAPI(paymentPayload);

        } catch (err) {
            // Échec réseau ou erreur inattendue
            result = {
                success: false,
                transactionId: '',
                message: `Erreur inattendue: ${err instanceof Error ? err.message : "Inconnue"}`,
                errorCode: "CLIENT_ERROR"
            };
        }
        
        // 3. Traiter la réponse et mettre à jour le statut
        const newStatus: UploadedRow['status'] = result.success ? "success" : "failed";
        const message = result.success 
            ? `Paiement réussi (Réf: ${result.transactionId})` 
            : `Échec: ${result.message} (Code: ${result.errorCode || 'N/A'})`;
        
        if (!result.success) {
          failedCount++;
        }

        // 4. Update to final status
        updateRowStatus(row.id, newStatus, message);

        // Update overall progress bar
        const progress = ((i + 1) / rowsToProcess.length) * 100;
        setPaymentProgress(progress);
    }

    // Final status update
    setIsProcessing(false);
    setPaymentStatus(failedCount > 0 ? "failed" : "completed"); 
  }, [data, isProcessing, updateRowStatus]);

  // Filtered and paginated data (inchangé)
  const validCount = data.filter((r) => r.status === "valid").length;
  const initialErrorCount = data.filter((r) => r.status === "error").length;
  const successCount = data.filter((r) => r.status === "success").length;
  const paymentFailedCount = data.filter((r) => r.status === "failed").length;

  const filteredData = useMemo(() => {
    let filtered = data;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(query)
        )
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((row) => row.status === statusFilter);
    }
    return filtered;
  }, [data, searchQuery, statusFilter]);
  
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const statusConfig: Record<UploadedRow['status'], { icon: any, label: string, className: string }> = {
    valid: { icon: CheckCircle, label: "Prêt", className: "text-primary bg-primary/10" },
    error: { icon: AlertTriangle, label: "Erreur Données", className: "text-destructive bg-destructive/10" },
    processing: { icon: Loader2, label: "En Cours", className: "text-blue-600 bg-blue-100 animate-spin" },
    success: { icon: CheckCircle, label: "Succès", className: "text-green-600 bg-green-100" },
    failed: { icon: Ban, label: "Échec Paiement", className: "text-red-600 bg-red-100" },
  };

  const currentPaymentStatus = useMemo(() => {
    if (paymentStatus === "in_progress") return { label: "Traitement en cours...", color: "text-blue-600 bg-blue-100" };
    if (paymentStatus === "completed") return { label: "Complété", color: "text-green-600 bg-green-100" };
    if (paymentStatus === "failed") return { label: "Terminé avec erreurs", color: "text-red-600 bg-red-100" };
    return { label: "Prêt", color: "text-gray-600 bg-gray-100" };
  }, [paymentStatus]);

  const totalProcessed = successCount + paymentFailedCount;
  const totalToProcess = data.filter(r => r.status !== 'error').length;


  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xl font-inter">
      <h1 className="text-3xl font-bold text-gray-800 border-b pb-3 mb-6">Traitement de Paiements par Lot</h1>

      {/* Upload Zone */}
      {!file && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer",
            isDragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Glisser-déposer un fichier CSV ou Excel
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                ou cliquez pour sélectionner un fichier
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Formats supportés: .csv, .xlsx, .xls</span>
            </div>
            <p className="text-xs text-indigo-500 mt-2 font-medium">
                Champs requis : **valeur_id, type_id, montant, devise**
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-card border rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Analyse du fichier en cours...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-700">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="ml-auto text-red-600 hover:bg-red-100">
              Réessayer
            </Button>
          </div>
        </div>
      )}

      {/* File Info & Stats */}
      {file && data.length > 0 && !isLoading && (
        <>
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {data.length.toLocaleString()} lignes | {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                  {/* Initial Validation Status */}
                  <Badge className="bg-green-100 text-green-700 font-semibold">
                      <CheckCircle className="w-3 h-3 mr-1" /> {validCount.toLocaleString()} Prêts
                  </Badge>
                  {initialErrorCount > 0 && (
                      <Badge variant="destructive" className="bg-red-100 text-red-700 font-semibold">
                          <AlertTriangle className="w-3 h-3 mr-1" /> {initialErrorCount.toLocaleString()} Erreurs Données
                      </Badge>
                  )}

                  {/* Payment Status (if processing started) */}
                  {totalProcessed > 0 && (
                      <Badge className="bg-gray-100 text-gray-700 font-semibold">
                          {successCount.toLocaleString()} Succès / {paymentFailedCount.toLocaleString()} Échecs
                      </Badge>
                  )}
              </div>

            </div>
          </div>
          
          {/* Action Buttons & Status */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 shadow-sm space-y-4">
            
            {/* Status Display */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm font-medium">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-700">Statut de la Tâche:</span>
                    <Badge className={cn("capitalize font-semibold", currentPaymentStatus.color)}>
                        {currentPaymentStatus.label}
                    </Badge>
                    {isProcessing && (
                      <span className="text-sm font-normal text-gray-500 ml-auto">
                        Traitement de {totalProcessed} sur {totalToProcess} lignes...
                      </span>
                    )}
                </div>

                {(paymentStatus === "in_progress" || paymentStatus === "completed" || paymentStatus === "failed") && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${paymentProgress}%` }}
                        ></div>
                    </div>
                )}
                {paymentStatus === "completed" && (
                    <p className="text-sm text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4 inline mr-1" /> {successCount.toLocaleString()} paiements traités avec succès.
                    </p>
                )}
                {paymentStatus === "failed" && (
                    <p className="text-sm text-red-700 font-medium">
                        <AlertTriangle className="w-4 h-4 inline mr-1" /> Tâche terminée. **{paymentFailedCount.toLocaleString()}** paiements ont échoué.
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2 border-t border-indigo-100">
              <Button
                variant="outline"
                onClick={handleRemoveFile} 
                disabled={isProcessing}
                className="hover:bg-red-100 text-red-600 border-red-300"
              >
                <X className="w-4 h-4 mr-2" /> Réinitialiser
              </Button>
              <Button
                onClick={handleLaunchPayment}
                disabled={validCount === 0 || isProcessing || paymentStatus === "completed"}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Traitement...
                  </div>
                ) : (
                  "Lancer Paiement du Lot"
                )}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-3 rounded-lg border">
            <div className="flex-1">
              <Input
                placeholder="Rechercher dans les données..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={isProcessing}
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} 
              disabled={isProcessing}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous ({data.length})</SelectItem>
                <SelectItem value="valid">Prêts ({validCount})</SelectItem>
                <SelectItem value="error">Erreurs Données ({initialErrorCount})</SelectItem>
                <SelectItem value="processing">En Cours ({data.filter(r => r.status === 'processing').length})</SelectItem>
                <SelectItem value="success">Succès Paiement ({successCount})</SelectItem>
                <SelectItem value="failed">Échec Paiement ({paymentFailedCount})</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }} disabled={isProcessing}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Lignes par page" />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt} lignes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Data Table */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-lg">
            {filteredData.length === 0 ? (
                <div className="text-center p-12 text-gray-500">
                    Aucune ligne trouvée pour les filtres actuels.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-100/70 sticky top-0">
                            <tr>
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase w-[50px]">#</th>
                                {columns.map((col) => (
                                    <th key={col} className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase min-w-[150px]">
                                        {col}
                                    </th>
                                ))}
                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase w-[150px]">Statut</th>
                                <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase w-[100px]">Détails</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row, idx) => {
                                const status = statusConfig[row.status];
                                const StatusIcon = status.icon;
                                const rowNumber = (currentPage - 1) * rowsPerPage + idx + 1;
                                return (
                                    <tr key={row.id} className="border-b last:border-b-0 hover:bg-indigo-50/50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-500">{rowNumber}</td>
                                        {columns.map((col) => (
                                            <td key={col} className="py-3 px-4 text-sm text-gray-800 max-w-[200px] truncate">
                                                {String(row[col] ?? "")}
                                            </td>
                                        ))}
                                        <td className="py-3 px-4">
                                            <span 
                                                className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap", row.status === 'processing' ? 'text-blue-600 bg-blue-100' : status.className)}
                                            >
                                                <StatusIcon className={cn("w-3.5 h-3.5", row.status === 'processing' && 'animate-spin')} />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-center gap-2">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-indigo-500 hover:bg-indigo-100" title={row.statusMessage}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 rounded-b-xl">
              <div className="text-sm text-gray-600">
                Affichage {((currentPage - 1) * rowsPerPage + 1).toLocaleString()} -{" "}
                {Math.min(currentPage * rowsPerPage, filteredData.length).toLocaleString()} sur{" "}
                {filteredData.length.toLocaleString()} lignes filtrées
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className=""
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isProcessing}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                    {/* Simplified Pagination rendering */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
                      .map((pageNum, index, arr) => {
                          const showEllipsis = index > 0 && pageNum > arr[index - 1] + 1;
                          return (
                              <div key={pageNum} className="flex items-center gap-1">
                                  {showEllipsis && <span className="text-gray-400">...</span>}
                                  <Button
                                      variant={currentPage === pageNum ? "default" : "ghost"}
                                      size="sm"
                                      className="w-8 h-8 p-0"
                                      onClick={() => setCurrentPage(pageNum)}
                                      disabled={isProcessing}
                                  >
                                      {pageNum}
                                  </Button>
                              </div>
                          );
                      })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className=""
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isProcessing}
                >
                  Suivant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}