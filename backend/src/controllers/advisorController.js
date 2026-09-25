const { pool } = require('../config/db');

// GET /api/advisors
async function getAllAdvisors(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM advisors');
    const mapped = rows.map((a) => {
      let locationParts = (a.location || '').split(',');
      let city = locationParts[0] ? locationParts[0].trim() : '';
      let region = locationParts[1] ? locationParts[1].trim() : '';

      return {
        id: a.id,
        name: a.full_name,
        title: a.role_title,
        profession: a.role_title?.includes('Notary') ? 'notaire' : a.role_title?.includes('Engineer') ? 'geometre_expert' : 'expert_immobilier',
        organization: 'Independent', // DB doesn't have it
        bio: a.bio,
        specializations: typeof a.specialties === 'string' ? JSON.parse(a.specialties) : a.specialties || [],
        rating: Number(a.rating),
        reviewCount: a.review_count,
        hourlyRateFCFA: Number(a.consultation_fee_fcfa),
        availability: typeof a.available_days === 'string' ? JSON.parse(a.available_days) : a.available_days || [],
        avatarUrl: a.avatar_url,
        region: region,
        city: city,
      };
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllAdvisors,
};
