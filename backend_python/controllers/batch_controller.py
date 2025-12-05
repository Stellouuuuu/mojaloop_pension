from flask import Blueprint, request, jsonify
import jwt
from functools import wraps
from http import HTTPStatus
from models.batch_model import Batch
from config import Config

class BatchController:
    @staticmethod
    # def _get_token():
    #     """Extrait le token JWT de l'en-tête Authorization."""
    #     auth_header = request.headers.get('Authorization')
    #     if not auth_header:
    #         return None
    #     try:
    #         return auth_header.split(" ")[1]  # Format : "Bearer <token>"
    #     except IndexError:
    #         return None

    # @staticmethod
    # def token_required(f):
    #     """Décorateur pour vérifier la validité du token JWT."""
    #     @wraps(f)
    #     def decorated(*args, **kwargs):
    #         token = BatchController._get_token()
    #         if not token:
    #             return jsonify({"message": "Token manquant"}), HTTPStatus.UNAUTHORIZED
    #         try:
    #             jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
    #         except jwt.ExpiredSignatureError:
    #             return jsonify({"message": "Token expiré"}), HTTPStatus.UNAUTHORIZED
    #         except jwt.InvalidTokenError:
    #             return jsonify({"message": "Token invalide"}), HTTPStatus.UNAUTHORIZED
    #         return f(*args, **kwargs)
    #     return decorated

    @staticmethod
    
    def create_batch():
        """Crée un nouveau lot dans la table batches."""
        try:
            data = request.get_json()
            required_fields = ['batch_code', 'total_amount', 'total_payments']
            if not all(field in data for field in required_fields):
                return jsonify({"message": "Champs obligatoires manquants : batch_code, total_amount, total_payments"}), HTTPStatus.BAD_REQUEST

            batch_code = data.get('batch_code')
            total_amount = data.get('total_amount')
            total_payments = data.get('total_payments')
            initiated_by = "admin"  # Par défaut 'admin' si non fourni
            status = data.get('status', 'pending')  # Par défaut 'pending'
            success_rate = data.get('success_rate', 0.00)

            if status not in ['pending', 'completed', 'partial']:
                return jsonify({"message": "Statut invalide. Doit être 'pending', 'completed' ou 'partial'"}), HTTPStatus.BAD_REQUEST
            
            batch_id = Batch.create(batch_code, total_amount, total_payments, initiated_by, status, success_rate)
            return jsonify({
                'message': 'Lot créé avec succès',
                'batch_id': batch_id
            }), HTTPStatus.CREATED
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def update_batch():
        """Met à jour un lot existant."""
        try:
            data = request.get_json()
            if 'id' not in data:
                return jsonify({"message": "ID du lot requis"}), HTTPStatus.BAD_REQUEST

            id = data.get('id')
            batch_code = data.get('batch_code')
            total_amount = data.get('total_amount')
            total_payments = data.get('total_payments')
            success_rate = data.get('success_rate')
            status = data.get('status')
            initiated_by = data.get('initiated_by')

            if status and status not in ['pending', 'completed', 'partial']:
                return jsonify({"message": "Statut invalide. Doit être 'pending', 'completed' ou 'partial'"}), HTTPStatus.BAD_REQUEST

        
            batch = Batch.get_by_id(id)
            if not batch:
                return jsonify({"message": "Lot non trouvé"}), HTTPStatus.NOT_FOUND
        
            success = Batch.update(id, batch_code, total_amount, total_payments, success_rate, status, initiated_by)
            if not success:
                return jsonify({"message": "Lot non trouvé ou aucun changement effectué"}), HTTPStatus.NOT_FOUND

            return jsonify({'message': 'Lot mis à jour avec succès'}), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def get_batch_by_id():
        """Récupère un lot par son ID."""
        try:
            data = request.get_json()
            if 'id' not in data:
                return jsonify({"message": "ID du lot requis"}), HTTPStatus.BAD_REQUEST

            id = data.get('id')

            
            batch = Batch.get_by_id(id)
            if not batch:
                return jsonify({"message": "Lot non trouvé"}), HTTPStatus.NOT_FOUND
            
            return jsonify({
                "message": "Lot récupéré avec succès",
                "batch": {
                    "id": batch.id,
                    "batch_code": batch.batch_code,
                    "total_amount": batch.total_amount,
                    "total_payments": batch.total_payments,
                    "success_rate": batch.success_rate,
                    "status": batch.status,
                    "initiated_by": batch.initiated_by,
                    "created_at": batch.created_at,
                    "updated_at": batch.updated_at
                }
            }), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def get_all_batches():
        """Récupère tous les lots."""
        try:
            limit = request.args.get('limit', 50, type=int)
            offset = request.args.get('offset', 0, type=int)

            # Vérification du token : les admins peuvent voir tous, sinon seulement les leurs
            batches = Batch.get_all(limit, offset)

            if not batches:
                return jsonify({"message": "Aucun lot trouvé"}), HTTPStatus.NOT_FOUND

            batch_list = [{
                "id": b.id,
                "batch_code": b.batch_code,
                "total_amount": b.total_amount,
                "total_payments": b.total_payments,
                "success_rate": b.success_rate,
                "status": b.status,
                "initiated_by": b.initiated_by,
                "created_at": b.created_at,
                "updated_at": b.updated_at
            } for b in batches]

            return jsonify({
                "message": "Lots récupérés avec succès",
                "batches": batch_list
            }), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def get_batch_by_code():
        """Récupère un lot par son code unique."""
        try:
            data = request.get_json()
            if 'batch_code' not in data:
                return jsonify({"message": "Code du lot requis"}), HTTPStatus.BAD_REQUEST

            batch_code = data.get('batch_code')

            # Vérification du token pour s'assurer que l'utilisateur a le droit de voir ce lot
            
            batch = Batch.get_by_batch_code(batch_code)
            if not batch:
                return jsonify({"message": "Lot non trouvé"}), HTTPStatus.NOT_FOUND
            
            return jsonify({
                "message": "Lot récupéré avec succès",
                "batch": {
                    "id": batch.id,
                    "batch_code": batch.batch_code,
                    "total_amount": batch.total_amount,
                    "total_payments": batch.total_payments,
                    "success_rate": batch.success_rate,
                    "status": batch.status,
                    "initiated_by": batch.initiated_by,
                    "created_at": batch.created_at,
                    "updated_at": batch.updated_at
                }
            }), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def update_batch_status():
        """Met à jour le statut d'un lot."""
        try:
            data = request.get_json()
            if 'id' not in data or 'status' not in data:
                return jsonify({"message": "ID du lot et statut requis"}), HTTPStatus.BAD_REQUEST

            id = data.get('id')
            status = data.get('status')

            if status not in ['pending', 'completed', 'partial']:
                return jsonify({"message": "Statut invalide. Doit être 'pending', 'completed' ou 'partial'"}), HTTPStatus.BAD_REQUEST

            # Vérification du token pour s'assurer que l'utilisateur a le droit de modifier ce lot
            
            batch = Batch.get_by_id(id)
            if not batch:
                return jsonify({"message": "Lot non trouvé"}), HTTPStatus.NOT_FOUND
            
            # Mettre à jour le statut du lot (utilise update_status si disponible, sinon update en réutilisant les valeurs existantes)
            if hasattr(Batch, 'update_status'):
                success = Batch.update_status(id, status)
            else:
                success = Batch.update(id, batch.batch_code, batch.total_amount, batch.total_payments, batch.success_rate, status, batch.initiated_by)
    
            if not success:
                return jsonify({"message": "Échec de la mise à jour du statut du lot"}), HTTPStatus.NOT_FOUND
    
            return jsonify({'message': 'Statut du lot mis à jour avec succès'}), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    def get_batch_with_pensioners():
        """Récupère tous les lots avec tous les pensionnaires qui y sont associés."""
        try:
            results = Batch.get_batch_with_pensioners()
            if not results:
                return jsonify({"message": "Aucun résultat trouvé"}), HTTPStatus.NOT_FOUND
            
            return jsonify({
                "message": "Tous les lots et pensionnaires récupérés avec succès",
                "data": results
            }), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    def update_batch_success_rate():
        """Met à jour le taux de réussite d'un lot."""
        try:
            data = request.get_json()
            if 'id' not in data or 'success_rate' not in data:
                return jsonify({"message": "ID du lot et taux de réussite requis"}), HTTPStatus.BAD_REQUEST

            id = data.get('id')
            success_rate = data.get('success_rate')

            batch = Batch.get_by_id(id)
            if not batch:
                return jsonify({"message": "Lot non trouvé"}), HTTPStatus.NOT_FOUND
            
            success = Batch.update_success_rate(id, success_rate)
            if not success:
                return jsonify({"message": "Échec de la mise à jour du taux de réussite"}), HTTPStatus.NOT_FOUND
    
            return jsonify({'message': 'Taux de réussite du lot mis à jour avec succès'}), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    def delete():
        """Supprime un lot par son ID."""
        try:
            data = request.get_json()
            if 'id' not in data:
                return jsonify({"message": "ID du lot requis"}), HTTPStatus.BAD_REQUEST

            id = data.get('id')

            batch = Batch.get_by_id(id)
            if not batch:
                return jsonify({"message": "Lot non trouvé"}), HTTPStatus.NOT_FOUND
            
            success = Batch.delete(id)
            if not success:
                return jsonify({"message": "Échec de la suppression du lot"}), HTTPStatus.NOT_FOUND
    
            return jsonify({'message': 'Lot supprimé avec succès'}), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR