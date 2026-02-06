import { homedir } from 'os';
import { join } from 'path';

/**
 * Converts absolute path to user-friendly display path
 * Replaces home directory with ~ symbol for privacy
 */
export function getDisplayPath(absolutePath: string): string {
  const homeDir = homedir();
  if (absolutePath.startsWith(homeDir)) {
    return absolutePath.replace(homeDir, '~');
  }
  return absolutePath;
}

/**
 * Generates user-friendly directory information message
 */
export function generateDirectoryInfoMessage(
  outputDir: string,
  assetsDir: string,
  operation: 'generate' | 'decode' | 'beautify'
): string {
  const displayOutput = getDisplayPath(outputDir);
  const displayAssets = getDisplayPath(assetsDir);
  
  let message = '';
  
  if (operation === 'generate') {
    message = `## 📁 Output Directory
- **Generated QR codes will be saved to**: \`${displayOutput}\`
- **Make sure this directory exists and is writable**`;
  } else if (operation === 'decode' || operation === 'beautify') {
    message = `## 📁 File Upload Instructions
- **For uploaded images**: Place files in \`${displayOutput}\` 
- **For logo/assets**: Place files in \`${displayAssets}\`
- **Or provide full path**: You can specify any file path in your request`;
  }
  
  return message;
}

/**
 * Resolves user-provided path to absolute path
 * Handles ~, relative paths, and absolute paths
 */
export function resolveUserPath(userPath: string, workspace: string): string {
  let resolvedPath = userPath;
  
  // Handle home directory (~)
  if (resolvedPath.startsWith('~/')) {
    resolvedPath = join(homedir(), resolvedPath.slice(2));
  } else if (resolvedPath === '~') {
    resolvedPath = homedir();
  }
  
  // Handle relative paths
  if (!resolvedPath.startsWith('/')) {
    resolvedPath = join(workspace, resolvedPath);
  }
  
  return resolvedPath;
}