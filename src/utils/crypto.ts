// AES-256-GCM encryption using Web Crypto API
let cachedKey: CryptoKey | null = null
let rawKey: string = ''

async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey && rawKey) return cachedKey

  // Fetch key from backend
  const res = await fetch('/api/auth/encryption-key')
  const data = await res.json()
  rawKey = data.key

  const keyBuffer = new TextEncoder().encode(rawKey)
  cachedKey = await crypto.subtle.importKey(
    'raw', keyBuffer, { name: 'AES-GCM' }, false, ['encrypt']
  )
  return cachedKey
}

export async function encryptPassword(password: string): Promise<string> {
  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 96-bit nonce for GCM
  const encoded = new TextEncoder().encode(password)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, encoded
  )

  // Combine nonce + ciphertext, then base64 encode
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return btoa(String.fromCharCode(...combined))
}
