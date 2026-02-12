#!/usr/bin/env python3
"""
Advanced QR Code Generation Script with Rounded Dots and Gradient Support
Generates QR codes from text/URL input with advanced customization options.
"""

import argparse
import json
import os
import sys
from pathlib import Path
import numpy as np

try:
    import qrcode
    from PIL import Image, ImageDraw
except ImportError as e:
    print(f"Error: Required Python packages not installed: {e}", file=sys.stderr)
    print("Please install: pip install qrcode[pil] pillow numpy", file=sys.stderr)
    sys.exit(1)

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_advanced_qr_code(data, options=None):
    """Generate an advanced QR code with rounded dots and gradient support."""
    if options is None:
        options = {}
    
    # QR code parameters
    qr_version = options.get('version', 1)
    qr_error_correction = options.get('error_correction', 'H')  # High error correction for logo
    qr_box_size = options.get('size', 10)
    qr_border = options.get('border', 4)
    
    # Error correction mapping
    error_correction_map = {
        'L': qrcode.constants.ERROR_CORRECT_L,
        'M': qrcode.constants.ERROR_CORRECT_M, 
        'Q': qrcode.constants.ERROR_CORRECT_Q,
        'H': qrcode.constants.ERROR_CORRECT_H
    }
    error_correction = error_correction_map.get(qr_error_correction.upper(), qrcode.constants.ERROR_CORRECT_H)
    
    # Create QR code matrix
    qr = qrcode.QRCode(
        version=qr_version,
        error_correction=error_correction,
        box_size=qr_box_size,
        border=qr_border,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Get the QR matrix
    qr_matrix = qr.get_matrix()
    matrix_size = len(qr_matrix)
    
    # Calculate image size
    dot_size = qr_box_size
    image_size = matrix_size * dot_size
    
    # Create blank image with white background
    img = Image.new('RGBA', (image_size, image_size), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Get gradient colors from options or use defaults
    start_color_hex = options.get('color', '#8b5cf6')
    end_color_hex = options.get('backgroundColor', '#ec4899')
    
    start_color = hex_to_rgb(start_color_hex)
    end_color = hex_to_rgb(end_color_hex)
    
    # Draw rounded dots
    for y in range(matrix_size):
        for x in range(matrix_size):
            if qr_matrix[y][x]:  # If this position should have a dot
                # Calculate gradient color based on position
                gradient_x = x / (matrix_size - 1) if matrix_size > 1 else 0
                gradient_y = y / (matrix_size - 1) if matrix_size > 1 else 0
                gradient_factor = (gradient_x + gradient_y) / 2
                
                r = int(start_color[0] + (end_color[0] - start_color[0]) * gradient_factor)
                g = int(start_color[1] + (end_color[1] - start_color[1]) * gradient_factor)
                b = int(start_color[2] + (end_color[2] - start_color[2]) * gradient_factor)
                
                # Calculate dot position
                left = x * dot_size
                top = y * dot_size
                right = left + dot_size
                bottom = top + dot_size
                
                # Draw rounded rectangle (circle when dot_size is small)
                radius = dot_size // 2
                draw.rounded_rectangle([left, top, right, bottom], radius=radius, fill=(r, g, b, 255))
    
    return img

def add_logo_to_qr_center(qr_img, logo_path, logo_size_ratio=0.2):
    """Add a logo to the center of the QR code by overlaying it."""
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
    
    # Overlay logo on QR code
    qr_with_logo = qr_img.copy()
    qr_with_logo.paste(logo, position, logo if logo.mode == 'RGBA' else None)
    
    return qr_with_logo

def main():
    parser = argparse.ArgumentParser(description='Generate advanced QR code from input data')
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
        # Generate advanced QR code with rounded dots and gradient
        qr_img = create_advanced_qr_code(data, options)
        
        # Add logo if specified
        logo_path = options.get('logoPath')
        if logo_path and os.path.exists(logo_path):
            qr_img = add_logo_to_qr_center(qr_img, logo_path)
        
        # Save image
        output_path = Path(args.output)
        qr_img.save(output_path, format='PNG')
        
        print(f"Advanced QR code generated successfully: {output_path}")
        
    except Exception as e:
        print(f"Error generating advanced QR code: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()