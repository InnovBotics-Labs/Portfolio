"""
PDF Editor Backend Module
Handles PDF operations: upload, process, merge, and export
Uses PyPDF2 for PDF manipulation and Pillow for image processing
"""

import os
import uuid
import base64
from io import BytesIO
from typing import List, Dict, Any
from werkzeug.utils import secure_filename

# PDF manipulation
from pypdf import PdfReader, PdfWriter

# Image processing
from PIL import Image
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

# Allowed extensions
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}
ALLOWED_PDF_EXTENSIONS = {'pdf'}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_PDF_EXTENSIONS


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_file_extension(filename: str) -> str:
    """Get file extension in lowercase"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''


def create_upload_folder(upload_folder: str) -> None:
    """Create upload folder if it doesn't exist"""
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)


def generate_unique_filename(original_filename: str) -> str:
    """Generate unique filename to avoid conflicts"""
    ext = get_file_extension(original_filename)
    unique_id = uuid.uuid4().hex[:12]
    return f"{unique_id}.{ext}"


def image_to_base64_thumbnail(image_path: str, max_size: tuple = (200, 280)) -> str:
    """Convert image to base64 thumbnail for preview"""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Create thumbnail
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Convert to base64
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            buffer.seek(0)
            return f"data:image/jpeg;base64,{base64.b64encode(buffer.read()).decode()}"
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return ""


def pdf_page_to_base64_thumbnail(pdf_path: str, page_num: int = 0, max_size: tuple = (200, 280)) -> str:
    """Convert PDF page to base64 thumbnail for preview using PyMuPDF"""
    try:
        import fitz  # PyMuPDF
        
        # Open the PDF
        doc = fitz.open(pdf_path)
        
        if page_num >= len(doc):
            doc.close()
            return ""
        
        # Get the page
        page = doc[page_num]
        
        # Render page to image (pixmap)
        # Use a zoom factor for better quality
        zoom = 2.0  # 2x zoom for better quality
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert to PIL Image
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # Close the document
        doc.close()
        
        # Create thumbnail
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        return f"data:image/jpeg;base64,{base64.b64encode(buffer.read()).decode()}"
        
    except ImportError:
        print("PyMuPDF (fitz) not installed. PDF thumbnails will not be generated.")
        return ""
    except Exception as e:
        print(f"Error creating PDF thumbnail: {e}")
        return ""


def process_uploaded_file(file, upload_folder: str) -> List[Dict[str, Any]]:
    """
    Process an uploaded file (image or PDF)
    Returns list of page dictionaries with metadata
    """
    if not file or not file.filename:
        return []
    
    if not allowed_file(file.filename):
        return []
    
    create_upload_folder(upload_folder)
    
    original_filename = secure_filename(file.filename)
    ext = get_file_extension(original_filename)
    unique_filename = generate_unique_filename(original_filename)
    file_path = os.path.join(upload_folder, unique_filename)
    
    file.save(file_path)
    
    pages = []
    
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        # Single image file
        thumbnail = image_to_base64_thumbnail(file_path)
        pages.append({
            'name': original_filename,
            'type': 'image',
            'path': file_path,
            'thumbnail': thumbnail,
        })
    
    elif ext in ALLOWED_PDF_EXTENSIONS:
        # PDF file - extract each page
        try:
            reader = PdfReader(file_path)
            num_pages = len(reader.pages)
            
            # Create individual PDF files for each page
            for i in range(num_pages):
                writer = PdfWriter()
                writer.add_page(reader.pages[i])
                
                page_filename = f"{uuid.uuid4().hex[:12]}_page_{i+1}.pdf"
                page_path = os.path.join(upload_folder, page_filename)
                
                with open(page_path, 'wb') as output:
                    writer.write(output)
                
                thumbnail = pdf_page_to_base64_thumbnail(page_path)
                
                pages.append({
                    'name': f"{original_filename} (Page {i + 1})",
                    'type': 'pdf',
                    'path': page_path,
                    'thumbnail': thumbnail,
                })
            
            # Remove the original uploaded PDF (we've split it)
            os.remove(file_path)
            
        except Exception as e:
            print(f"Error processing PDF: {e}")
            # If extraction fails, treat as single page
            pages.append({
                'name': original_filename,
                'type': 'pdf',
                'path': file_path,
                'thumbnail': '',
            })
    
    return pages


