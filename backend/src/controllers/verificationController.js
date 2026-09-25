const { pool } = require('../config/db');
const { getIO } = require('../config/socket');

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
    
    try {
      const io = getIO();
      io.to('role_surveyor').emit('verification_created', { id: newId });
      io.to('role_admin').emit('verification_created', { id: newId });
    } catch (err) {
      console.error('Socket emit error:', err);
    }

    res.status(201).json({ id: newId, message: 'Verification created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/verifications/:id/status
async function updateVerificationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, surveyorNotes, cadastralRegistryNotes } = req.body;
    
    const validStatuses = ['submitted', 'under_review', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const surveyorId = req.user.id;
    const surveyorName = req.user.full_name || 'Surveyor';

    // Fetch existing request
    const [existing] = await pool.query('SELECT * FROM verification_requests WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Verification request not found' });
    const vReq = existing[0];
    
    // Ensure only the assigned surveyor can review (unless admin or unassigned)
    if (vReq.surveyor_id && vReq.surveyor_id !== surveyorId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'This request is assigned to another surveyor.' });
    }

    // We use a transaction to ensure all updates succeed or fail together
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update verification request
      await connection.query(
        `UPDATE verification_requests 
         SET status = ?, surveyor_notes = ?, cadastral_registry_notes = ?, surveyor_id = ?, surveyor_name = ?, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, surveyorNotes || null, cadastralRegistryNotes || null, surveyorId, surveyorName, id]
      );

      // Also update the land's status if it is approved or rejected
      if (status === 'approved' || status === 'rejected') {
        const landId = vReq.land_id;
        const landStatus = status === 'approved' ? 'verified' : 'rejected';
        const isPublished = status === 'approved' ? 1 : 0;
        await connection.query(
          `UPDATE lands 
           SET verification_status = ?, surveyor_notes = ?, verified_at = CURRENT_TIMESTAMP, is_published = ? 
           WHERE id = ?`,
          [landStatus, surveyorNotes || null, isPublished, landId]
        );

        // Create notification for the seller
        const title = status === 'approved' ? 'Land Verified' : 'Land Verification Rejected';
        const message = status === 'approved' 
          ? `Your land with title ${vReq.land_title_number} has been verified and is now published.`
          : `Your land with title ${vReq.land_title_number} was rejected. Surveyor notes: ${surveyorNotes || 'N/A'}`;
        
        await connection.query(
          `INSERT INTO notifications (id, user_id, title, message, type, related_entity_id, related_entity_type) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['notif-' + Date.now(), vReq.seller_id, title, message, 'verification', landId, 'land']
        );
      }

      await connection.commit();
      
      // Emit socket events
      try {
        const io = getIO();
        // Notify the seller
        io.to(`user_${vReq.seller_id}`).emit('verification_updated', { id, status });
        
        if (status === 'approved' || status === 'rejected') {
          io.to(`user_${vReq.seller_id}`).emit('new_notification', {
            title: status === 'approved' ? 'Land Verified' : 'Land Verification Rejected',
            message: status === 'approved' ? `Your land with title ${vReq.land_title_number} has been verified.` : `Your land was rejected.`,
          });
          // Also notify buyers looking at this land, or admins
          io.to('role_admin').emit('land_updated', { landId: vReq.land_id });
        }
        
        // Notify all surveyors and admins that a request was claimed/updated
        io.to('role_surveyor').emit('verification_updated', { id, status });
        io.to('role_admin').emit('verification_updated', { id, status });
      } catch (err) {
        console.error('Socket emit error:', err);
      }

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    res.json({ id, status, message: 'Verification updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/title-verification/:titleNumber
async function verifyTitlePublic(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT land_title_number, region, verification_status, verified_at, surveyor_notes FROM lands WHERE land_title_number = ? LIMIT 1',
      [req.params.titleNumber]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Title not found' });
    }

    const land = rows[0];
    if (land.verification_status !== 'verified') {
      return res.json({ status: land.verification_status, message: 'This title is not fully verified yet.' });
    }

    // Fetch surveyor name from verification_requests if we want it
    const [vReq] = await pool.query('SELECT surveyor_name FROM verification_requests WHERE land_title_number = ? AND status = "approved" LIMIT 1', [land.land_title_number]);

    res.json({
      status: 'verified',
      landTitleNumber: land.land_title_number,
      region: land.region,
      verifiedDate: land.verified_at,
      surveyorName: vReq.length > 0 ? vReq[0].surveyor_name : 'Authorized Surveyor',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllVerifications,
  createVerification,
  updateVerificationStatus,
  verifyTitlePublic,
};
