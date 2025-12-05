from flask import Blueprint,jsonify
import os
import json
from controllers.generatePdf import PdfController
from controllers.csv_to_json_controller import CsvToJsonController

routes = Blueprint("routes", __name__)

@routes.route('/pdf/generate-receipt', methods=['POST'])
def generate_pdf_receipt():
    return PdfController.generate_receipt()

DATA_FILE = "data.json"

@routes.route('/csv/upload', methods=['POST'])
def upload_csv():
    return CsvToJsonController.upload_and_convert()

@routes.route("/api/pensioners", methods=["GET"])
def get_pensioners():
    if not os.path.exists(DATA_FILE):
        return jsonify({"error": "Aucun fichier data.json trouvé"}), 404

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Renvoie toujours via jsonify pour garantir du JSON correct
        return jsonify(data), 200

    except json.JSONDecodeError:
        return jsonify({"error": "Fichier JSON corrompu"}), 500