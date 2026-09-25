const { pool } = require('../config/db');
const { getIO } = require('../config/socket');

// GET /api/appointments
async function getAllAppointments(req, res) {
  try {
    let query = 'SELECT * FROM appointments ORDER BY created_at DESC';
    let params = [];
    if (req.user.role === 'buyer' || req.user.role === 'seller') {
      query = 'SELECT * FROM appointments WHERE user_id = ? ORDER BY created_at DESC';
      params.push(req.user.id);
    } else if (req.user.role === 'advisor') {
      // Assuming advisor sees their own appointments
      query = 'SELECT * FROM appointments WHERE advisor_id = ? ORDER BY created_at DESC';
      params.push(req.user.id); // Or linked advisor_id
    }

    const [rows] = await pool.query(query, params);
    const mapped = rows.map((apt) => ({
      id: apt.id,
      userId: apt.user_id,
      userName: apt.user_name,
      userPhone: apt.user_phone,
      advisorId: apt.advisor_id,
      advisorName: apt.advisor_name,
      advisorTitle: apt.advisor_role,
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
        apt.advisorRole || apt.advisorTitle || null,
        apt.date,
        apt.timeSlot,
        apt.topic || null,
        apt.notes || null,
        'confirmed',
        apt.feeFCFA || 25000,
      ]
    );

    try {
      const io = getIO();
      io.to('role_advisor').emit('appointment_created', { id: newId });
    } catch (err) {
      console.error('Socket emit error:', err);
    }

    res.status(201).json({ id: newId, ...apt, status: 'confirmed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/appointments/:id/status
async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Authorization: only admin or the assigned advisor can update to arbitrary status (e.g., completed)
    if (req.user.role !== 'admin' && req.user.role !== 'advisor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);

    try {
      const io = getIO();
      io.to('role_advisor').emit('appointment_updated', { id, status });
    } catch (err) {
      console.error('Socket emit error:', err);
    }

    res.json({ id, status, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/appointments/:id/cancel
async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    
    // Need to verify ownership
    const [existing] = await pool.query('SELECT user_id, advisor_id FROM appointments WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const apt = existing[0];
    if (req.user.role !== 'admin' && req.user.id !== apt.user_id && req.user.id !== apt.advisor_id) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }

    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', id]);

    try {
      const io = getIO();
      io.to('role_advisor').emit('appointment_updated', { id, status: 'cancelled' });
    } catch (err) {
      console.error('Socket emit error:', err);
    }

    res.json({ id, status: 'cancelled', message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
};
