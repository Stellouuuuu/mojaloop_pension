// types.ts

/**
 * Définit les statuts possibles pour une transaction individuelle (Payment).
 * 'success': Paiement complété avec succès.
 * 'pending': Paiement en cours de traitement.
 * 'failed': Paiement ayant échoué.
 */
export type PaymentStatus = 'success' | 'pending' | 'failed';

/**
 * Définit les statuts possibles pour l'ensemble d'un Lot (Batch).
 * 'completed': Toutes les transactions du lot ont réussi.
 * 'partial': Certaines transactions ont réussi et d'autres ont échoué/sont en attente.
 * 'failed': Toutes les transactions du lot ont échoué.
 */
export type BatchStatus = 'completed' | 'partial' | 'failed';

// --- Interface pour une Transaction (Paiement) ---

/**
 * Représente les détails d'une transaction unique au sein d'un lot.
 */
export interface Payment {
  transactionId: string; // ID unique de la transaction
  pensionerName: string; // Nom du bénéficiaire
  pensionerId: string; // ID du bénéficiaire (ex: numéro de pension)
  amount: number; // Montant du paiement (en unités monétaires de base)
  currency: string; // Devise (ex: 'XOF')
  dfsp: string; // Opérateur financier (Digital Financial Service Provider, ex: 'MTN', 'Moov')
  timestamp: string; // Date et heure de la transaction
  status: PaymentStatus; // Statut de la transaction
  errorCode?: string; // Code d'erreur en cas d'échec (optionnel)
  errorMessage?: string; // Message d'erreur détaillé (optionnel)
}

// --- Interface pour un Lot de Paiement ---

/**
 * Représente un lot de transactions envoyé pour traitement.
 */
export interface Batch {
  batchId: string; // ID unique du lot
  batchCode: string; // Code de référence du lot
  date: string; // Date de création/traitement du lot
  totalAmount: number; // Montant total de toutes les transactions du lot
  currency: string; // Devise de toutes les transactions
  totalCount: number; // Nombre total de transactions dans le lot
  successCount: number; // Nombre de transactions réussies
  failedCount: number; // Nombre de transactions échouées
  status: BatchStatus; // Statut global du lot
  initiatedBy: string; // Utilisateur ou système ayant initié le lot
  payments: Payment[]; // Liste détaillée des transactions individuelles du lot
}