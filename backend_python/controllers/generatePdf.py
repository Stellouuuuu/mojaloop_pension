
from flask import Blueprint, request, jsonify, send_file
from http import HTTPStatus
import io # Utilisé pour stocker le PDF en mémoire avant de l'envoyer
from models.ReceiptPDF import ReceiptPDF
import os # Pour supprimer le fichier temporaire (si on ne veut pas utiliser io.BytesIO)


class PdfController:
    @staticmethod
    def generate_receipt():
        """
        Génère un reçu PDF à partir des données de transaction reçues en JSON.
        """
        try:
            # Récupère les données JSON de la requête
            api_response = request.get_json()
            
            if not api_response or 'data' not in api_response:
                return jsonify({"message": "Données de transaction manquantes ou invalides"}), HTTPStatus.BAD_REQUEST

            transaction_data = api_response['data']

            # Créer l'objet PDF avec les données
            pdf = ReceiptPDF(transaction_data)
            
            # Générer le PDF en mémoire (BytesIO)
            pdf_bytes = pdf.generate()

            # Créer un objet BytesIO à partir des bytes du PDF
            pdf_buffer = io.BytesIO(pdf_bytes)

            # Préparer le nom du fichier pour le téléchargement
            filename = f"Reçu_Paiement_{transaction_data.get('homeTransactionId', 'sans-id')}.pdf"

            # Renvoyer le PDF comme réponse
            return send_file(
                pdf_buffer,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=filename
            )

        except Exception as e:
            # En cas d'erreur inattendue (ex: données mal structurées, fpdf crash)
            print(f"Erreur lors de la génération du PDF: {e}")
            return jsonify({"error": "Erreur interne lors de la génération du PDF", "details": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR
