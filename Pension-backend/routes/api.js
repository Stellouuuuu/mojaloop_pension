const express = require("express");
const router = express.Router();
const pool = require("../src/db");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Dashboard KPIs
router.get("/dashboard/kpis", async (req, res) => {
  try {
    const [[{ totalPensioners }]] = await pool.query("SELECT COUNT(*) AS totalPensioners FROM pensioners");
    const [[{ totalPaid }]] = await pool.query("SELECT SUM(amount) AS totalPaid FROM transfer WHERE status='success'");
    const [[{ errors }]] = await pool.query("SELECT COUNT(*) AS errors FROM transfer WHERE status='failed'");
    
    res.json({
      activePensioners: totalPensioners || 0,
      paidThisMonth: totalPaid || 0,
      successRate: totalPensioners ? Math.round(((totalPensioners - errors)/totalPensioners)*100*100)/100 : 0,
      errors: errors || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Liste des pensioners
router.get("/pensioners", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM pensioners");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Détails d’un pensioner + ses transferts
router.get("/pensioners/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [pensionerRows] = await pool.query("SELECT * FROM pensioners WHERE id = ?", [id]);
    if (!pensionerRows.length) return res.status(404).json({ error: "Pensioner non trouvé" });

    const pensioner = pensionerRows[0];

    const [payments] = await pool.query("SELECT * FROM payments WHERE pensioner_id = ?", [id]);
    const [documents] = await pool.query("SELECT * FROM documents WHERE pensioner_id = ?", [id]);
    const [auditHistory] = await pool.query("SELECT * FROM audit_history WHERE pensioner_id = ?", [id]);

    res.json({
      ...pensioner,
      payments,
      documents,
      auditHistory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Paiements récents
router.get("/payments/recent", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM transfer ORDER BY initiated_at DESC LIMIT 10");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Historique des paiements
router.get("/payments/history", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM transfer ORDER BY initiated_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Batches
router.get("/batches", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM batches ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/payments/batch", async (req, res) => {
  const payment = req.body; // on attend un seul paiement

  console.log(payment);

  if (!payment) {
    return res.status(400).json({ error: "Aucun paiement fourni" });
  }

  const payload = {
    from: {
      name: payment.from.displayName,
      idType: payment.from.idType,
      idValue: payment.from.idValue
    },
    to: {
      idType: payment.to.idType,
      idValue: payment.to.idValue
    },
    amountType: "SEND",
    currency: payment.currency,           // le front envoie "devise"
    amount: parseFloat(payment.amount), // convertir la chaîne en nombre
    transactionType: "TRANSFER",
    note: payment.note || "Paiement",
    homeTransactionId: uuidv4()
  };

  try {
    const response = await axios.post("http://localhost:4001/transfers", payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    res.json({ success: true, data: response.data, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.response?.data || err.message, payment });
  }
});



module.exports = router;

