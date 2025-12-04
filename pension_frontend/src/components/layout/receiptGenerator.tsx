// receiptGenerator.ts
import PDFDocument from "pdfkit";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export interface PartyInfo {
  displayName?: string;
  idType?: string;
  idValue?: string;
}

export interface MojaloopInfo {
  quoteId?: string;
  transferId?: string;
  error?: { code: string; description: string } | null;
}

export interface ReceiptData {
  receiptId?: string;
  timestamp?: string;
  status?: string;
  from: PartyInfo;
  to: PartyInfo;
  amount: string | number;
  currency: string;
  note?: string;
  mojaloop?: MojaloopInfo;
}

export interface ReceiptResult {
  receiptId: string;
  filePath: string;       // Chemin physique
  publicUrl: string;      // URL pour accéder depuis navigateur
  receipt: ReceiptData;
}

export async function createReceiptAndPdf(
  receiptData: ReceiptData
): Promise<ReceiptResult> {

  // 📌 Dossier final :  /public/receipts
  const outputDir = path.join(process.cwd(), "public", "receipts");
  await fs.ensureDir(outputDir);

  const receiptId =
    receiptData.receiptId ||
    `RCP-${new Date().toISOString().slice(0, 10)}-${uuidv4().slice(0, 8)}`;

  const timestamp = receiptData.timestamp || new Date().toISOString();

  const fileName = `${receiptId}.pdf`;
  const filePath = path.join(outputDir, fileName);

  const r: ReceiptData = {
    receiptId,
    timestamp,
    ...receiptData,
  };

  // ---- PDF ----
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).text("Reçu de Paiement", { align: "center" });
  doc.moveDown(0.5);

  doc.fontSize(10).text(`Receipt ID: ${r.receiptId}`);
  doc.text(`Date: ${r.timestamp}`);
  doc.text(`Status: ${r.status}`);
  doc.moveDown();

  // From
  doc.fontSize(12).text("Payeur (From):", { underline: true });
  doc.fontSize(10).text(`${r.from?.displayName || ""}`);
  doc.text(`${r.from?.idType || ""}: ${r.from?.idValue || ""}`);
  doc.moveDown();

  // To
  doc.fontSize(12).text("Bénéficiaire (To):", { underline: true });
  doc.fontSize(10).text(`${r.to?.idType || ""}: ${r.to?.idValue || ""}`);
  doc.moveDown();

  // Amount
  doc.fontSize(12).text("Détails du paiement", { underline: true });
  doc.fontSize(10).text(`Montant: ${r.amount} ${r.currency}`);
  if (r.note) doc.text(`Note: ${r.note}`);
  doc.moveDown();

  // Mojaloop
  doc.fontSize(10).text("Mojaloop info:");
  doc.text(`quoteId: ${r.mojaloop?.quoteId || "-"}`);
  doc.text(`transferId: ${r.mojaloop?.transferId || "-"}`);

  if (r.mojaloop?.error) {
    doc.fillColor("red");
    doc.text(
      `Erreur: ${r.mojaloop.error.code} - ${r.mojaloop.error.description}`
    );
    doc.fillColor("black");
  }

  doc.moveDown(2);
  doc.fontSize(9).text("Merci d'avoir utilisé TAI", { align: "center" });

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });

  // Save JSON
  await fs.writeJson(path.join(outputDir, `${receiptId}.json`), r, {
    spaces: 2,
  });

  // 📌 URL publique accessible depuis navigateur
  const publicUrl = `/receipts/${fileName}`;

  return { receiptId, filePath, publicUrl, receipt: r };
}
