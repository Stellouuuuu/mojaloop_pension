from config import Config
from http import HTTPStatus
from datetime import datetime

class Batch:
    def __init__(self, id, batch_code, total_amount, total_payments, success_rate, status, initiated_by, created_at=None, updated_at=None):
        self.id = id
        self.batch_code = batch_code
        self.total_amount = total_amount
        self.total_payments = total_payments
        self.success_rate = success_rate
        self.status = status
        self.initiated_by = initiated_by
        self.created_at = created_at
        self.updated_at = updated_at

    @staticmethod
    def create(batch_code, total_amount, total_payments, initiated_by, status='pending', success_rate=0.00):
        """Crée un nouveau lot dans la table batches."""
        db = Config.get_db_connection()
        if not db:
            raise Exception("Erreur de connexion à la base de données")

        cursor = db.cursor()
        try:
            if status not in ['pending', 'completed', 'partial']:
                raise Exception("Statut invalide. Doit être 'pending', 'completed' ou 'partial'")

            query = """
                INSERT INTO batches (batch_code, total_amount, total_payments, success_rate, status, initiated_by)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            values = (batch_code, total_amount, total_payments, success_rate, status, initiated_by)
            cursor.execute(query, values)
            db.commit()
            return cursor.lastrowid
        except Exception as e:
            print(f"Erreur lors de la création du lot : {e}")
            db.rollback()
            raise Exception(f"Erreur lors de la création du lot : {e}")
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def update(id, batch_code=None, total_amount=None, total_payments=None, success_rate=None, status=None, initiated_by=None):
        """Met à jour un lot dans la table batches."""
        db = Config.get_db_connection()
        if not db:
            raise Exception("Erreur de connexion à la base de données")

        cursor = db.cursor()
        try:
            updates = {}
            if batch_code is not None:
                updates['batch_code'] = batch_code
            if total_amount is not None:
                updates['total_amount'] = total_amount
            if total_payments is not None:
                updates['total_payments'] = total_payments
            if success_rate is not None:
                updates['success_rate'] = success_rate
            if status is not None:
                if status not in ['pending', 'completed', 'partial']:
                    raise Exception("Statut invalide. Doit être 'pending', 'completed' ou 'partial'")
                updates['status'] = status
            if initiated_by is not None:
                updates['initiated_by'] = initiated_by

            if updates:
                set_clause = ", ".join(f"{key} = %s" for key in updates.keys())
                query = f"UPDATE batches SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
                values = list(updates.values()) + [id]
                cursor.execute(query, values)
                db.commit()
                return cursor.rowcount > 0
            else:
                return False
        except Exception as e:
            print(f"Erreur lors de la mise à jour du lot : {e}")
            db.rollback()
            raise Exception(f"Erreur lors de la mise à jour du lot : {e}")
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_by_id(id):
        """Récupère un lot par son ID."""
        db = Config.get_db_connection()
        if not db:
            return None

        cursor = db.cursor(dictionary=True)
        try:
            query = """
                SELECT id, batch_code, total_amount, total_payments, success_rate, status, initiated_by, created_at, updated_at
                FROM batches WHERE id = %s
            """
            cursor.execute(query, (id,))
            result = cursor.fetchone()
            if result:
                return Batch(**result)
            return None
        except Exception as e:
            print(f"Erreur lors de la récupération du lot : {e}")
            return None
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_all(limit=50, offset=0):
        """Récupère tous les lots, triés par date de création descendante."""
        db = Config.get_db_connection()
        if not db:
            return None

        cursor = db.cursor(dictionary=True)
        try:
            query = """
                SELECT id, batch_code, total_amount, total_payments, success_rate, status, initiated_by, created_at, updated_at
                FROM batches
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (limit, offset))
            results = cursor.fetchall()
            return [Batch(**result) for result in results] if results else []
        except Exception as e:
            print(f"Erreur lors de la récupération des lots : {e}")
            return None
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_by_batch_code(batch_code):
        """Récupère un lot par son code unique."""
        db = Config.get_db_connection()
        if not db:
            return None

        cursor = db.cursor(dictionary=True)
        try:
            query = """
                SELECT id, batch_code, total_amount, total_payments, success_rate, status, initiated_by, created_at, updated_at
                FROM batches WHERE batch_code = %s
            """
            cursor.execute(query, (batch_code,))
            result = cursor.fetchone()
            if result:
                return Batch(**result)
            return None
        except Exception as e:
            print(f"Erreur lors de la récupération du lot par code : {e}")
            return None
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def update_status(id, status):
        """Met à jour le statut d'un lot."""
        db = Config.get_db_connection()
        if not db:
            raise Exception("Erreur de connexion à la base de données")

        cursor = db.cursor()
        try:
            if status not in ['pending', 'completed', 'partial']:
                raise Exception("Statut invalide. Doit être 'pending', 'completed' ou 'partial'")

            query = "UPDATE batches SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
            cursor.execute(query, (status, id))
            db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Erreur lors de la mise à jour du statut du lot : {e}")
            db.rollback()
            raise Exception(f"Erreur lors de la mise à jour du statut du lot : {e}")
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def update_success_rate(id, success_rate):
        """Met à jour le taux de réussite d'un lot."""
        db = Config.get_db_connection()
        if not db:
            raise Exception("Erreur de connexion à la base de données")

        cursor = db.cursor()
        try:
            query = "UPDATE batches SET success_rate = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
            cursor.execute(query, (success_rate, id))
            db.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Erreur lors de la mise à jour du taux de réussite : {e}")
            db.rollback()
            raise Exception(f"Erreur lors de la mise à jour du taux de réussite : {e}")
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def delete(id):
        """Supprime un lot par son ID."""
        db = Config.get_db_connection()
        if not db:
            raise Exception("Erreur de connexion à la base de données")

        cursor = db.cursor()
        try:
            query = "DELETE FROM batches WHERE id = %s"
            cursor.execute(query, (id,))
            if cursor.rowcount == 0:
                raise Exception("Lot non trouvé")
            db.commit()
            return True
        except Exception as e:
            print(f"Erreur lors de la suppression du lot : {e}")
            db.rollback()
            raise Exception(f"Erreur lors de la suppression du lot : {e}")
        finally:
            cursor.close()
            db.close()

    @staticmethod
    def get_batch_with_pensioners():
        """Récupère un lot avec tous les pensionnaires qui y sont associés."""
        db = Config.get_db_connection()
        if not db:
            return None

        cursor = db.cursor(dictionary=True)
        try:
            query = """
                SELECT p.*, b.* 
                FROM pensioners p
                INNER JOIN batches b ON p.batch_id = b.id
            """
            cursor.execute(query)
            results = cursor.fetchall()
            return results if results else []
        except Exception as e:
            print(f"Erreur lors de la récupération du lot avec les pensionnaires : {e}")
            return None
        finally:
            cursor.close()
            db.close()