def convert_image_to_pdf(image_path: str, output_path: str, page_size: tuple = A4) -> bool:
    """Convert an image to a PDF page"""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                if img.mode == 'RGBA':
                    background.paste(img, mask=img.split()[-1])
                else:
                    background.paste(img)
                img = background
            
            # Get image dimensions
            img_width, img_height = img.size
            
            # Calculate scaling to fit page while maintaining aspect ratio
            page_width, page_height = page_size
            margin = 36  # 0.5 inch margin
            
            available_width = page_width - (2 * margin)
            available_height = page_height - (2 * margin)
            
            # Calculate scale factor
            scale_w = available_width / img_width
            scale_h = available_height / img_height
            scale = min(scale_w, scale_h)
            
            new_width = img_width * scale
            new_height = img_height * scale
            
            # Center the image on the page
            x = (page_width - new_width) / 2
            y = (page_height - new_height) / 2
            
            # Create PDF
            c = canvas.Canvas(output_path, pagesize=page_size)
            
            # Save image to buffer
            img_buffer = BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            
            c.drawImage(ImageReader(img_buffer), x, y, width=new_width, height=new_height)
            c.save()
            
            return True
    except Exception as e:
        print(f"Error converting image to PDF: {e}")
        return False


def merge_pages_to_pdf(pages: List[Dict[str, Any]], output_path: str, upload_folder: str, 
                        options: Dict[str, Any] = None) -> bool:
    """
    Merge multiple pages (images and PDFs) into a single PDF
    Pages should contain 'path', 'type', and optionally 'rotation' keys
    
    Options:
        - page_size: 'a4', 'letter', 'legal' (default: 'a4')
        - add_page_numbers: bool (default: False)
        - page_number_position: 'bottom' or 'top' (default: 'bottom')
    """
    try:
        options = options or {}
        page_size_name = options.get('page_size', 'a4').lower()
        add_page_numbers = options.get('add_page_numbers', False)
        
        # Page size mapping
        PAGE_SIZES = {
            'a4': A4,
            'letter': letter,
            'legal': (612, 1008),  # 8.5 x 14 inches
        }
        page_size = PAGE_SIZES.get(page_size_name, A4)
        
        writer = PdfWriter()
        temp_files = []
        
        for page in pages:
            page_path = page.get('path', '')
            page_type = page.get('type', 'image')
            rotation = page.get('rotation', 0)  # Rotation in degrees (0, 90, 180, 270)
            
            if not os.path.exists(page_path):
                continue
            
            if page_type == 'image':
                # Convert image to PDF first
                temp_pdf_path = os.path.join(upload_folder, f"temp_{uuid.uuid4().hex[:8]}.pdf")
                if convert_image_to_pdf(page_path, temp_pdf_path, page_size=page_size):
                    reader = PdfReader(temp_pdf_path)
                    for pdf_page in reader.pages:
                        # Apply rotation if specified
                        if rotation != 0:
                            pdf_page.rotate(rotation)
                        writer.add_page(pdf_page)
                    temp_files.append(temp_pdf_path)
            
            elif page_type == 'pdf':
                reader = PdfReader(page_path)
                for pdf_page in reader.pages:
                    # Apply rotation if specified
                    if rotation != 0:
                        pdf_page.rotate(rotation)
                    writer.add_page(pdf_page)
        
        # Write the merged PDF first
        with open(output_path, 'wb') as output:
            writer.write(output)
        
        # Add page numbers if requested
        if add_page_numbers and len(writer.pages) > 0:
            add_page_numbers_to_pdf(output_path, output_path)
        
        # Cleanup temp files
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
            except:
                pass
        
        return True
    
    except Exception as e:
        print(f"Error merging pages: {e}")
        return False


def add_page_numbers_to_pdf(input_path: str, output_path: str, position: str = 'bottom') -> bool:
    """
    Add page numbers to an existing PDF
    """
    try:
        import fitz  # PyMuPDF
        
        doc = fitz.open(input_path)
        total_pages = len(doc)
        
        for page_num in range(total_pages):
            page = doc[page_num]
            rect = page.rect
            
            # Create page number text
            text = f"{page_num + 1} / {total_pages}"
            
            # Position: bottom center
            if position == 'bottom':
                x = rect.width / 2
                y = rect.height - 30
            else:  # top
                x = rect.width / 2
                y = 30
            
            # Insert text
            page.insert_text(
                (x - 20, y),
                text,
                fontsize=10,
                fontname="helv",
                color=(0.4, 0.4, 0.4)
            )
        
        # Save to output path
        if input_path == output_path:
            doc.saveIncr()
        else:
            doc.save(output_path)
        doc.close()
        
        return True
    except Exception as e:
        print(f"Error adding page numbers: {e}")
        return False


