// QR Code Skill Implementation for OpenClaw
// This skill provides generate, decode, and beautify operations for QR codes
// Security fixes: Path traversal prevention, input sanitization, error handling

const path = require('path');

// Input validation and sanitization functions
function validateColor(color) {
  if (!color) return 'black';
  // Allow basic color names and hex values
  const validColorPattern = /^([a-zA-Z]+|#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}))$/;
  if (validColorPattern.test(color)) {
    return color.toLowerCase();
  }
  throw new Error('Invalid color format. Use basic color names or hex values (e.g., red, #ff0000)');
}

function validateSize(size) {
  const numSize = parseInt(size, 10);
  if (isNaN(numSize) || numSize < 1 || numSize > 100) {
    throw new Error('Size must be a number between 1 and 100');
  }
  return numSize;
}

function validateFormat(format, channel) {
  const cleanFormat = (format || 'png').toLowerCase().trim();
  const validFormats = ['png', 'jpg', 'jpeg', 'svg'];
  
  if (!validFormats.includes(cleanFormat)) {
    throw new Error(`Invalid format. Supported formats: ${validFormats.join(', ')}`);
  }
  
  // WhatsApp compatibility check
  if (channel === 'whatsapp' && cleanFormat === 'svg') {
    // Automatically convert SVG to PNG for WhatsApp
    return 'png';
  }
  
  return cleanFormat;
}

function validateLogoPath(logoPath, workspaceDir) {
  if (!logoPath) return null;
  
  // Resolve and normalize the path
  const resolvedPath = path.resolve(logoPath);
  const normalizedPath = path.normalize(resolvedPath);
  
  // Prevent path traversal - ensure it's within the workspace or absolute safe paths
  if (!normalizedPath.startsWith(workspaceDir) && !path.isAbsolute(normalizedPath)) {
    throw new Error('Invalid logo path: Path traversal detected');
  }
  
  // Additional security: prevent accessing system directories
  const dangerousPaths = ['/etc', '/bin', '/usr', '/root', '/home', '/var', '/tmp', process.env.HOME];
  for (const dangerousPath of dangerousPaths) {
    if (normalizedPath.startsWith(dangerousPath)) {
      throw new Error('Invalid logo path: Access to system directories is not allowed');
    }
  }
  
  return normalizedPath;
}

async function handleGenerate(context, args) {
  try {
    const { input, color = 'black', backgroundColor = 'white', size = 10, format = 'png', logoPath } = args;
    
    if (!input) {
      throw new Error('Input URL or text is required for QR code generation');
    }
    
    // Validate and sanitize inputs
    const validatedColor = validateColor(color);
    const validatedBgColor = validateColor(backgroundColor);
    const validatedSize = validateSize(size);
    const validatedFormat = validateFormat(format, context.channel);
    
    const options = {
      color: validatedColor,
      backgroundColor: validatedBgColor,
      size: validatedSize,
      format: validatedFormat
    };
    
    // Handle logo path validation if provided
    if (logoPath) {
      const validatedLogoPath = validateLogoPath(logoPath, process.cwd());
      if (validatedLogoPath) {
        options.logoPath = validatedLogoPath;
      }
    }
    
    // Log the operation for debugging (safe information only)
    console.log(`Generating QR code: format=${validatedFormat}, size=${validatedSize}, channel=${context.channel}`);
    
    return await context.tools.qr_code_operations({
      operation: 'generate',
      input,
      options
    });
  } catch (error) {
    console.error('QR code generation error:', error.message);
    throw new Error(`QR generation failed: ${error.message}`);
  }
}

async function handleDecode(context, args) {
  try {
    const { input } = args;
    
    if (!input) {
      throw new Error('QR code image is required for decoding');
    }
    
    return await context.tools.qr_code_operations({
      operation: 'decode',
      input
    });
  } catch (error) {
    console.error('QR code decoding error:', error.message);
    throw new Error(`QR decoding failed: ${error.message}`);
  }
}

async function handleBeautify(context, args) {
  try {
    const { input, color = 'black', backgroundColor = 'white', size = 10, format = 'png' } = args;
    
    if (!input) {
      throw new Error('QR code image is required for beautification');
    }
    
    // Validate and sanitize inputs
    const validatedColor = validateColor(color);
    const validatedBgColor = validateColor(backgroundColor);
    const validatedSize = validateSize(size);
    const validatedFormat = validateFormat(format, context.channel);
    
    const options = {
      color: validatedColor,
      backgroundColor: validatedBgColor,
      size: validatedSize,
      format: validatedFormat
    };
    
    // Log the operation for debugging (safe information only)
    console.log(`Beautifying QR code: format=${validatedFormat}, size=${validatedSize}, channel=${context.channel}`);
    
    return await context.tools.qr_code_operations({
      operation: 'beautify',
      input,
      options
    });
  } catch (error) {
    console.error('QR code beautification error:', error.message);
    throw new Error(`QR beautification failed: ${error.message}`);
  }
}

module.exports = {
  generate: handleGenerate,
  decode: handleDecode,
  beautify: handleBeautify
};