import crypto from 'node:crypto'

export function encryptPassword(secretKey: string, password: string): string {
  // Random initialization vector
  const randomInitVector = crypto.randomBytes(16)

  // Cipher object with AES-CBC algorithm
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey),
    randomInitVector,
  )

  // Encrypt password
  const encryptedPassword = Buffer.concat([
    cipher.update(password, 'utf8'),
    cipher.final(),
  ])

  // Concat IV with encrypted password for storage
  const encryptedData =
    randomInitVector.toString('hex') + ':' + encryptedPassword.toString('hex')

  return encryptedData
}

export function verifyPassword(
  storedEncryptedPassword: string | null,
  providedPassword: string,
  secretKey: string,
) {
  // Split the stored data into Random Init vector
  const [ivHex, encryptedPasswordHex] = storedEncryptedPassword.split(':')

  // Convert from hex to buffers
  const randomInitVector = Buffer.from(ivHex, 'hex')
  const storedEncryptedPasswordBuffer = Buffer.from(encryptedPasswordHex, 'hex')

  // Dechipher object
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey),
    randomInitVector,
  )

  // Update the decipher
  const decryptedPasswordBuffer = Buffer.concat([
    decipher.update(storedEncryptedPasswordBuffer),
    decipher.final(),
  ])

  return providedPassword === decryptedPasswordBuffer.toString('utf-8')
}
