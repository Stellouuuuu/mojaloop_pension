import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
import datetime


# Charger le fichier .env au moment de l'import
load_dotenv()

class Config:
    """Classe de configuration globale pour l'application."""
    DB_HOST = os.getenv('DB_HOST')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_NAME = os.getenv('DB_NAME')
    api_key=os.getenv('API_KEY')


    @staticmethod
    def get_db_connection():
        """Crée et retourne une connexion à la base de données."""
        try:
            connection = mysql.connector.connect(
                host=Config.DB_HOST,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                database=Config.DB_NAME
            )
            return connection
        except Error as e:
            print(f"Erreur de connexion MySQL : {e}")
            return None
