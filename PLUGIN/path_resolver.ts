import { homedir } from 'os';
import { join, isAbsolute } from 'path';

/**
 * Resolves output and assets directory paths based on configuration
 * Supports relative paths, home directory (~), and absolute paths
 * @param configPath - User configured path
 * @param workspace - OpenClaw workspace directory
 * @param defaultSubdir - Default subdirectory name (e.g., 'qr-codes')
 * @returns Resolved absolute path
 */
export function resolveDirectoryPath(
  configPath: string | undefined, 
  workspace: string, 
  defaultSubdir: string
): string {
  // If no config provided, use default relative to workspace
  if (!configPath) {
    return join(workspace, defaultSubdir);
  }

  let resolvedPath = configPath;

  // Handle home directory (~)
  if (resolvedPath.startsWith('~/')) {
    resolvedPath = join(homedir(), resolvedPath.slice(2));
  } else if (resolvedPath === '~') {
    resolvedPath = homedir();
  }

  // Handle relative paths (./ or ../)
  if (!isAbsolute(resolvedPath)) {
    resolvedPath = join(workspace, resolvedPath);
  }

  return resolvedPath;
}

/**
 * Ensures directory exists, creates if necessary
 * @param directoryPath - Directory to ensure exists
 */
export async function ensureDirectoryExists(directoryPath: string): Promise<void> {
  const { mkdir } = await import('fs/promises');
  try {
    await mkdir(directoryPath, { recursive: true });
  } catch (error) {
    // Handle permission errors gracefully
    console.warn(`Warning: Could not create directory ${directoryPath}: ${error.message}`);
    // Fall back to temp directory if needed
  }
}

/**
 * Generates a safe filename for QR codes
 * @param content - QR code content for generating filename
 * @param format - File format (png, jpg, svg)
 * @returns Safe filename
 */
export function generateSafeFilename(content: string, format: string = 'png'): string {
  // Create a simple hash of the content for unique filename
  const crypto = await import('crypto');
  const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  
  // Clean content for filename (remove special characters)
  const cleanContent = content
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50)
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  if (cleanContent) {
    return `qr_${cleanContent}_${hash}_${timestamp}.${format}`;
  } else {
    return `qr_${hash}_${timestamp}.${format}`;
  }
}