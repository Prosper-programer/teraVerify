const { pool } = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'teraverify_super_secret_jwt_key_2026';

// POST /api/auth/login
async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ error: 'Please enter your email or phone number.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Please enter your password.' });
    }

    const cleanIdentifier = identifier.trim();

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR REPLACE(phone, " ", "") = REPLACE(?, " ", "") LIMIT 1',
      [cleanIdentifier, cleanIdentifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    const u = rows[0];

    // Check account status
    if (u.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended by the platform administrator.' });
    }

    // Verify password against stored hash
    const isValid = verifyPassword(password, u.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }
    
    // Generate secure JWT
    const token = jwt.sign({ id: u.id, role: u.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        avatarUrl: u.avatar_url,
        isPhoneVerified: !!u.is_phone_verified,
        nationalIdNumber: u.national_id_number,
        status: u.status,
        registeredAt: u.registered_at,
      },
    });
  } catch (err) {
    console.error('[Auth Controller Error - Login]:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { fullName, email, phone, password, role, nationalIdNumber } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full legal name is required.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if user already exists
    const [existing] = await pool.query(
      'SELECT email, phone FROM users WHERE LOWER(email) = LOWER(?) OR REPLACE(phone, " ", "") = REPLACE(?, " ", "") LIMIT 1',
      [cleanEmail, cleanPhone]
    );

    if (existing.length > 0) {
      const match = existing[0];
      if (match.email.toLowerCase() === cleanEmail) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }
      return res.status(409).json({ error: 'An account with this phone number already exists.' });
    }

    // Hash password
    const hashedPassword = hashPassword(password);
    const newId = 'user-' + Date.now();
    const userRole = role || 'buyer';
    const now = new Date();

    await pool.query(
      `INSERT INTO users (id, full_name, email, phone, password_hash, role, national_id_number, status, registered_at, is_phone_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, 1)`,
      [newId, fullName.trim(), cleanEmail, cleanPhone, hashedPassword, userRole, nationalIdNumber || null, now]
    );

    const token = jwt.sign({ id: newId, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newId,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: userRole,
        nationalIdNumber: nationalIdNumber || null,
        isPhoneVerified: true,
        status: 'active',
        registeredAt: now.toISOString(),
      },
    });
  } catch (err) {
    console.error('[Auth Controller Error - Register]:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

module.exports = {
  login,
  register,
};
