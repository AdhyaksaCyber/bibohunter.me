import { MiddlewareHandler } from 'hono'

/**
 * Validates upload size BEFORE processing multipart/form-data
 * Prevents DoS via large file uploads
 */
export const validateUploadSize = (maxSizeBytes?: number): MiddlewareHandler => {
  return async (c, next) => {
    // Hanya untuk POST/PUT dengan body
    if (!['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      return await next()
    }

    const contentLength = c.req.header('content-length')
    const maxSize = maxSizeBytes || parseInt(c.env.MAX_UPLOAD_SIZE || '52428800') // 50MB default

    // Wajib ada Content-Length header (RFC 7230)
    if (!contentLength) {
      return c.json({
        success: false,
        error: 'Content-Length header required',
        code: 'LENGTH_REQUIRED'
      }, 411)
    }

    const size = parseInt(contentLength)

    if (isNaN(size) || size < 0) {
      return c.json({
        success: false,
        error: 'Invalid Content-Length value',
        code: 'INVALID_LENGTH'
      }, 400)
    }

    if (size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)
      const receivedSizeMB = (size / 1024 / 1024).toFixed(2)

      return c.json({
        success: false,
        error: `File too large. Max size: ${maxSizeMB}MB`,
        code: 'PAYLOAD_TOO_LARGE',
        max_size_bytes: maxSize,
        max_size_mb: maxSizeMB,
        received_bytes: size,
        received_mb: receivedSizeMB
      }, 413)
    }

    await next()
  }
}

/**
 * Validates file type based on MIME type and magic bytes
 * Prevents malicious file uploads (e.g., PHP disguised as PNG)
 */
export async function validateFileType(
  file: File,
  allowedMimeTypes: string[]
): Promise<{ valid: boolean; error?: string }> {
  // Cek MIME type (pertahanan pertama)
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed: ${allowedMimeTypes.join(', ')}`
    }
  }

  // Baca 16 byte pertama untuk cek magic number
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer).slice(0, 16)

  // Magic number signatures (signature file asli)
  const magicNumbers: Record<string, number[]> = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46],       // %PDF
    'image/png': [0x89, 0x50, 0x4E, 0x47],             // .PNG
    'image/jpeg': [0xFF, 0xD8, 0xFF],                  // JPEG
    'application/zip': [0x50, 0x4B, 0x03, 0x04],        // PK.. (ZIP/DOCX/XLSX)
    'image/webp': [0x52, 0x49, 0x46, 0x46],            // RIFF
  }

  const expectedMagic = magicNumbers[file.type]
  if (expectedMagic) {
    const matches = expectedMagic.every((byte, i) => bytes[i] === byte)
    if (!matches) {
      return {
        valid: false,
        error: 'File content does not match declared type (possible spoofing attack)'
      }
    }
  }

  return { valid: true }
}
