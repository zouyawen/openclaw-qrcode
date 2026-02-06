#!/usr/bin/env python3
"""
QR Code Beautification Script
Applies visual enhancements to existing QR codes or creates beautiful new ones.
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    import qrcode
    from PIL import Image, ImageDraw, ImageFilter
except ImportError as e:
    print(f"Error: Required Python packages not installed: {e}", file=sys.stderr)
    print("Please install: pip install qrcode[pil] pillow", file=sys.stderr)
    sys.exit(1)

def create_gradient_qr(data, options):
    """Create a QR code with gradient colors."""
    # Create basic QR code in black/white first
    qr = qrcode.QRCode(
        version=options.get('version', 1),
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Higher error correction for gradients
        box_size=options.get('size', 10),
        border=options.get('border', 4),
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Get QR matrix
    qr_matrix = qr.get_matrix()
    size = len(qr_matrix)
    box_size = options.get('size', 10)
    border = options.get('border', 4)
    
    # Calculate image dimensions
    img_size = (size + 2 * border) * box_size
    img = Image.new('RGB', (img_size, img_size), options.get('backgroundColor', 'white'))
    draw = ImageDraw.Draw(img)
    
    # Define colors
    fill_color = options.get('color', 'black')
    if isinstance(fill_color, str) and fill_color.startswith('#'):
        # Convert hex to RGB
        fill_color = tuple(int(fill_color[i:i+2], 16) for i in (1, 3, 5))
    elif isinstance(fill_color, list):
        # RGB list
        fill_color = tuple(fill_color)
    else:
        # Named color - use PIL's color handling
        fill_color = Image.new('RGB', (1, 1), fill_color).getpixel((0, 0))
    
    # Draw QR modules with potential gradient effect
    for y in range(size):
        for x in range(size):
            if qr_matrix[y][x]:
                # Calculate position
                left = (x + border) * box_size
                top = (y + border) * box_size
                right = left + box_size
                bottom = top + box_size
                
                # Apply gradient or pattern if specified
                module_color = fill_color
                
                # Simple gradient effect based on position
                if options.get('gradient', False):
                    # Darker in corners, lighter in center
                    center_x = size // 2
                    center_y = size // 2
                    distance = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
                    max_distance = (center_x ** 2 + center_y ** 2) ** 0.5
                    
                    if max_distance > 0:
                        brightness_factor = 1.0 - (distance / max_distance) * 0.3
                        module_color = tuple(min(255, int(c * brightness_factor)) for c in fill_color)
                
                draw.rectangle([left, top, right, bottom], fill=module_color)
    
    return img

def apply_rounded_corners(img, radius=10):
    """Apply rounded corners to the QR code image."""
    # Create a mask for rounded corners
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, img.size[0], img.size[1]], radius=radius, fill=255)
    
    # Apply mask
    result = Image.new('RGBA', img.size, (255, 255, 255, 0))
    result.paste(img.convert('RGBA'), (0, 0), mask)
    return result

def main():
    parser = argparse.ArgumentParser(description='Beautify QR code')
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
        # Check if input is a file path (existing QR code to beautify)
        if os.path.exists(data):
            # Load existing QR code image
            base_img = Image.open(data)
            
            # Apply beautification effects
            if options.get('roundedCorners', False):
                base_img = apply_rounded_corners(base_img, options.get('cornerRadius', 10))
            
            # Add logo if specified
            logo_path = options.get('logoPath')
            if logo_path and os.path.exists(logo_path):
                from generate_qr import add_logo_to_qr
                base_img = add_logo_to_qr(base_img, logo_path)
            
            qr_img = base_img
        else:
            # Create new beautiful QR code from text/URL
            if options.get('gradient', False):
                qr_img = create_gradient_qr(data, options)
            else:
                # Use standard generation with enhanced options
                from generate_qr import create_qr_code
                qr_img = create_qr_code(data, options)
                
                # Add logo if specified
                logo_path = options.get('logoPath')
                if logo_path and os.path.exists(logo_path):
                    from generate_qr import add_logo_to_qr
                    qr_img = add_logo_to_qr(qr_img, logo_path)
            
            # Apply additional effects
            if options.get('roundedCorners', False):
                qr_img = apply_rounded_corners(qr_img, options.get('cornerRadius', 10))
        
        # Determine output format
        output_path = Path(args.output)
        output_format = options.get('format', 'png').upper()
        
        # Save image
        if output_format == 'PNG':
            qr_img.save(output_path, format='PNG')
        elif output_format == 'JPG':
            # Convert RGBA to RGB for JPG
            if qr_img.mode == 'RGBA':
                background = Image.new('RGB', qr_img.size, (255, 255, 255))
                background.paste(qr_img, mask=qr_img.split()[-1] if len(qr_img.split()) > 3 else None)
                qr_img = background
            qr_img.save(output_path, format='JPEG')
        else:
            qr_img.save(output_path, format=output_format)
        
        print(f"Beautiful QR code created successfully: {output_path}")
        
    except Exception as e:
        print(f"Error beautifying QR code: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()