const crypto = require('crypto');

/**
 * Hash a plain text password using PBKDF2 with SHA-512 and a random 16-byte salt.
 * @param {string} password
 * @returns {string} Salt and hash separated by colon (salt:hash)
 */
function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plain text password against a stored hash (salt:hash).
 * @param {string} password
 * @param {string} storedHash
 * @returns {boolean} True if password matches, false otherwise
 */
function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }
  try {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const origBuf = Buffer.from(originalHash, 'hex');
    if (hashBuf.length !== origBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuf, origBuf);
  } catch {
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
};
