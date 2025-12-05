const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');

async function importPayments() {
  const payments = [];

  fs.createReadStream('./payment_list.csv')
    .pipe(csv())
    .on('data', (row) => {
      payments.push({
        type_id: row.type_id,
        valeur_id: row.valeur_id,
        currency: row.devise,
        amount: Number(row.montant),
        fullName: row.nom_complet,
      });
    })
    .on('end', async () => {
      console.log("CSV chargé ✔️", payments.length, "lignes");

      try {
        const response = await axios.post(
          'http://localhost:3001/api/payments/import',
          { payments }
        );

        console.log("Réponse API => ", response.data);
      } catch (err) {
        console.error("❌ Erreur API :", err.response?.data || err.message);
      }
    });
}

importPayments();
