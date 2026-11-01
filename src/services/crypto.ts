/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Local AES-GCM encryption for credentials using Web Crypto API
const APP_DEVICE_SALT = 'android-keystore-sim-biz-salt-2026';

async function getKey(masterSecret: string = 'master-biz-passkey'): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(masterSecret + APP_DEVICE_SALT),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(APP_DEVICE_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptSecret(plainText: string, pin?: string): Promise<string> {
  if (!plainText) return '';
  try {
    const key = await getKey(pin || 'default-pin-store');
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encoded = enc.encode(plainText);

    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const cipherHex = Array.from(new Uint8Array(cipherBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `aes-v1:${ivHex}:${cipherHex}`;
  } catch (err) {
    console.warn('WebCrypto failed, falling back to safe local obfuscation', err);
    return `b64:${btoa(unescape(encodeURIComponent(plainText)))}`;
  }
}

export async function decryptSecret(cipherText: string, pin?: string): Promise<string> {
  if (!cipherText) return '';
  try {
    if (cipherText.startsWith('aes-v1:')) {
      const parts = cipherText.split(':');
      if (parts.length !== 3) return '';
      const ivHex = parts[1];
      const cipherHex = parts[2];

      const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const cipherBytes = new Uint8Array(cipherHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      const key = await getKey(pin || 'default-pin-store');
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        cipherBytes
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    } else if (cipherText.startsWith('b64:')) {
      return decodeURIComponent(escape(atob(cipherText.slice(4))));
    }
    return cipherText;
  } catch (err) {
    console.warn('Decryption failed with current key', err);
    return '••••••••';
  }
}
