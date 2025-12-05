import csv
import json
import os
from flask import request, jsonify
from datetime import datetime

DATA_FILE = "data.json"

class CsvToJsonController:

    @staticmethod
    def upload_and_convert():
        if 'file' not in request.files:
            return jsonify({"error": "Aucun fichier reçu"}), 400

        file = request.files['file']

        if file.filename.strip() == "":
            return jsonify({"error": "Nom de fichier vide"}), 400

        # Lire le CSV envoyé
        csv_reader = csv.DictReader(file.stream.read().decode('utf-8').splitlines())
        participants = []

        for row in csv_reader:
            # Vérifier que toutes les colonnes ont une valeur non vide
            # Convertir chaque valeur en str avant strip pour éviter les erreurs
            status = "valide" if all(str(value).strip() != "" for value in row.values()) else "refusé"
            row["status"] = status
            row["receipt"] = None  # Lien vers PDF individuel
            participants.append(row)

        if not participants:
            return jsonify({"error": "CSV vide"}), 400

        # Charger l'existant si data.json existe
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                try:
                    existing_data = json.load(f)
                except json.JSONDecodeError:
                    existing_data = []
        else:
            existing_data = []

        # Générer batchId unique basé sur date + compteur
        now = datetime.now()
        date_str = now.strftime("%Y%m%d")
        batch_count = sum(1 for b in existing_data if b.get("batchId", "").startswith(date_str)) + 1
        batch_id = f"{date_str}_{batch_count:03d}"

        # Créer le nouveau batch avec summary_pdf
        new_batch = {
            "batchId": batch_id,
            "date": now.isoformat(),
            "participants": participants,
            "summary_pdf": None  # Lien vers PDF récapitulatif du lot
        }

        # Ajouter au fichier
        existing_data.append(new_batch)

        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, indent=4, ensure_ascii=False)

        return jsonify({
            "message": "Nouveau lot ajouté avec succès",
            "batchId": batch_id,
            "participants_added": len(participants),
            "total_batches": len(existing_data),
            "file_saved": DATA_FILE
        }), 200