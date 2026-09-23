const { pool } = require('../config/db');

// GET /api/verifications
async function getAllVerifications(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM verification_requests ORDER BY submitted_at DESC');
    const mapped = rows.map((v) => ({
      id: v.id,
      landId: v.land_id,
      landTitleNumber: v.land_title_number,
      sellerId: v.seller_id,
      sellerName: v.seller_name,
      sellerPhone: v.seller_phone,
      surveyorId: v.surveyor_id,
      surveyorName: v.surveyor_name,
      region: v.region,
      division: v.division,
      subdivision: v.subdivision,
      surfaceAreaSqM: Number(v.surface_area_sq_m),
      status: v.status,
      submittedAt: v.submitted_at,
      reviewedAt: v.reviewed_at,
      rejectionReason: v.rejection_reason,
      surveyorNotes: v.surveyor_notes,
      cadastralRegistryNotes: v.cadastral_registry_notes,
      estimatedTurnaroundHours: v.estimated_turnaround_hours,
      timeline: typeof v.timeline === 'string' ? JSON.parse(v.timeline) : v.timeline || [],
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/verifications
async function createVerification(req, res) {
  try {
    const v = req.body;
    const newId = 'verif-' + Date.now();
    await pool.query(
      `INSERT INTO verification_requests (
        id, land_id, land_title_number, seller_id, seller_name, seller_phone,
        region, division, subdivision, surface_area_sq_m, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, v.landId, v.landTitleNumber, v.sellerId, v.sellerName, v.sellerPhone,
        v.region, v.division, v.subdivision, v.surfaceAreaSqM, 'submitted'
      ]
    );
    res.status(201).json({ id: newId, message: 'Verification created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/verifications/:id/status
async function updateVerificationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, surveyorNotes, surveyorId } = req.body;
    
    // Update verification request
    await pool.query(
      `UPDATE verification_requests 
       SET status = ?, surveyor_notes = ?, surveyor_id = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, surveyorNotes, surveyorId, id]
    );

    // Also update the land's status if it is approved or rejected
    if (status === 'approved' || status === 'rejected') {
      const [vRows] = await pool.query('SELECT land_id FROM verification_requests WHERE id = ?', [id]);
      if (vRows.length > 0) {
        const landId = vRows[0].land_id;
        const landStatus = status === 'approved' ? 'verified' : 'rejected';
        const isPublished = status === 'approved' ? true : false;
        await pool.query(
          `UPDATE lands 
           SET verification_status = ?, surveyor_notes = ?, verified_at = CURRENT_TIMESTAMP, is_published = ? 
           WHERE id = ?`,
          [landStatus, surveyorNotes, isPublished, landId]
        );
      }
    }

    res.json({ id, status, message: 'Verification updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllVerifications,
  createVerification,
  updateVerificationStatus,
};