def add_watermark_to_pdf(input_path: str, output_path: str, watermark_text: str,
                          opacity: float = 0.3, position: str = 'center') -> bool:
    """
    Add text watermark to all pages of a PDF
    """
    try:
        import fitz  # PyMuPDF
        import math
        
        doc = fitz.open(input_path)
        
        # Calculate color with opacity (lighter = more transparent)
        gray_value = 0.7 + (1 - opacity) * 0.25  # Range from 0.7 to 0.95
        color = (gray_value, gray_value, gray_value)
        
        for page in doc:
            rect = page.rect
            
            if position == 'diagonal':
                # Create diagonal watermark using shape with rotation
                fontsize = 60
                
                # Calculate center of page
                center_x = rect.width / 2
                center_y = rect.height / 2
                
                # Create a shape for drawing
                shape = page.new_shape()
                
                # Calculate text position to center it
                text_length = len(watermark_text) * fontsize * 0.5
                start_x = center_x - text_length / 2
                start_y = center_y
                
                # Draw text at an angle using morph (rotation transformation)
                # morph = (pivot_point, matrix) where matrix includes rotation
                pivot = fitz.Point(center_x, center_y)
                angle = -45  # Negative for diagonal from bottom-left to top-right
                
                # Create rotation matrix
                mat = fitz.Matrix(1, 0, 0, 1, 0, 0).prerotate(angle)
                
                # Insert text with rotation using text insertion point
                text_point = fitz.Point(start_x, start_y)
                
                # Use insert_text with morph parameter for rotation
                page.insert_text(
                    text_point,
                    watermark_text,
                    fontsize=fontsize,
                    fontname="helv",
                    color=color,
                    morph=(pivot, mat)
                )
                
            elif position == 'center':
                fontsize = 48
                text_width = len(watermark_text) * fontsize * 0.4
                x = (rect.width - text_width) / 2
                y = rect.height / 2
                page.insert_text((x, y), watermark_text, fontsize=fontsize, fontname="helv", color=color)
            elif position == 'top':
                fontsize = 24
                text_width = len(watermark_text) * fontsize * 0.4
                x = (rect.width - text_width) / 2
                page.insert_text((x, 50), watermark_text, fontsize=fontsize, fontname="helv", color=color)
            else:  # bottom
                fontsize = 24
                text_width = len(watermark_text) * fontsize * 0.4
                x = (rect.width - text_width) / 2
                page.insert_text((x, rect.height - 50), watermark_text, fontsize=fontsize, fontname="helv", color=color)
        
        # Always save to a new file then rename if same path
        if input_path == output_path:
            temp_path = output_path + ".temp.pdf"
            doc.save(temp_path)
            doc.close()
            os.replace(temp_path, output_path)
        else:
            doc.save(output_path)
            doc.close()
        
        return True
    except Exception as e:
        print(f"Error adding watermark: {e}")
        import traceback
        traceback.print_exc()
        return False


def compress_pdf(input_path: str, output_path: str, quality: str = 'medium') -> bool:
    """
    Compress a PDF file to reduce size
    
    Args:
        input_path: Path to input PDF
        output_path: Path to output PDF
        quality: 'low', 'medium', 'high' (lower = smaller file, more compression)
    """
    try:
        import fitz  # PyMuPDF
        
        # Quality settings (image DPI and JPEG quality)
        quality_settings = {
            'low': {'dpi': 72, 'jpeg_quality': 50},
            'medium': {'dpi': 100, 'jpeg_quality': 70},
            'high': {'dpi': 150, 'jpeg_quality': 85},
        }
        
        settings = quality_settings.get(quality, quality_settings['medium'])
        
        doc = fitz.open(input_path)
        
        # Compress images in the PDF
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list):
                try:
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    
                    # Convert to PIL Image and compress
                    pil_image = Image.open(BytesIO(image_bytes))
                    
                    # Resize if large
                    max_dim = settings['dpi'] * 8  # Approximate 8 inch max dimension
                    if max(pil_image.size) > max_dim:
                        ratio = max_dim / max(pil_image.size)
                        new_size = (int(pil_image.size[0] * ratio), int(pil_image.size[1] * ratio))
                        pil_image = pil_image.resize(new_size, Image.Resampling.LANCZOS)
                    
                    # Convert to RGB and save as JPEG
                    if pil_image.mode in ('RGBA', 'LA', 'P'):
                        pil_image = pil_image.convert('RGB')
                    
                    compressed_buffer = BytesIO()
                    pil_image.save(compressed_buffer, format='JPEG', quality=settings['jpeg_quality'], optimize=True)
                    compressed_buffer.seek(0)
                    
                except Exception as img_error:
                    # Skip images that can't be compressed
                    continue
        
        # Save with garbage collection and compression
        doc.save(
            output_path,
            garbage=4,
            deflate=True,
            clean=True,
        )
        doc.close()
        
        return True
    except Exception as e:
        print(f"Error compressing PDF: {e}")
        return False


