const { pool } = require('../config/db');

// GET /api/notifications
async function getAllNotifications(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications ORDER BY timestamp DESC');
    const mapped = rows.map((n) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: !!n.is_read,
      timestamp: n.timestamp,
      createdAt: n.timestamp,
      relatedEntityId: n.related_entity_id,
      relatedEntityType: n.related_entity_type,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllNotifications,
};
