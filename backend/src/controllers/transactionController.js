const { pool } = require('../config/db');

// GET /api/transactions
async function getAllTransactions(req, res) {
  try {
    let query = 'SELECT * FROM transactions ORDER BY timestamp DESC';
    let params = [];
    if (req.user.role !== 'admin') {
      query = 'SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC';
      params.push(req.user.id);
    }
    const [rows] = await pool.query(query, params);
    const mapped = rows.map((t) => ({
      id: t.id,
      reference: t.reference,
      userId: t.user_id,
      landId: t.land_id,
      landTitle: t.land_title,
      amountFCFA: Number(t.amount_fcfa),
      method: t.method,
      phoneNumber: t.phone_number,
      status: t.status,
      createdAt: t.timestamp,
      completedAt: t.timestamp,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/transactions
async function createTransaction(req, res) {
  try {
    const tx = req.body;
    const id = tx.id || ('pay-' + Date.now());
    await pool.query(
      `INSERT INTO transactions (id, reference, user_id, land_id, land_title, amount_fcfa, method, phone_number, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        tx.reference,
        tx.userId,
        tx.landId,
        tx.landTitle,
        tx.amountFCFA,
        tx.method,
        tx.phoneNumber,
        tx.status || 'success',
      ]
    );
    res.status(201).json({ id, ...tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllTransactions,
  createTransaction,
};