def add_password_to_pdf(input_path: str, output_path: str, user_password: str,
                         owner_password: str = None) -> bool:
    """
    Add password protection to a PDF
    """
    try:
        import fitz  # PyMuPDF
        
        if owner_password is None:
            owner_password = user_password
        
        doc = fitz.open(input_path)
        
        perm = fitz.PDF_PERM_PRINT | fitz.PDF_PERM_COPY
        
        # Use temp file when saving to same path
        if input_path == output_path:
            temp_path = output_path + ".temp.pdf"
            doc.save(
                temp_path,
                encryption=fitz.PDF_ENCRYPT_AES_256,
                user_pw=user_password,
                owner_pw=owner_password,
                permissions=perm
            )
            doc.close()
            os.replace(temp_path, output_path)
        else:
            doc.save(
                output_path,
                encryption=fitz.PDF_ENCRYPT_AES_256,
                user_pw=user_password,
                owner_pw=owner_password,
                permissions=perm
            )
            doc.close()
        
        return True
    except Exception as e:
        print(f"Error adding password: {e}")
        return False


def split_pdf(input_path: str, output_folder: str, page_ranges: List[tuple]) -> List[str]:
    """
    Split a PDF into multiple files based on page ranges
    
    Args:
        input_path: Path to input PDF
        output_folder: Folder to save split PDFs
        page_ranges: List of tuples like [(1, 3), (4, 6)] for pages 1-3 and 4-6
    
    Returns:
        List of paths to created PDF files
    """
    try:
        import fitz  # PyMuPDF
        
        create_upload_folder(output_folder)
        doc = fitz.open(input_path)
        output_files = []
        
        for i, (start, end) in enumerate(page_ranges):
            # Adjust to 0-based indexing
            start_idx = max(0, start - 1)
            end_idx = min(len(doc), end)
            
            if start_idx >= end_idx:
                continue
            
            # Create new document with selected pages
            new_doc = fitz.open()
            new_doc.insert_pdf(doc, from_page=start_idx, to_page=end_idx - 1)
            
            output_filename = f"split_{i+1}_pages_{start}-{end}_{uuid.uuid4().hex[:6]}.pdf"
            output_path = os.path.join(output_folder, output_filename)
            
            new_doc.save(output_path)
            new_doc.close()
            output_files.append(output_path)
        
        doc.close()
        return output_files
        
    except Exception as e:
        print(f"Error splitting PDF: {e}")
        return []


# ============================================
# Phase 3: Advanced Features
# ============================================

def add_signature_to_pdf(input_path: str, output_path: str, signature_data: str,
                          page_num: int = -1, x: float = 100, y: float = 100,
                          width: float = 150, height: float = 50) -> bool:
    """
    Add a signature image to PDF pages
    
    Args:
        input_path: Path to input PDF
        output_path: Path to output PDF
        signature_data: Base64 encoded signature image
        page_num: Page to add signature (-1 for last page, 0 for all pages)
        x, y: Position of signature
        width, height: Size of signature
    """
    try:
        import fitz
        
        # Decode signature from base64
        if ',' in signature_data:
            signature_data = signature_data.split(',')[1]
        
        signature_bytes = base64.b64decode(signature_data)
        
        doc = fitz.open(input_path)
        
        # Determine which pages to add signature
        if page_num == -1:
            pages_to_sign = [len(doc) - 1]  # Last page
        elif page_num == 0:
            pages_to_sign = list(range(len(doc)))  # All pages
        else:
            pages_to_sign = [min(page_num - 1, len(doc) - 1)]  # Specific page
        
        for page_idx in pages_to_sign:
            page = doc[page_idx]
            rect = page.rect
            
            # Calculate position (y from bottom in PDF coordinates)
            sig_rect = fitz.Rect(x, rect.height - y - height, x + width, rect.height - y)
            
            # Insert signature image
            page.insert_image(sig_rect, stream=signature_bytes)
        
        # Use temp file when saving to same path
        if input_path == output_path:
            temp_path = output_path + ".temp.pdf"
            doc.save(temp_path)
            doc.close()
            os.replace(temp_path, output_path)
        else:
            doc.save(output_path)
            doc.close()
        
        return True
    except Exception as e:
        print(f"Error adding signature: {e}")
        return False


