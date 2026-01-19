"""
Portfolio Server
================
Main Flask application serving the portfolio website with integrated tools.

Author: Prabhukumar Sivamoorthy
Purpose: Acts as a server for the portfolio website
"""

# =============================================================================
# Dependencies
# =============================================================================
import os
import logging
from flask import (
    Flask, 
    render_template, 
    request, 
    send_from_directory, 
    url_for, 
    jsonify, 
    flash
)
from werkzeug.utils import redirect
from config import Config

# Internal Modules
from tools.wt_forms import PingMeForm, RegisterForm, LoginForm
from tools.email_service import EmailService, EmailConfig, ContactFormData, create_email_service
from tools.pdf_editor import (
    process_uploaded_file,
    merge_pages_to_pdf,
    cleanup_page_file,
    cleanup_upload_folder,
    add_watermark_to_pdf,
    compress_pdf,
    add_password_to_pdf,
    add_signature_to_pdf,
    add_text_to_pdf,
    add_annotations_to_pdf,
    apply_ocr_to_pdf,
    add_background_color_to_pdf
)
from tools.data_converter import convert_data

# =============================================================================
# Application Configuration
# =============================================================================

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask App
app = Flask(__name__)
app.config.from_object(Config)

# PDF Editor upload folder configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'pdf_editor')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max upload size

# Initialize Email Service
email_service = create_email_service(Config)
if email_service:
    logger.info("Email service initialized successfully")
else:
    logger.warning("Email service not configured - contact form emails will not be sent")


# =============================================================================
# Main Routes
# =============================================================================

@app.route('/')
def home() -> str:
    """
    Homepage of the Portfolio website.
    Renders the main index page with the contact form.
    """
    ping_form = PingMeForm()
    return render_template('index.html', form=ping_form)


@app.route("/ping", methods=['GET', 'POST'])
def ping():
    """
    Handle contact form (Ping Me) submissions.
    Validates form data and sends email notification.
    
    Returns:
        Redirect to home with flash message indicating success/failure
    """
    form = PingMeForm()
    
    if form.validate_on_submit() and request.method == 'POST':
        data = request.form
        
        # Create contact data object
        contact = ContactFormData(
            first_name=data.get("f_name", ""),
            last_name=data.get("l_name", ""),
            email=data.get("email", ""),
            country_code=data.get("country_code", ""),
            phone=data.get("phone", ""),
            message=data.get("message", "")
        )
        
        # Send email notification
        if email_service:
            success = email_service.send_contact_notification(contact)
            if success:
                flash("Thank you! Your message has been sent successfully.", "success")
                logger.info(f"Contact form submitted by {contact.email}")
            else:
                flash("Sorry, there was an issue sending your message. Please try again later.", "error")
                logger.error(f"Failed to send contact form email for {contact.email}")
        else:
            # Email service not configured - log the submission
            logger.warning(f"Email service not configured. Contact from: {contact.email}")
            flash("Thank you for your message! We'll get back to you soon.", "info")
        
        return redirect(url_for('home') + '#contact')
    
    return redirect(url_for('home'))


@app.route('/download')
def download():
    """Downloads the resume file."""
    return send_from_directory('static', path="assets/files/under-construction-sign.pdf")


@app.route('/portal')
def portal():
    """Portal page for authenticated users."""
    return render_template('Pages/portal.html')


@app.route('/login')
def login():
    """Login page."""
    login_form = LoginForm()
    return render_template('Pages/login.html', form=login_form)


@app.route('/register')
def register():
    """Registration page."""
    register_form = RegisterForm()
    return render_template('Pages/login.html', form=register_form)


# =============================================================================
# PDF Editor Routes
# =============================================================================

@app.route('/pdf-editor')
def pdf_editor():
    """PDF Editor page."""
    return render_template('Pages/pdf_editor.html')


@app.route('/api/pdf/upload', methods=['POST'])
def pdf_upload():
    """
    API endpoint to upload files for PDF editor.
    Accepts images and PDF files.
    
    Returns:
        JSON: Page metadata with thumbnails
    """
    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400
    
    files = request.files.getlist('files')
    all_pages = []
    
    for file in files:
        pages = process_uploaded_file(file, app.config['UPLOAD_FOLDER'])
        all_pages.extend(pages)
    
    return jsonify({'pages': all_pages})


