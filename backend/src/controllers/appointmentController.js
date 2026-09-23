const { pool } = require('../config/db');

// GET /api/appointments
async function getAllAppointments(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM appointments ORDER BY created_at DESC');
    const mapped = rows.map((apt) => ({
      id: apt.id,
      userId: apt.user_id,
      userName: apt.user_name,
      userPhone: apt.user_phone,
      advisorId: apt.advisor_id,
      advisorName: apt.advisor_name,
      advisorRole: apt.advisor_role,
      date: apt.date,
      timeSlot: apt.time_slot,
      topic: apt.topic,
      notes: apt.notes,
      status: apt.status,
      feeFCFA: Number(apt.fee_fcfa),
      createdAt: apt.created_at,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/appointments
async function createAppointment(req, res) {
  try {
    const apt = req.body;
    const newId = 'apt-' + Date.now();
    await pool.query(
      `INSERT INTO appointments (id, user_id, user_name, user_phone, advisor_id, advisor_name, advisor_role, date, time_slot, topic, notes, status, fee_fcfa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        apt.userId,
        apt.userName,
        apt.userPhone,
        apt.advisorId,
        apt.advisorName,
        apt.advisorRole || null,
        apt.date,
        apt.timeSlot,
        apt.topic || null,
        apt.notes || null,
        'confirmed',
        apt.feeFCFA || 25000,
      ]
    );

    res.status(201).json({ id: newId, ...apt, status: 'confirmed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllAppointments,
  createAppointment,
};
