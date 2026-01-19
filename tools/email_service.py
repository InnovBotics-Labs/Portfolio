"""
Email Service Module
====================
Provides email notification functionality for the Portfolio application.
Implements Strategy Pattern for email provider abstraction and
Single Responsibility Principle for clean separation of concerns.

Author: Prabhukumar Sivamoorthy
Created: 2026-01-19
"""

# Dependencies
import smtplib
import logging
import threading
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass, field
from typing import Optional, List, Protocol
from datetime import datetime, timezone
from abc import ABC, abstractmethod

# Configure logging
logger = logging.getLogger(__name__)


# =============================================================================
# Configuration Classes
# =============================================================================

@dataclass(frozen=True)
class EmailConfig:
    """
    Immutable configuration container for email settings.
    Uses dataclass for type safety and immutability.
    
    Attributes:
        server: SMTP server hostname
        port: SMTP server port
        use_tls: Whether to use TLS encryption
        username: SMTP authentication username
        password: SMTP authentication password
        sender_email: Email address to send from
        sender_name: Display name for sender
        recipient_email: Default recipient email address
    """
    server: str
    port: int
    use_tls: bool
    username: str
    password: str
    sender_email: str
    sender_name: str
    recipient_email: str
    
    def is_valid(self) -> bool:
        """Check if configuration has all required fields."""
        return all([
            self.server,
            self.port > 0,
            self.username,
            self.password,
            self.sender_email,
            self.recipient_email
        ])


# =============================================================================
# Email Message Builder (Builder Pattern)
# =============================================================================

@dataclass
class ContactFormData:
    """
    Data transfer object for contact form submissions.
    Encapsulates all form fields for type safety.
    """
    first_name: str
    last_name: str
    email: str
    country_code: str
    phone: str
    message: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    
    @property
    def full_name(self) -> str:
        """Returns formatted full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def full_phone(self) -> str:
        """Returns formatted phone number with country code."""
        return f"{self.country_code} {self.phone}".strip()


class EmailMessageBuilder:
    """
    Builder class for constructing email messages.
    Implements Fluent Interface pattern for readable email construction.
    """
    
    def __init__(self):
        self._subject: str = ""
        self._body_text: str = ""
        self._body_html: Optional[str] = None
        self._from_email: str = ""
        self._from_name: str = ""
        self._to_email: str = ""
        self._reply_to: Optional[str] = None
    
    def set_subject(self, subject: str) -> 'EmailMessageBuilder':
        """Set email subject."""
        self._subject = subject
        return self
    
    def set_body_text(self, body: str) -> 'EmailMessageBuilder':
        """Set plain text body."""
        self._body_text = body
        return self
    
    def set_body_html(self, html: str) -> 'EmailMessageBuilder':
        """Set HTML body (optional)."""
        self._body_html = html
        return self
    
    def set_from(self, email: str, name: str = "") -> 'EmailMessageBuilder':
        """Set sender email and name."""
        self._from_email = email
        self._from_name = name
        return self
    
    def set_to(self, email: str) -> 'EmailMessageBuilder':
        """Set recipient email."""
        self._to_email = email
        return self
    
    def set_reply_to(self, email: str) -> 'EmailMessageBuilder':
        """Set reply-to address."""
        self._reply_to = email
        return self
    
    def build(self) -> MIMEMultipart:
        """
        Build and return the email message object.
        
        Returns:
            MIMEMultipart: Constructed email message
            
        Raises:
            ValueError: If required fields are missing
        """
        if not all([self._subject, self._body_text, self._from_email, self._to_email]):
            raise ValueError("Missing required email fields: subject, body, from, or to")
        
        message = MIMEMultipart("alternative")
        message["Subject"] = self._subject
        message["To"] = self._to_email
        
        # Format From header with display name if provided
        if self._from_name:
            message["From"] = f"{self._from_name} <{self._from_email}>"
        else:
            message["From"] = self._from_email
        
        # Set Reply-To if provided
        if self._reply_to:
            message["Reply-To"] = self._reply_to
        
        # Attach plain text version
        message.attach(MIMEText(self._body_text, "plain", "utf-8"))
        
        # Attach HTML version if provided
        if self._body_html:
            message.attach(MIMEText(self._body_html, "html", "utf-8"))
        
        return message


# =============================================================================
# Email Templates
# =============================================================================

class ContactFormEmailTemplate:
    """
    Template class for contact form notification emails.
    Generates both plain text and HTML versions.
    """
    
    @staticmethod
    def generate_subject(contact: ContactFormData) -> str:
        """Generate email subject line."""
        return f"🔔 New Portfolio Contact: {contact.full_name}"
    
    @staticmethod
    def generate_plain_text(contact: ContactFormData) -> str:
        """Generate plain text email body."""
        timestamp_str = contact.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        
        return f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 NEW CONTACT FORM SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 CONTACT DETAILS
───────────────────────────────────
Name:    {contact.full_name}
Email:   {contact.email}
Phone:   {contact.full_phone}

📝 MESSAGE
───────────────────────────────────
{contact.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent from: Portfolio Contact Form
Timestamp: {timestamp_str}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    @staticmethod
    def generate_html(contact: ContactFormData) -> str:
        """Generate HTML email body."""
        timestamp_str = contact.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #1a1a2e; color: #e0e0e0; padding: 20px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                📬 New Contact Form Submission
            </h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            
            <!-- Contact Details Card -->
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h2 style="margin: 0 0 15px 0; color: #fbbf24; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                    👤 Contact Details
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #9ca3af; width: 80px;">Name:</td>
                        <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">{contact.full_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #9ca3af;">Email:</td>
                        <td style="padding: 8px 0;">
                            <a href="mailto:{contact.email}" style="color: #60a5fa; text-decoration: none;">{contact.email}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #9ca3af;">Phone:</td>
                        <td style="padding: 8px 0;">
                            <a href="tel:{contact.full_phone}" style="color: #60a5fa; text-decoration: none;">{contact.full_phone}</a>
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- Message Card -->
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h2 style="margin: 0 0 15px 0; color: #fbbf24; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                    📝 Message
                </h2>
                <p style="margin: 0; color: #e0e0e0; line-height: 1.6; white-space: pre-wrap;">{contact.message}</p>
            </div>
            
        </div>
        
        <!-- Footer -->
        <div style="padding: 20px 30px; background: rgba(0,0,0,0.2); text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Sent from Portfolio Contact Form • {timestamp_str}
            </p>
        </div>
        
    </div>
</body>
</html>
"""


