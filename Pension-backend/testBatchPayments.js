const axios = require("axios");

// Configuration
const API_URL = "http://localhost:3001/api/payments/batch";
const NUM_PAYMENTS = 100;

// Fonction pour générer un numéro MSISDN aléatoire
function randomMSISDN() {
  return "229" + Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Générer un tableau de paiements aléatoires
const payments = Array.from({ length: NUM_PAYMENTS }, (_, i) => ({
  from: { displayName: "John Doe", idType: "MSISDN", idValue: "123456789" },
  to: { idType: "MSISDN", idValue: randomMSISDN() },
  amount: (Math.floor(Math.random() * 500) + 1).toString(), // montant entre 1 et 500
  currency: "USD",
  note: `Paiement test ${i + 1}`
}));

// Envoyer le batch
async function sendBatch() {
  try {
    const response = await axios.post(API_URL, { payments });
    console.log("Batch envoyé !");
    // Version qui affiche chaque résultat lisiblement
    response.data.results.forEach((r, i) => {
      if (!r.success) {
        console.log(`❌ Paiement ${i+1} échoué :`, r.error);
      } else {
        console.log(`✅ Paiement ${i+1} OK :`, r.data);
      }
    });

  } catch (err) {
    console.error("Erreur lors de l'envoi du batch :", err.response?.data || err.message);
  }
}

sendBatch();
