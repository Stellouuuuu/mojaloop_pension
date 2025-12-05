# app.py
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from fpdf import FPDF
import json
import io
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.set_fill_color(50, 100, 50)
        self.set_text_color(255, 255, 255)
        self.cell(0, 12, 'REÇU DE TRANSACTION ÉLECTRONIQUE', 0, 1, 'C', 1)
        self.set_text_color(0, 0, 0)
        self.ln(5)

    def footer(self):
        self.set_y(-20)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 5, f'Page {self.page_no()}', 0, 1, 'C')
        self.set_font('Arial', 'B', 9)
        self.set_text_color(50, 100, 50)
        self.cell(0, 5, 'Signé : Mojaloop', 0, 1, 'C')
        self.set_text_color(0, 0, 0)

    def section_title(self, title):
        self.set_fill_color(200, 220, 255)
        self.set_font('Arial', 'B', 12)
        self.cell(0, 8, title, 0, 1, 'L', 1)
        self.ln(2)

    def detail_line(self, label, value):
        self.set_font('Arial', '', 10)
        self.cell(60, 6, f'  {label}:', 0)
        self.set_font('Arial', 'B', 10)
        self.cell(0, 6, str(value), 0, 1)

@app.route('/pdf/generate_receipt', methods=['POST'])
def generate_receipt():
    try:
        # --- 1. Récupération du JSON envoyé par le frontend ---
        json_data = request.get_json()
        if not json_data or 'data' not in json_data:
            return jsonify({"error": "JSON invalide ou 'data' manquant"}), 400

        data = json_data['data']

        # --- 2. Extraction des données (exactement comme dans ton script) ---
        sender = data['from'].get('name', 'Inconnu')
        sender_id = f"{data['from']['idType']}: {data['from']['idValue']}"

        recipient_name = f"{data['to'].get('firstName', '')} {data['to'].get('middleName', '').strip()} {data['to'].get('lastName', '')}".strip()
        recipient_id = f"{data['to']['idType']}: {data['to']['idValue']}"
        dfsp = data['to'].get('fspId', 'N/A')

        amount = data['amount']
        currency = data['currency']
        status = data['currentState']
        timestamp_raw = data['initiatedTimestamp']
        timestamp = datetime.fromisoformat(timestamp_raw.replace('Z', '+00:00')).strftime("%d/%m/%Y %H:%M:%S")

        transfer_id = data.get('transferId', 'N/A')
        home_transaction_id = data.get('homeTransactionId', 'N/A')
        quote_id = data.get('quoteId', 'N/A')

        # Frais
        quote = data.get('quoteResponse', {})
        fee = quote.get('payeeFspFee', {}).get('amount', '0')
        commission = quote.get('payeeFspCommission', {}).get('amount', '0')
        total_fees = f"{float(fee) + float(commission):.2f} {currency}"
        received_amount = quote.get('payeeReceiveAmount', {}).get('amount', amount)

        # --- 3. Génération du PDF en mémoire ---
        pdf = PDF()
        pdf.add_page()

        pdf.section_title('Détails de l\'Expéditeur')
        pdf.detail_line('Nom', sender)
        pdf.detail_line('Identifiant', sender_id)
        pdf.ln(5)

        pdf.section_title('Détails du Bénéficiaire')
        pdf.detail_line('Nom Complet', recipient_name or "Inconnu")
        pdf.detail_line('Identifiant', recipient_id)
        pdf.detail_line('Institution Financière', dfsp)
        pdf.ln(5)

        pdf.section_title('Détails de la Transaction')
        pdf.detail_line('Montant Envoyé', f"{amount} {currency}")
        pdf.detail_line('Montant Reçu', f"{received_amount} {currency}")
        pdf.detail_line('Note/Motif', data.get('note', 'Aucune'))
        pdf.detail_line('Date/Heure', timestamp)
        pdf.detail_line('Statut', status)
        pdf.ln(5)

        pdf.section_title('Frais')
        pdf.detail_line('Frais DFSP', f"{fee} {currency}")
        pdf.detail_line('Commission DFSP', f"{commission} {currency}")
        pdf.detail_line('Total Frais + Commission', total_fees)
        pdf.ln(5)

        pdf.section_title('Références')
        pdf.detail_line('Transfer ID', transfer_id)
        pdf.detail_line('Home Transaction ID', home_transaction_id)
        pdf.detail_line('Quote ID', quote_id)

        # --- 4. Envoi du PDF en téléchargement direct ---
        pdf_buffer = io.BytesIO()
        pdf.output(pdf_buffer)
        pdf_buffer.seek(0)

        filename = f"Reçu_{home_transaction_id}.pdf"

        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Lancement du serveur ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)