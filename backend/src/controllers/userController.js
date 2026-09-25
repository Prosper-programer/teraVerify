const { pool } = require('../config/db');

// GET /api/users
async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY registered_at DESC');
    const mapped = rows.map((u) => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      avatarUrl: u.avatar_url,
      isPhoneVerified: !!u.is_phone_verified,
      isSubscribed: !!u.is_subscribed,
      nationalIdNumber: u.national_id_number,
      status: u.status,
      registeredAt: u.registered_at,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/users/:id/toggle-status
async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT status FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const newStatus = rows[0].status === 'active' ? 'suspended' : 'active';
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);
    res.json({ id, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/users/:id/role
async function changeUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['buyer', 'seller', 'surveyor', 'advisor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ id, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/users/:id/subscribe
async function subscribeUser(req, res) {
  try {
    const { id } = req.params;
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.query('UPDATE users SET is_subscribed = TRUE WHERE id = ?', [id]);
    res.json({ id, isSubscribed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllUsers,
  toggleUserStatus,
  changeUserRole,
  subscribeUser,
};
