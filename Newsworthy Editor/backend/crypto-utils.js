import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'newsworthy-editor-secret-key-2025';

export function encrypt(plainText) {
  if (!plainText) {
    return null;
  }
  try {
    const encrypted = CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedText) {
  if (!encryptedText) {
    return null;
  }
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const plainText = decrypted.toString(CryptoJS.enc.Utf8);
    if (!plainText) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    return plainText;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

export function isEncrypted(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  if (text.startsWith('ghp_') || text.startsWith('github_pat_') || text.startsWith('gho_')) {
    return false;
  }
  return text.length > 50 && /[+/=]/.test(text);
}

export default { encrypt, decrypt, isEncrypted };

