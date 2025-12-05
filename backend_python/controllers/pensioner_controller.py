from flask import Blueprint, request, jsonify
import jwt
from functools import wraps
from http import HTTPStatus
from models.pensioner_model import Pensioner
from config import Config

class PensionerController:
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
    #         token = PensionerController._get_token()
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
    
    def create_pensioner():
        """Crée un nouveau pensionné dans la table pensioners."""
        try:
            data = request.get_json()
            required_fields = ['unique_id', 'first_name', 'last_name', 'msisdn', 'amount']
            if not all(field in data for field in required_fields):
                return jsonify({"message": "Champs obligatoires manquants : unique_id, first_name, last_name, msisdn, amount"}), HTTPStatus.BAD_REQUEST

            unique_id = data.get('unique_id')
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            msisdn = data.get('msisdn')
            amount = data.get('amount')
            currency = data.get('currency', 'XOF')
            comment = data.get('comment')
            status = data.get('status', 'pending')
            home_transaction_id = data.get('home_transaction_id')
            batch_id = data.get('batch_id')

            if status not in ['pending', 'validated', 'processing', 'success', 'failed']:
                return jsonify({"message": "Statut invalide. Doit être 'pending', 'validated', 'processing', 'success' ou 'failed'"}), HTTPStatus.BAD_REQUEST

            # Vérification du token et du batch si fourni
            

            if batch_id:
                from models.batch_model import Batch
                batch = Batch.get_by_id(batch_id)
                if not batch:
                    return jsonify({"message": "Lot non trouvé"}), HTTPStatus.NOT_FOUND
                
            pensioner_id = Pensioner.create(unique_id, first_name, last_name, msisdn, amount, currency, comment, status, home_transaction_id, batch_id)
            return jsonify({
                'message': 'Pensionné créé avec succès',
                'pensioner_id': pensioner_id
            }), HTTPStatus.CREATED
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def update_pensioner():
        """Met à jour un pensionné existant."""
        try:
            data = request.get_json()
            if 'id' not in data:
                return jsonify({"message": "ID du pensionné requis"}), HTTPStatus.BAD_REQUEST

            id = data.get('id')
            unique_id = data.get('unique_id')
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            msisdn = data.get('msisdn')
            amount = data.get('amount')
            currency = data.get('currency')
            comment = data.get('comment')
            status = data.get('status')
            home_transaction_id = data.get('home_transaction_id')
            batch_id = data.get('batch_id')

            if status and status not in ['pending', 'validated', 'processing', 'success', 'failed']:
                return jsonify({"message": "Statut invalide. Doit être 'pending', 'validated', 'processing', 'success' ou 'failed'"}), HTTPStatus.BAD_REQUEST

            # Vérification du token pour s'assurer que l'utilisateur a le droit de modifier ce pensionné
            

            pensioner = Pensioner.get_by_id(id)
            if not pensioner:
                return jsonify({"message": "Pensionné non trouvé"}), HTTPStatus.NOT_FOUND

            # Vérifier l'accès via le batch si associé
            
            # Vérifier le nouveau batch si changé
            if batch_id and batch_id != pensioner.batch_id:
                from models.batch_model import Batch
                new_batch = Batch.get_by_id(batch_id)
                if not new_batch:
                    return jsonify({"message": "Nouveau lot non trouvé"}), HTTPStatus.NOT_FOUND
                
            success = Pensioner.update(id, unique_id, first_name, last_name, msisdn, amount, currency, comment, status, home_transaction_id, batch_id)
            if not success:
                return jsonify({"message": "Pensionné non trouvé ou aucun changement effectué"}), HTTPStatus.NOT_FOUND

            return jsonify({'message': 'Pensionné mis à jour avec succès'}), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def get_pensioner_by_id():
        """Récupère un pensionné par son ID."""
        try:
            data = request.get_json()
            if 'id' not in data:
                return jsonify({"message": "ID du pensionné requis"}), HTTPStatus.BAD_REQUEST

            id = data.get('id')

            # Vérification du token pour s'assurer que l'utilisateur a le droit de voir ce pensionné
            

            pensioner = Pensioner.get_by_id(id)
            if not pensioner:
                return jsonify({"message": "Pensionné non trouvé"}), HTTPStatus.NOT_FOUND

            return jsonify({
                "message": "Pensionné récupéré avec succès",
                "pensioner": {
                    "id": pensioner.id,
                    "unique_id": pensioner.unique_id,
                    "first_name": pensioner.first_name,
                    "last_name": pensioner.last_name,
                    "msisdn": pensioner.msisdn,
                    "amount": pensioner.amount,
                    "currency": pensioner.currency,
                    "comment": pensioner.comment,
                    "status": pensioner.status,
                    "home_transaction_id": pensioner.home_transaction_id,
                    "batch_id": pensioner.batch_id,
                    "created_at": pensioner.created_at,
                    "updated_at": pensioner.updated_at
                }
            }), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def get_all_pensioners():
        """Récupère tous les pensionnés."""
        try:
            limit = request.args.get('limit', 50, type=int)
            offset = request.args.get('offset', 0, type=int)

            pensioners = Pensioner.get_all(limit, offset)

            if not pensioners:
                return jsonify({"message": "Aucun pensionné trouvé"}), HTTPStatus.NOT_FOUND

            pensioner_list = [{
                "id": p.id,
                "unique_id": p.unique_id,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "msisdn": p.msisdn,
                "amount": p.amount,
                "currency": p.currency,
                "comment": p.comment,
                "status": p.status,
                "home_transaction_id": p.home_transaction_id,
                "batch_id": p.batch_id,
                "created_at": p.created_at,
                "updated_at": p.updated_at
            } for p in pensioners]

            return jsonify({
                "message": "Pensionnés récupérés avec succès",
                "pensioners": pensioner_list
            }), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def get_pensioner_by_unique_id():
        """Récupère un pensionné par son unique_id."""
        try:
            data = request.get_json()
            if 'unique_id' not in data:
                return jsonify({"message": "unique_id requis"}), HTTPStatus.BAD_REQUEST

            unique_id = data.get('unique_id')

            pensioner = Pensioner.get_by_unique_id(unique_id)
            if not pensioner:
                return jsonify({"message": "Pensionné non trouvé"}), HTTPStatus.NOT_FOUND

            return jsonify({
                "message": "Pensionné récupéré avec succès",
                "pensioner": {
                    "id": pensioner.id,
                    "unique_id": pensioner.unique_id,
                    "first_name": pensioner.first_name,
                    "last_name": pensioner.last_name,
                    "msisdn": pensioner.msisdn,
                    "amount": pensioner.amount,
                    "currency": pensioner.currency,
                    "comment": pensioner.comment,
                    "status": pensioner.status,
                    "home_transaction_id": pensioner.home_transaction_id,
                    "batch_id": pensioner.batch_id,
                    "created_at": pensioner.created_at,
                    "updated_at": pensioner.updated_at
                }
            }), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def get_pensioners_by_batch_id():
        """Récupère tous les pensionnés associés à un lot spécifique."""
        try:
            data = request.get_json()
            if 'batch_id' not in data:
                return jsonify({"message": "ID du lot requis"}), HTTPStatus.BAD_REQUEST

            batch_id = data.get('batch_id')

            from models.batch_model import Batch
            batch = Batch.get_by_id(batch_id)
            if not batch:
                return jsonify({"message": "Lot non trouvé"}), HTTPStatus.NOT_FOUND
            
            pensioners = Pensioner.get_by_batch_id(batch_id)
            if not pensioners:
                return jsonify({"message": "Aucun pensionné trouvé pour ce lot"}), HTTPStatus.NOT_FOUND

            pensioner_list = [{
                "id": p.id,
                "unique_id": p.unique_id,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "msisdn": p.msisdn,
                "amount": p.amount,
                "currency": p.currency,
                "comment": p.comment,
                "status": p.status,
                "home_transaction_id": p.home_transaction_id,
                "batch_id": p.batch_id,
                "created_at": p.created_at,
                "updated_at": p.updated_at
            } for p in pensioners]

            return jsonify({
                "message": "Pensionnés du lot récupérés avec succès",
                "pensioners": pensioner_list
            }), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def update_pensioner_status():
        """Met à jour le statut d'un pensionné."""
        try:
            data = request.get_json()
            if 'id' not in data or 'status' not in data:
                return jsonify({"message": "ID du pensionné et statut requis"}), HTTPStatus.BAD_REQUEST

            id = data.get('id')
            status = data.get('status')

            if status not in ['pending', 'validated', 'processing', 'success', 'failed']:
                return jsonify({"message": "Statut invalide. Doit être 'pending', 'validated', 'processing', 'success' ou 'failed'"}), HTTPStatus.BAD_REQUEST


            pensioner = Pensioner.get_by_id(id)
            if not pensioner:
                return jsonify({"message": "Pensionné non trouvé"}), HTTPStatus.NOT_FOUND
            
            success = Pensioner.update_status(id, status)
            if not success:
                return jsonify({"message": "Pensionné non trouvé"}), HTTPStatus.NOT_FOUND

            return jsonify({'message': 'Statut du pensionné mis à jour avec succès'}), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR

    @staticmethod
    
    def delete_pensioner():
        """Supprime un pensionné."""
        try:
            data = request.get_json()
            if 'id' not in data:
                return jsonify({"message": "ID du pensionné requis"}), HTTPStatus.BAD_REQUEST

            id = data.get('id')

            pensioner = Pensioner.get_by_id(id)
            if not pensioner:
                return jsonify({"message": "Pensionné non trouvé"}), HTTPStatus.NOT_FOUND

            success = Pensioner.delete(id)
            if not success:
                return jsonify({"message": "Pensionné non trouvé"}), HTTPStatus.NOT_FOUND

            return jsonify({'message': 'Pensionné supprimé avec succès'}), HTTPStatus.OK
        except Exception as e:
            return jsonify({"error": str(e)}), HTTPStatus.INTERNAL_SERVER_ERROR