def add_text_to_pdf(input_path: str, output_path: str, text_annotations: List[Dict]) -> bool:
    """
    Add text annotations to PDF pages
    
    Args:
        input_path: Path to input PDF
        output_path: Path to output PDF
        text_annotations: List of dicts with {page, x, y, text, fontSize, color}
    """
    try:
        import fitz
        
        doc = fitz.open(input_path)
        
        for annotation in text_annotations:
            page_num = annotation.get('page', 1) - 1
            if page_num < 0 or page_num >= len(doc):
                continue
            
            page = doc[page_num]
            rect = page.rect
            
            x = annotation.get('x', 50)
            y = annotation.get('y', 50)
            text = annotation.get('text', '')
            font_size = annotation.get('fontSize', 12)
            color_hex = annotation.get('color', '#000000')
            
            # Convert hex color to RGB tuple (0-1 range)
            color_hex = color_hex.lstrip('#')
            r = int(color_hex[0:2], 16) / 255
            g = int(color_hex[2:4], 16) / 255
            b = int(color_hex[4:6], 16) / 255
            
            # Adjust y for PDF coordinate system
            pdf_y = rect.height - y
            
            page.insert_text(
                (x, pdf_y),
                text,
                fontsize=font_size,
                fontname="helv",
                color=(r, g, b)
            )
        
        doc.save(output_path)
        doc.close()
        
        return True
    except Exception as e:
        print(f"Error adding text: {e}")
        return False


def add_annotations_to_pdf(input_path: str, output_path: str, annotations: List[Dict]) -> bool:
    """
    Add drawing annotations (highlights, underlines, shapes) to PDF
    
    Args:
        input_path: Path to input PDF
        output_path: Path to output PDF
        annotations: List of annotation dicts with type-specific properties
    """
    try:
        import fitz
        
        doc = fitz.open(input_path)
        
        for annot in annotations:
            page_num = annot.get('page', 1) - 1
            if page_num < 0 or page_num >= len(doc):
                continue
            
            page = doc[page_num]
            rect = page.rect
            annot_type = annot.get('type', 'highlight')
            
            # Get color
            color_hex = annot.get('color', '#FFFF00')
            color_hex = color_hex.lstrip('#')
            r = int(color_hex[0:2], 16) / 255
            g = int(color_hex[2:4], 16) / 255
            b = int(color_hex[4:6], 16) / 255
            
            if annot_type == 'highlight':
                x1, y1 = annot.get('x1', 0), annot.get('y1', 0)
                x2, y2 = annot.get('x2', 100), annot.get('y2', 20)
                highlight_rect = fitz.Rect(x1, rect.height - y2, x2, rect.height - y1)
                highlight = page.add_highlight_annot(highlight_rect)
                highlight.set_colors(stroke=(r, g, b))
                highlight.update()
                
            elif annot_type == 'underline':
                x1, y1 = annot.get('x1', 0), annot.get('y1', 0)
                x2, y2 = annot.get('x2', 100), annot.get('y2', 20)
                underline_rect = fitz.Rect(x1, rect.height - y2, x2, rect.height - y1)
                underline = page.add_underline_annot(underline_rect)
                underline.set_colors(stroke=(r, g, b))
                underline.update()
                
            elif annot_type == 'rectangle':
                x1, y1 = annot.get('x1', 0), annot.get('y1', 0)
                x2, y2 = annot.get('x2', 100), annot.get('y2', 100)
                shape_rect = fitz.Rect(x1, rect.height - y2, x2, rect.height - y1)
                shape = page.draw_rect(shape_rect, color=(r, g, b), width=2)
                
            elif annot_type == 'circle':
                x1, y1 = annot.get('x1', 0), annot.get('y1', 0)
                x2, y2 = annot.get('x2', 100), annot.get('y2', 100)
                shape_rect = fitz.Rect(x1, rect.height - y2, x2, rect.height - y1)
                page.draw_oval(shape_rect, color=(r, g, b), width=2)
                
            elif annot_type == 'line':
                x1, y1 = annot.get('x1', 0), annot.get('y1', 0)
                x2, y2 = annot.get('x2', 100), annot.get('y2', 100)
                page.draw_line(
                    fitz.Point(x1, rect.height - y1),
                    fitz.Point(x2, rect.height - y2),
                    color=(r, g, b),
                    width=2
                )
                
            elif annot_type == 'freehand':
                # Freehand drawing from list of points
                points = annot.get('points', [])
                if len(points) > 1:
                    for i in range(len(points) - 1):
                        p1 = points[i]
                        p2 = points[i + 1]
                        page.draw_line(
                            fitz.Point(p1['x'], rect.height - p1['y']),
                            fitz.Point(p2['x'], rect.height - p2['y']),
                            color=(r, g, b),
                            width=annot.get('strokeWidth', 2)
                        )
        
        doc.save(output_path)
        doc.close()
        
        return True
    except Exception as e:
        print(f"Error adding annotations: {e}")
        return False


