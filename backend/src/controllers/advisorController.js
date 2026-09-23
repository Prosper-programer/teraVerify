const { pool } = require('../config/db');

// GET /api/advisors
async function getAllAdvisors(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM advisors');
    const mapped = rows.map((a) => ({
      id: a.id,
      fullName: a.full_name,
      roleTitle: a.role_title,
      yearsOfExperience: a.years_of_experience,
      bio: a.bio,
      specialties: typeof a.specialties === 'string' ? JSON.parse(a.specialties) : a.specialties || [],
      rating: Number(a.rating),
      reviewCount: a.review_count,
      consultationFeeFCFA: Number(a.consultation_fee_fcfa),
      availableDays: typeof a.available_days === 'string' ? JSON.parse(a.available_days) : a.available_days || [],
      availableHours: a.available_hours,
      phone: a.phone,
      email: a.email,
      avatarUrl: a.avatar_url,
      location: a.location,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllAdvisors,
};
