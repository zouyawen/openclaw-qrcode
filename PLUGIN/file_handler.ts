import { existsSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export async function detectInputType(input: string): Promise<'text' | 'filepath' | 'base64' | 'url'> {
  // Check if it's a file path
  if (existsSync(input)) {
    return 'filepath';
  }
  
  // Check if it's a base64 data URI
  if (input.startsWith('data:image/')) {
    return 'base64';
  }
  
  // Check if it's a URL
  try {
    new URL(input);
    return 'url';
  } catch {
    // Not a valid URL
  }
  
  // Assume it's plain text
  return 'text';
}

export async function processBase64Image(base64Data: string): Promise<string> {
  // Extract base64 part
  const base64Regex = /^data:image\/\w+;base64,(.+)$/;
  const match = base64Data.match(base64Regex);
  
  if (!match) {
    throw new Error('Invalid base64 image data');
  }
  
  const base64String = match[1];
  const buffer = Buffer.from(base64String, 'base64');
  const tempPath = join(tmpdir(), `qr_base64_${Date.now()}.png`);
  writeFileSync(tempPath, new Uint8Array(buffer));
  
  return tempPath;
}

export async function handleInput(input: string): Promise<{ type: string, path: string }> {
  const inputType = await detectInputType(input);
  
  switch (inputType) {
    case 'text':
      // Return original text for QR generation
      return { type: 'text', path: input };
      
    case 'filepath':
      // Return file path for decoding
      return { type: 'image', path: input };
      
    case 'base64':
      // Convert base64 to file
      const filePath = await processBase64Image(input);
      return { type: 'image', path: filePath };
      
    case 'url':
      // For URLs, we can either generate QR or download image
      // Check if URL points to an image
      if (input.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // Download image (simplified - would need actual HTTP client)
        throw new Error('URL image download not implemented yet');
      } else {
        // Treat as text for QR generation
        return { type: 'text', path: input };
      }
      
    default:
      return { type: 'text', path: input };
  }
}