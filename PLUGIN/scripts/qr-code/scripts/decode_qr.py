#!/usr/bin/env python3
"""
QR Code Decoding Script
Extracts data from QR code images.
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from pyzbar import pyzbar
    from PIL import Image
except ImportError as e:
    print(f"Error: Required Python packages not installed: {e}", file=sys.stderr)
    print("Please install: pip install pyzbar pillow", file=sys.stderr)
    sys.exit(1)

def decode_qr_code(image_path):
    """Decode QR code from image file."""
    if not Path(image_path).exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    # Open and decode image
    image = Image.open(image_path)
    decoded_objects = pyzbar.decode(image)
    
    if not decoded_objects:
        raise ValueError("No QR codes found in the image")
    
    # Return all decoded data
    results = []
    for obj in decoded_objects:
        results.append({
            'data': obj.data.decode('utf-8'),
            'type': obj.type,
            'rect': {
                'left': obj.rect.left,
                'top': obj.rect.top, 
                'width': obj.rect.width,
                'height': obj.rect.height
            }
        })
    
    return results

def main():
    parser = argparse.ArgumentParser(description='Decode QR code from image')
    parser.add_argument('--input', required=True, help='Path to input JSON file')
    parser.add_argument('--output', required=True, help='Path to output JSON file')
    args = parser.parse_args()
    
    # Read input data
    with open(args.input, 'r') as f:
        input_data = json.load(f)
    
    image_path = input_data.get('input')
    if not image_path:
        print("Error: No image path provided", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Decode QR code
        results = decode_qr_code(image_path)
        
        # Prepare output
        output_data = {
            'success': True,
            'results': results,
            'count': len(results)
        }
        
        # Save output as JSON (the plugin will handle displaying results)
        with open(args.output, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"QR code decoded successfully: {len(results)} codes found")
        
    except Exception as e:
        error_output = {
            'success': False,
            'error': str(e)
        }
        with open(args.output, 'w') as f:
            json.dump(error_output, f, indent=2)
        print(f"Error decoding QR code: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()