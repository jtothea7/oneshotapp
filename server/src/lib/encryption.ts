import crypto from 'crypto'

// Use SUPABASE_SERVICE_ROLE_KEY as the encryption seed (always available, unique per project)
// In production, use a dedicated ENCRYPTION_KEY env var
function getEncryptionKey(): Buffer {
  const seed = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
  return crypto.scryptSync(seed, 'oneshot-salt', 32)
}

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey()
  const parts = encryptedText.split(':')
  if (parts.length !== 3) throw new Error('Invalid encrypted format')

  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

export function maskKey(value: string): string {
  if (value.length <= 8) return '***'
  return `${value.slice(0, 4)}***...***${value.slice(-4)}`
}