@app.route('/api/pdf/export', methods=['POST'])
def pdf_export():
    """
    API endpoint to export merged PDF with all processing options.
    Supports watermarks, compression, password protection, annotations, etc.
    """
    data = request.get_json()
    
    if not data or 'pages' not in data:
        return jsonify({'error': 'No pages provided'}), 400
    
    pages = data['pages']
    
    if not pages:
        return jsonify({'error': 'Pages array is empty'}), 400
    
    # Get export options
    custom_filename = data.get('filename', 'document')
    custom_filename = "".join(c for c in custom_filename if c.isalnum() or c in (' ', '-', '_')).strip()
    if not custom_filename:
        custom_filename = 'document'
    
    options = {
        'page_size': data.get('pageSize', 'a4'),
        'add_page_numbers': data.get('addPageNumbers', False),
    }
    
    # Phase 2 options
    should_compress = data.get('compress', False)
    compression_quality = data.get('compressionQuality', 'medium')
    watermark_options = data.get('watermark', None)
    password = data.get('password', None)
    
    # Phase 3 & 4 options
    signature_data = data.get('signature', None)
    text_annotations = data.get('textAnnotations', [])
    drawing_annotations = data.get('drawingAnnotations', [])
    apply_ocr = data.get('applyOcr', False)
    ocr_language = data.get('ocrLanguage', 'eng')
    background_color = data.get('backgroundColor', None)
    
    # Create output PDF
    output_filename = f"merged_{os.urandom(8).hex()}.pdf"
    output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
    
    success = merge_pages_to_pdf(pages, output_path, app.config['UPLOAD_FOLDER'], options)
    
    if not success:
        return jsonify({'error': 'Failed to merge PDF'}), 500
    
    try:
        # Apply background color first (before other content)
        if background_color:
            add_background_color_to_pdf(
                output_path, output_path,
                color=background_color.get('color', '#FFFFFF'),
                opacity=background_color.get('opacity', 1.0)
            )
        
        # Apply OCR if requested (Phase 4)
        if apply_ocr:
            apply_ocr_to_pdf(output_path, output_path, language=ocr_language)
        
        # Add watermark if specified (Phase 2)
        if watermark_options and watermark_options.get('text'):
            add_watermark_to_pdf(
                output_path, output_path,
                watermark_options['text'],
                opacity=watermark_options.get('opacity', 0.3),
                position=watermark_options.get('position', 'diagonal')
            )
        
        # Add text annotations (Phase 3)
        if text_annotations:
            add_text_to_pdf(output_path, output_path, text_annotations)
        
        # Add drawing annotations (Phase 3)
        if drawing_annotations:
            add_annotations_to_pdf(output_path, output_path, drawing_annotations)
        
        # Add signature if provided (Phase 3)
        if signature_data and signature_data.get('data'):
            add_signature_to_pdf(
                output_path, output_path,
                signature_data['data'],
                page_num=signature_data.get('page', -1),
                x=signature_data.get('x', 100),
                y=signature_data.get('y', 100),
                width=signature_data.get('width', 150),
                height=signature_data.get('height', 50)
            )
        
        # Compress if requested (Phase 2)
        if should_compress:
            compress_pdf(output_path, output_path, quality=compression_quality)
        
        # Add password protection last (Phase 2)
        if password:
            add_password_to_pdf(output_path, output_path, password)
        
        # Read the file into memory
        with open(output_path, 'rb') as f:
            pdf_data = f.read()
        
        # Delete the file
        os.remove(output_path)
        
        from flask import Response
        response = Response(
            pdf_data,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename={custom_filename}.pdf',
                'Content-Length': len(pdf_data)
            }
        )
        return response
        
    except Exception as e:
        logger.error(f"Error sending PDF: {e}")
        if os.path.exists(output_path):
            os.remove(output_path)
        return jsonify({'error': 'Failed to send PDF'}), 500


@app.route('/api/pdf/delete-page', methods=['POST'])
def pdf_delete_page():
    """
    API endpoint to delete a specific page file.
    Ensures path security by validating against upload folder.
    """
    data = request.get_json()
    
    if not data or 'path' not in data:
        return jsonify({'error': 'No path provided'}), 400
    
    file_path = data['path']
    
    # Security: ensure the path is within upload folder
    upload_folder = os.path.abspath(app.config['UPLOAD_FOLDER'])
    file_path = os.path.abspath(file_path)
    
    if not file_path.startswith(upload_folder):
        return jsonify({'error': 'Invalid path'}), 403
    
    success = cleanup_page_file(file_path)
    
    return jsonify({'success': success})


@app.route('/api/pdf/clear', methods=['POST'])
def pdf_clear():
    """API endpoint to clear all uploaded files."""
    count = cleanup_upload_folder(app.config['UPLOAD_FOLDER'])
    return jsonify({'success': True, 'deleted': count})


# =============================================================================
# Data Converter Routes
# =============================================================================

@app.route('/data-converter')
def data_converter():
    """Data Converter page."""
    return render_template('Pages/data_converter.html')


@app.route('/api/convert-data', methods=['POST'])
def api_convert_data():
    """
    API endpoint for data conversion.
    
    Expects JSON: { content: str, inputFormat: str, outputFormat: str }
    Returns: JSON with converted data or error message
    """
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
        
    content = data.get('content', '')
    input_fmt = data.get('inputFormat', 'json')
    output_fmt = data.get('outputFormat', 'xml')
    
    result = convert_data(content, input_fmt, output_fmt)
    return jsonify(result)


# =============================================================================
# Entry Point
# =============================================================================

if __name__ == "__main__":
    app.run(debug=app.config["DEBUG"])