# ============================================
# Phase 4: Premium Features
# ============================================

def apply_ocr_to_pdf(input_path: str, output_path: str, language: str = 'eng') -> bool:
    """
    Apply OCR to make a scanned PDF searchable
    Uses PyMuPDF's built-in OCR capabilities (requires Tesseract)
    
    Args:
        input_path: Path to input PDF
        output_path: Path to output PDF
        language: OCR language code (e.g., 'eng', 'fra', 'deu')
    """
    try:
        import fitz
        
        # Check if Tesseract is available
        try:
            import pytesseract
            tesseract_available = True
        except ImportError:
            tesseract_available = False
        
        doc = fitz.open(input_path)
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Get page as image
            pix = page.get_pixmap(dpi=300)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            if tesseract_available:
                try:
                    # Use pytesseract for OCR
                    import pytesseract
                    ocr_data = pytesseract.image_to_data(img, lang=language, output_type=pytesseract.Output.DICT)
                    
                    # Add invisible text layer
                    for i, text in enumerate(ocr_data['text']):
                        if text.strip():
                            x = ocr_data['left'][i]
                            y = ocr_data['top'][i]
                            w = ocr_data['width'][i]
                            h = ocr_data['height'][i]
                            
                            # Scale coordinates to PDF page size
                            scale_x = page.rect.width / pix.width
                            scale_y = page.rect.height / pix.height
                            
                            pdf_x = x * scale_x
                            pdf_y = y * scale_y
                            
                            # Insert invisible text
                            page.insert_text(
                                (pdf_x, pdf_y + h * scale_y),
                                text,
                                fontsize=h * scale_y * 0.8,
                                fontname="helv",
                                color=(1, 1, 1),  # White (invisible on white bg)
                                render_mode=3  # Invisible text mode
                            )
                except Exception as ocr_error:
                    print(f"OCR error on page {page_num + 1}: {ocr_error}")
                    continue
        
        doc.save(output_path)
        doc.close()
        
        return True
    except Exception as e:
        print(f"Error applying OCR: {e}")
        return False


def add_background_color_to_pdf(input_path: str, output_path: str, 
                                 color: str = '#FFFFFF', opacity: float = 1.0) -> bool:
    """
    Add background color to all pages of a PDF
    
    Args:
        input_path: Path to input PDF
        output_path: Path to output PDF
        color: Hex color code (e.g., '#F5F5DC' for beige)
        opacity: Background opacity (0.0 to 1.0)
    """
    try:
        import fitz
        
        # Parse hex color
        color = color.lstrip('#')
        r = int(color[0:2], 16) / 255
        g = int(color[2:4], 16) / 255
        b = int(color[4:6], 16) / 255
        
        doc = fitz.open(input_path)
        
        for page in doc:
            rect = page.rect
            
            # Create a shape to draw background
            shape = page.new_shape()
            shape.draw_rect(rect)
            shape.finish(fill=(r, g, b), fill_opacity=opacity)
            shape.commit(overlay=False)  # Draw behind existing content
        
        doc.save(output_path)
        doc.close()
        
        return True
    except Exception as e:
        print(f"Error adding background color: {e}")
        return False


def cleanup_page_file(file_path: str) -> bool:
    """Remove a page file from the upload folder"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error cleaning up file: {e}")
        return False


def cleanup_upload_folder(upload_folder: str) -> int:
    """Remove all files from the upload folder"""
    count = 0
    try:
        if os.path.exists(upload_folder):
            for filename in os.listdir(upload_folder):
                file_path = os.path.join(upload_folder, filename)
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    count += 1
        return count
    except Exception as e:
        print(f"Error cleaning up folder: {e}")
        return count
