# controllers/csv_reader_controller.py
from flask import Blueprint, request, jsonify
from http import HTTPStatus
import pandas as pd
from io import BytesIO

class SimpleCsvReaderController:
    @staticmethod
    def read_and_print_csv():
        """
        Reçoit un fichier CSV, le lit ligne par ligne et retourne son contenu brut.
        Affiche aussi chaque ligne dans la console avec print().
        """
        try:
            if 'file' not in request.files:
                return jsonify({"error": "Aucun fichier fourni"}), HTTPStatus.BAD_REQUEST

            file = request.files['file']
            if not file.filename:
                return jsonify({"error": "Fichier vide"}), HTTPStatus.BAD_REQUEST

            if not file.filename.lower().endswith('.csv'):
                return jsonify({"error": "Seuls les fichiers .csv sont acceptés"}), HTTPStatus.BAD_REQUEST

            # Lire le contenu brut
            content = file.read()
            file.seek(0)  # Reset du pointeur
            
            # Essayer plusieurs encodages
            df = None
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
            
            for encoding in encodings:
                try:
                    df = pd.read_csv(BytesIO(content), encoding=encoding, sep=',')
                    break
                except Exception:
                    continue
            
            if df is None:
                return jsonify({"error": "Impossible de lire le fichier CSV avec les encodages supportés"}), HTTPStatus.BAD_REQUEST

            # Convertir en liste de dicts propre
            records = df.to_dict(orient='records')

            # Nettoyer les données
            clean_data = []
            for row in records:
                clean_row = {str(k).strip(): str(v).strip() if pd.notna(v) else "" for k, v in row.items()}
                clean_data.append(clean_row)

            # === PRINT DANS LA CONSOLE COMME TU VEUX ===
            print("\n" + "="*60)
            print(f"FICHIER REÇU : {file.filename}")
            print(f"NOMBRE DE LIGNES : {len(clean_data)}")
            print("="*60)
            for i, ligne in enumerate(clean_data[:10], 1):  # Afficher les 10 premières lignes
                print(f"Ligne {i}: {ligne}")
            if len(clean_data) > 10:
                print(f"... et {len(clean_data) - 10} autres lignes")
            print("="*60 + "\n")

            # Retour au frontend
            return jsonify({
                "message": f"{len(clean_data)} lignes lues avec succès",
                "filename": file.filename,
                "total_lines": len(clean_data),
                "columns": list(df.columns),
                "data": clean_data  # Toutes les lignes brutes
            }), HTTPStatus.OK

        except Exception as e:
            print(f"ERREUR : {str(e)}")
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

