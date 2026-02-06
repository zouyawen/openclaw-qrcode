#!/usr/bin/env python3
"""
QR Code Generation Script
Generates QR codes from text/URL input with customization options.
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    import qrcode
    from PIL import Image, ImageDraw
except ImportError as e:
    print(f"Error: Required Python packages not installed: {e}", file=sys.stderr)
    print("Please install: pip install qrcode[pil] pillow", file=sys.stderr)
    sys.exit(1)

def create_qr_code(data, options=None):
    """Generate a QR code with specified options."""
    if options is None:
        options = {}
    
    # QR code parameters
    qr_version = options.get('version', 1)
    qr_error_correction = options.get('error_correction', 'M')
    qr_box_size = options.get('size', 10)
    qr_border = options.get('border', 4)
    
    # Color options
    fill_color = options.get('color', 'black')
    back_color = options.get('backgroundColor', 'white')
    
    # Error correction mapping
    error_correction_map = {
        'L': qrcode.constants.ERROR_CORRECT_L,
        'M': qrcode.constants.ERROR_CORRECT_M, 
        'Q': qrcode.constants.ERROR_CORRECT_Q,
        'H': qrcode.constants.ERROR_CORRECT_H
    }
    error_correction = error_correction_map.get(qr_error_correction.upper(), qrcode.constants.ERROR_CORRECT_M)
    
    # Create QR code
    qr = qrcode.QRCode(
        version=qr_version,
        error_correction=error_correction,
        box_size=qr_box_size,
        border=qr_border,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Generate image
    img = qr.make_image(fill_color=fill_color, back_color=back_color)
    return img

def add_logo_to_qr(qr_img, logo_path, logo_size_ratio=0.2):
    """Add a logo to the center of the QR code."""
    if not os.path.exists(logo_path):
        raise FileNotFoundError(f"Logo file not found: {logo_path}")
    
    # Open logo
    logo = Image.open(logo_path)
    
    # Calculate logo size (percentage of QR code size)
    qr_width, qr_height = qr_img.size
    logo_max_size = int(min(qr_width, qr_height) * logo_size_ratio)
    
    # Resize logo maintaining aspect ratio
    logo.thumbnail((logo_max_size, logo_max_size), Image.Resampling.LANCZOS)
    
    # Calculate position (center)
    logo_width, logo_height = logo.size
    position = ((qr_width - logo_width) // 2, (qr_height - logo_height) // 2)
    
    # Create a copy to avoid modifying original
    qr_with_logo = qr_img.copy()
    qr_with_logo.paste(logo, position, logo if logo.mode == 'RGBA' else None)
    
    return qr_with_logo

def main():
    parser = argparse.ArgumentParser(description='Generate QR code from input data')
    parser.add_argument('--input', required=True, help='Path to input JSON file')
    parser.add_argument('--output', required=True, help='Path to output image file')
    args = parser.parse_args()
    
    # Read input data
    with open(args.input, 'r') as f:
        input_data = json.load(f)
    
    data = input_data.get('input')
    options = input_data.get('options', {})
    
    if not data:
        print("Error: No input data provided", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Generate basic QR code
        qr_img = create_qr_code(data, options)
        
        # Add logo if specified
        logo_path = options.get('logoPath')
        if logo_path and os.path.exists(logo_path):
            qr_img = add_logo_to_qr(qr_img, logo_path)
        
        # Determine output format
        output_path = Path(args.output)
        output_format = options.get('format', 'png').upper()
        
        # Save image
        if output_format == 'SVG':
            # SVG requires different handling
            import qrcode.image.svg
            factory = qrcode.image.svg.SvgPathImage
            qr_svg = qrcode.make(data, image_factory=factory)
            qr_svg.save(output_path)
        else:
            # PNG/JPG handling
            qr_img.save(output_path, format=output_format)
        
        print(f"QR code generated successfully: {output_path}")
        
    except Exception as e:
        print(f"Error generating QR code: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()