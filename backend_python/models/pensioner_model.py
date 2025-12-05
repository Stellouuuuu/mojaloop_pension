from config import Config
from http import HTTPStatus
from datetime import datetime

class Pensioner:
    def __init__(self, id, unique_id, first_name, last_name, type_id, msisdn, amount, currency, comment, status, home_transaction_id, batch_id, created_at=None, updated_at=None):
        self.id = id
        self.unique_id = unique_id
        self.first_name = first_name
        self.last_name = last_name
        self.type_id = type_id
        self.msisdn = msisdn
        self.amount = amount
        self.currency = currency
        self.comment = comment
        self.status = status
        self.home_transaction_id = home_transaction_id
        self.batch_id = batch_id
        self.created_at = created_at
        self.updated_at = updated_at

    @staticmethod
    def create(unique_id, first_name, last_name, type_id, msisdn, amount, currency, comment=None, status='pending', home_transaction_id=None, batch_id=None):
        """Crée un nouveau pensionné dans la table pensioners."""
        db = Config.get_db_connection()
        if not db:
            raise Exception("Erreur de connexion à la base de données")

        cursor = db.cursor()
        try:
            if status not in ['pending', 'validated', 'processing', 'success', 'failed']:
                raise Exception("Statut invalide. Doit être 'pending', 'validated', 'processing', 'success' ou 'failed'")

            query = """
                INSERT INTO pensioners (unique_id, first_name, last_name, type_id, msisdn, amount, currency, comment, status, home_transaction_id, batch_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (unique_id, first_name, last_name, type_id, msisdn, amount, currency, comment, status, home_transaction_id, batch_id)
            cursor.execute(query, values)
            db.commit()
            return cursor.lastrowid
        except Exception as e:
            print(f"Erreur lors de la création du pensionné : {e}")
            db.rollback()
            raise Exception(f"Erreur lors de la création du pensionné : {e}")
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def update(id, unique_id=None, first_name=None, last_name=None, type_id=None, msisdn=None, amount=None, currency=None, comment=None, status=None, home_transaction_id=None, batch_id=None):
        """Met à jour un pensionné dans la table pensioners."""
        db = Config.get_db_connection()
        if not db:
            raise Exception("Erreur de connexion à la base de données")

        cursor = db.cursor()
        try:
            updates = {}
            if unique_id is not None:
                updates['unique_id'] = unique_id
            if first_name is not None:
                updates['first_name'] = first_name
            if last_name is not None:
                updates['last_name'] = last_name
            if type_id is not None:
                updates['type_id'] = type_id
            if msisdn is not None:
                updates['msisdn'] = msisdn
            if amount is not None:
                updates['amount'] = amount
            if currency is not None:
                updates['currency'] = currency
            if comment is not None:
                updates['comment'] = comment
            if status is not None:
                if status not in ['pending', 'validated', 'processing', 'success', 'failed']:
                    raise Exception("Statut invalide. Doit être 'pending', 'validated', 'processing', 'success' ou 'failed'")
                updates['status'] = status
            if home_transaction_id is not None:
                updates['home_transaction_id'] = home_transaction_id
            if batch_id is not None:
                updates['batch_id'] = batch_id

            if updates:
                set_clause = ", ".join(f"{key} = %s" for key in updates.keys())
                query = f"UPDATE pensioners SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
                values = list(updates.values()) + [id]
                cursor.execute(query, values)
                db.commit()
                return cursor.rowcount > 0
            else:
                return False
        except Exception as e:
            print(f"Erreur lors de la mise à jour du pensionné : {e}")
            db.rollback()
            raise Exception(f"Erreur lors de la mise à jour du pensionné : {e}")
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_by_id(id):
        """Récupère un pensionné par son ID."""
        db = Config.get_db_connection()
        if not db:
            return None

        cursor = db.cursor(dictionary=True)
        try:
            query = """
                SELECT id, unique_id, first_name, last_name, type_id, msisdn, amount, currency, comment, status, home_transaction_id, batch_id, created_at, updated_at
                FROM pensioners WHERE id = %s
            """
            cursor.execute(query, (id,))
            result = cursor.fetchone()
            if result:
                return Pensioner(**result)
            return None
        except Exception as e:
            print(f"Erreur lors de la récupération du pensionné : {e}")
            return None
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_all(limit=50, offset=0):
        """Récupère tous les pensionnés, triés par date de création descendante."""
        db = Config.get_db_connection()
        if not db:
            return None

        cursor = db.cursor(dictionary=True)
        try:
            query = """
                SELECT id, unique_id, first_name, last_name, type_id, msisdn, amount, currency, comment, status, home_transaction_id, batch_id, created_at, updated_at
                FROM pensioners
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (limit, offset))
            results = cursor.fetchall()
            return [Pensioner(**result) for result in results] if results else []
        except Exception as e:
            print(f"Erreur lors de la récupération des pensionnés : {e}")
            return None
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_by_unique_id(unique_id):
        """Récupère un pensionné par son unique_id."""
        db = Config.get_db_connection()
        if not db:
            return None

        cursor = db.cursor(dictionary=True)
        try:
            query = """
                SELECT id, unique_id, first_name, last_name, type_id, msisdn, amount, currency, comment, status, home_transaction_id, batch_id, created_at, updated_at
                FROM pensioners WHERE unique_id = %s
            """
            cursor.execute(query, (unique_id,))
            result = cursor.fetchone()
            if result:
                return Pensioner(**result)
            return None
        except Exception as e:
            print(f"Erreur lors de la récupération du pensionné par unique_id : {e}")
            return None
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_by_batch_id(batch_id):
        """Récupère tous les pensionnés associés à un lot spécifique."""
        db = Config.get_db_connection()
        if not db:
            return None

        cursor = db.cursor(dictionary=True)
        try:
            query = """
                SELECT id, unique_id, first_name, last_name, type_id, msisdn, amount, currency, comment, status, home_transaction_id, batch_id, created_at, updated_at
                FROM pensioners WHERE batch_id = %s
                ORDER BY created_at ASC
            """
            cursor.execute(query, (batch_id,))
            results = cursor.fetchall()
            return [Pensioner(**result) for result in results] if results else []
        except Exception as e:
            print(f"Erreur lors de la récupération des pensionnés par batch_id : {e}")
            return None
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def update_status(id, status):
        """Met à jour le statut d'un pensionné."""
        db = Config.get_db_connection()
        if not db:
            raise Exception("Erreur de connexion à la base de données")

        cursor = db.cursor()
        try:
            if status not in ['pending', 'validated', 'processing', 'success', 'failed']:
                raise Exception("Statut invalide. Doit être 'pending', 'validated', 'processing', 'success' ou 'failed'")

            query = "UPDATE pensioners SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
            cursor.execute(query, (status, id))
            db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Erreur lors de la mise à jour du statut du pensionné : {e}")
            db.rollback()
            raise Exception(f"Erreur lors de la mise à jour du statut du pensionné : {e}")
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def delete(id):
        """Supprime un pensionné par son ID."""
        db = Config.get_db_connection()
        if not db:
            raise Exception("Erreur de connexion à la base de données")

        cursor = db.cursor()
        try:
            query = "DELETE FROM pensioners WHERE id = %s"
            cursor.execute(query, (id,))
            if cursor.rowcount == 0:
                raise Exception("Pensionné non trouvé")
            db.commit()
            return True
        except Exception as e:
            print(f"Erreur lors de la suppression du pensionné : {e}")
            db.rollback()
            raise Exception(f"Erreur lors de la suppression du pensionné : {e}")
        finally:
            cursor.close()
            db.close()