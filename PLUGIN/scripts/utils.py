#!/usr/bin/env python3
"""
Shared utility functions for QR code operations.
"""

import os
from PIL import Image, ImageDraw

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