# =============================================================================
# Email Service (Strategy Pattern)
# =============================================================================

class EmailServiceProtocol(Protocol):
    """Protocol defining the email service interface."""
    
    def send_contact_notification(self, contact: ContactFormData) -> bool:
        """Send contact form notification email."""
        ...


class EmailService:
    """
    Main email service class implementing SMTP email functionality.
    
    Follows Single Responsibility Principle - only handles email sending.
    Uses dependency injection for configuration.
    
    Usage:
        config = EmailConfig(...)
        service = EmailService(config)
        success = service.send_contact_notification(contact_data)
    """
    
    def __init__(self, config: EmailConfig):
        """
        Initialize email service with configuration.
        
        Args:
            config: EmailConfig instance with SMTP settings
        """
        self._config = config
        self._template = ContactFormEmailTemplate()
    
    def send_contact_notification(self, contact: ContactFormData) -> bool:
        """
        Send a contact form notification email asynchronously.
        
        Args:
            contact: ContactFormData with form submission details
            
        Returns:
            bool: True (always returns True to not block user, errors logged)
        """
        if not self._config.is_valid():
            logger.error("Invalid email configuration - missing required fields")
            return False
        
        # Build message in main thread to catch validation errors early
        try:
            message = (
                EmailMessageBuilder()
                .set_subject(self._template.generate_subject(contact))
                .set_body_text(self._template.generate_plain_text(contact))
                .set_body_html(self._template.generate_html(contact))
                .set_from(self._config.sender_email, self._config.sender_name)
                .set_to(self._config.recipient_email)
                .set_reply_to(contact.email)
                .build()
            )
        except Exception as e:
            logger.exception(f"Failed to build email: {e}")
            return False

        # Send in a background thread
        thread = threading.Thread(target=self._send_smtp_thread, args=(message,))
        thread.daemon = True
        thread.start()
        
        return True
    
    def _send_smtp_thread(self, message: MIMEMultipart) -> None:
        """Background thread execution for SMTP sending."""
        try:
            self._send_smtp(message)
        except Exception as e:
            logger.exception(f"Background email send failed: {e}")

    def _send_smtp(self, message: MIMEMultipart) -> bool:
        """
        Send email via SMTP connection with timeout.
        
        Args:
            message: Constructed email message
            
        Returns:
            bool: True if sent successfully
        """
        try:
            # Add timeout to SMTP connection (10 seconds)
            with smtplib.SMTP(self._config.server, self._config.port, timeout=10) as server:
                if self._config.use_tls:
                    server.starttls()
                
                server.login(self._config.username, self._config.password)
                server.send_message(message)
                
                logger.info(f"Email sent successfully to {self._config.recipient_email}")
                return True
                
        except smtplib.SMTPAuthenticationError:
            logger.error("SMTP authentication failed - check username/password")
            return False
        except smtplib.SMTPConnectError:
            logger.error(f"Failed to connect to SMTP server: {self._config.server}:{self._config.port}")
            return False
        except socket.timeout:
            logger.error("SMTP connection timed out")
            return False
        except Exception as e:
            logger.exception(f"Unexpected error sending email: {e}")
            return False
    
    def test_connection(self) -> bool:
        """
        Test SMTP connection without sending an email.
        Useful for configuration validation.
        
        Returns:
            bool: True if connection successful
        """
        try:
            with smtplib.SMTP(self._config.server, self._config.port) as server:
                if self._config.use_tls:
                    server.starttls()
                server.login(self._config.username, self._config.password)
                logger.info("SMTP connection test successful")
                return True
        except Exception as e:
            logger.error(f"SMTP connection test failed: {e}")
            return False


# =============================================================================
# Factory Function
# =============================================================================

def create_email_service(app_config) -> Optional[EmailService]:
    """
    Factory function to create EmailService from Flask app config.
    
    Args:
        app_config: Flask application configuration object
        
    Returns:
        EmailService instance or None if configuration is incomplete
    """
    try:
        config = EmailConfig(
            server=getattr(app_config, 'MAIL_SERVER', 'smtp.gmail.com'),
            port=getattr(app_config, 'MAIL_PORT', 587),
            use_tls=getattr(app_config, 'MAIL_USE_TLS', True),
            username=getattr(app_config, 'MAIL_USERNAME', ''),
            password=getattr(app_config, 'MAIL_PASSWORD', ''),
            sender_email=getattr(app_config, 'MAIL_USERNAME', ''),
            sender_name=getattr(app_config, 'MAIL_SENDER_NAME', 'Portfolio Contact Form'),
            recipient_email=getattr(app_config, 'MAIL_RECIPIENT', 'prabhukumarsivamoorthy@gmail.com')
        )
        
        if not config.is_valid():
            logger.warning("Email service configuration is incomplete")
            return None
        
        return EmailService(config)
        
    except Exception as e:
        logger.exception(f"Failed to create email service: {e}")
        return None
