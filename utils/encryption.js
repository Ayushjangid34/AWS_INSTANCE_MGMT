/**
 * Encryption utilities for secure data handling.
 * Uses AES-256-CBC for encryption/decryption and SHA-256 for hashing.
 */

const crypto = require('crypto');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;
const key = crypto.createHash('sha256').update(secretKey).digest();

function encrypt(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
}

function decrypt(ciphertext) {
  const [ivBase64, encryptedData] = ciphertext.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('base64');
}

module.exports = {
  encrypt,
  decrypt,
  hashData,
};
