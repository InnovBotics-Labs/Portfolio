""" Render does not support SQLite in production because it uses ephemeral storage
    (your database will be lost on restarts). Instead, use PostgreSQL or MySQL"""
# Dependencies
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Config:
    """ Flask configuration class """
    SECRET_KEY = os.getenv("SECRET_KEY", "8BYkEfBA6O6donzWlSihBXox7C0sKR6b")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI", "sqlite:///Inquirer.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_BINDS = {
        "auth": os.getenv("AUTH_DATABASE_URL", "sqlite:///auth.db")
    }
    DEBUG = os.getenv("DEBUG", "True") == "True"
