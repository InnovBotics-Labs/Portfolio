"""
Flask Application Configuration
================================
Centralized configuration management with environment variable support.
Follows 12-Factor App methodology for configuration.

Author: Prabhukumar Sivamoorthy
"""

# Dependencies
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()


class Config:
    """
    Flask configuration class with environment variable support.
    
    All sensitive credentials should be stored in environment variables
    or a .env file (not committed to version control).
    """
    
    # ==========================================================================
    # Core Flask Settings
    # ==========================================================================
    SECRET_KEY = os.getenv("SECRET_KEY", "8BYkEfBA6O6donzWlSihBXox7C0sKR6b")
    DEBUG = os.getenv("DEBUG", "True") == "True"
    
    # ==========================================================================
    # Email Configuration (Gmail SMTP)
    # ==========================================================================
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
    MAIL_SENDER_NAME = os.getenv("MAIL_SENDER_NAME", "Portfolio Contact Form")
    MAIL_RECIPIENT = os.getenv("MAIL_RECIPIENT", "prabhukumarsivamoorthy@gmail.com")
    
    # ==========================================================================
    # Deprecated: Database Configuration (Kept for reference, will be removed)
    # ==========================================================================
    # Note: Database functionality has been replaced with email notifications
    # These settings are no longer used but kept temporarily for migration
    # SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI", "sqlite:///Inquirer.db")
    # SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SQLALCHEMY_BINDS = {
    #     "auth": os.getenv("AUTH_DATABASE_URL", "sqlite:///auth.db")
    # }
