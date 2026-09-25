// Authentication & Role Verification Middleware
const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const JWT_SECRET = process.env.JWT_SECRET || 'teraverify_super_secret_jwt_key_2026';

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User session not found' });
    }

    if (rows[0].status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended by the platform administrator.' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    return res.status(500).json({ error: 'Internal authentication error' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}], current role: ${req.user.role}`,
      });
    }
    next();
  };
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (rows.length > 0 && rows[0].status !== 'suspended') {
      req.user = rows[0];
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }
  next();
}

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth,
};
