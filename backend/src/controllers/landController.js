const { pool } = require('../config/db');
const { getIO } = require('../config/socket');

// GET /api/lands
async function getAllLands(req, res) {
  try {
    const { region, landType, onlyVerified, searchQuery } = req.query;
    let query = 'SELECT * FROM lands WHERE is_published = 1';
    const params = [];

    if (onlyVerified === 'true') {
      query += ' AND verification_status = "verified"';
    }
    if (region && region !== 'all') {
      query += ' AND LOWER(region) = LOWER(?)';
      params.push(region);
    }
    if (landType && landType !== 'all') {
      query += ' AND land_type = ?';
      params.push(landType);
    }
    if (searchQuery) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(neighborhood) LIKE ? OR LOWER(land_title_number) LIKE ?)';
      const s = '%' + searchQuery.toLowerCase() + '%';
      params.push(s, s, s);
    }

    query += ' ORDER BY submitted_at DESC';
    const [lands] = await pool.query(query, params);

    // Fetch documents
    const [docs] = await pool.query('SELECT * FROM land_documents');

    const mapped = lands.map((l) => {
      const landDocs = docs
        .filter((d) => d.land_id === l.id)
        .map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          documentNumber: d.document_number,
          fileUrl: d.file_url,
          fileSize: d.file_size,
          isVerified: !!d.is_verified,
          uploadedAt: d.uploaded_at,
        }));

      return {
        id: l.id,
        title: l.title,
        landTitleNumber: l.land_title_number,
        description: l.description,
        region: l.region,
        division: l.division,
        subdivision: l.subdivision,
        neighborhood: l.neighborhood,
        areaSqM: Number(l.area_sq_m),
        priceFCFA: Number(l.price_fcfa),
        unlockFeeFCFA: Number(l.unlock_fee_fcfa),
        landType: l.land_type,
        topography: l.topography,
        accessRoad: l.access_road,
        images: typeof l.images === 'string' ? JSON.parse(l.images) : l.images || [],
        exactLocation: typeof l.exact_location === 'string' ? JSON.parse(l.exact_location) : l.exact_location,
        sellerContact: typeof l.seller_contact === 'string' ? JSON.parse(l.seller_contact) : l.seller_contact,
        verificationStatus: l.verification_status,
        isPublished: !!l.is_published,
        isFeatured: !!l.is_featured,
        rejectionReason: l.rejection_reason,
        surveyorNotes: l.surveyor_notes,
        verifiedAt: l.verified_at,
        submittedAt: l.submitted_at,
        sellerId: l.seller_id,
        documents: landDocs,
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/lands/:id
async function getLandById(req, res) {
  try {
    const [lands] = await pool.query('SELECT * FROM lands WHERE id = ?', [req.params.id]);
    if (lands.length === 0) return res.status(404).json({ error: 'Land not found' });
    const l = lands[0];

    const [docs] = await pool.query('SELECT * FROM land_documents WHERE land_id = ?', [l.id]);

    // Security check: Determine if the user has access to protected details
    let hasAccess = false;
    
    // Check if there's an auth token
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      try {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET;
        if (JWT_SECRET) {
          const decoded = jwt.verify(token, JWT_SECRET);
          if (decoded.role === 'admin' || decoded.role === 'surveyor' || l.seller_id === decoded.id) {
            hasAccess = true;
          } else {
            // Check if user unlocked this land
            const [unlocked] = await pool.query('SELECT 1 FROM unlocked_lands WHERE user_id = ? AND land_id = ?', [decoded.id, l.id]);
            if (unlocked.length > 0) hasAccess = true;
          }
        }
      } catch (err) {
        // Ignore invalid token for this optional check
      }
    }

    const exactLocation = typeof l.exact_location === 'string' ? JSON.parse(l.exact_location) : l.exact_location;
    const sellerContact = typeof l.seller_contact === 'string' ? JSON.parse(l.seller_contact) : l.seller_contact;

    const result = {
      id: l.id,
      title: l.title,
      landTitleNumber: l.land_title_number,
      description: l.description,
      region: l.region,
      division: l.division,
      subdivision: l.subdivision,
      neighborhood: l.neighborhood,
      areaSqM: Number(l.area_sq_m),
      priceFCFA: Number(l.price_fcfa),
      unlockFeeFCFA: Number(l.unlock_fee_fcfa),
      landType: l.land_type,
      topography: l.topography,
      accessRoad: l.access_road,
      images: typeof l.images === 'string' ? JSON.parse(l.images) : l.images || [],
      exactLocation: hasAccess ? exactLocation : null,
      sellerContact: hasAccess ? sellerContact : null,
      verificationStatus: l.verification_status,
      isPublished: !!l.is_published,
      isFeatured: !!l.is_featured,
      rejectionReason: l.rejection_reason,
      surveyorNotes: l.surveyor_notes,
      verifiedAt: l.verified_at,
      submittedAt: l.submitted_at,
      sellerId: l.seller_id,
      documents: docs.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        // Only return protected document details if user has access
        documentNumber: hasAccess ? d.document_number : 'PROTECTED',
        fileUrl: hasAccess ? d.file_url : null,
        fileSize: d.file_size,
        isVerified: !!d.is_verified,
        uploadedAt: d.uploaded_at,
      })),
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/lands
async function createLand(req, res) {
  try {
    const l = req.body;
    
    // In multipart/form-data, arrays and objects might be sent as JSON strings
    const images = typeof l.images === 'string' ? JSON.parse(l.images || '[]') : (l.images || []);
    const exactLocation = typeof l.exactLocation === 'string' ? JSON.parse(l.exactLocation || '{}') : (l.exactLocation || {});
    const sellerContact = typeof l.sellerContact === 'string' ? JSON.parse(l.sellerContact || '{}') : (l.sellerContact || {});
    const documentsMeta = typeof l.documents === 'string' ? JSON.parse(l.documents || '[]') : (l.documents || []);

    const newId = 'land-' + Date.now();
    await pool.query(
      `INSERT INTO lands (
        id, title, land_title_number, description, region, division, subdivision, neighborhood,
        area_sq_m, price_fcfa, land_type, topography, access_road, images, exact_location, seller_contact,
        seller_id, verification_status, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, l.title, l.landTitleNumber, l.description || '', l.region, l.division || '', l.subdivision || '', l.neighborhood || '',
        l.areaSqM, l.priceFCFA, l.landType || 'residential', l.topography || 'flat', l.accessRoad || 'dirt_road',
        JSON.stringify(images), JSON.stringify(exactLocation), JSON.stringify(sellerContact),
        req.user.id, 'pending', 0
      ]
    );

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // Match with metadata if provided
        const meta = documentsMeta[i] || {};
        const fileUrl = `/uploads/${file.filename}`;
        
        await pool.query(
          `INSERT INTO land_documents (id, land_id, name, type, document_number, file_url, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['doc-' + Date.now() + Math.floor(Math.random() * 1000), newId, meta.name || file.originalname, meta.type || 'titre_foncier', meta.documentNumber || '', fileUrl, String(file.size)]
        );
      }
    } else if (documentsMeta && Array.isArray(documentsMeta)) {
      // Fallback for prototype JSON submission without real files
      for (const d of documentsMeta) {
        await pool.query(
          `INSERT INTO land_documents (id, land_id, name, type, document_number, file_url, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['doc-' + Date.now() + Math.floor(Math.random() * 1000), newId, d.name, d.type, d.documentNumber || '', d.fileUrl || '', d.fileSize || '']
        );
      }
    }

    try {
      const io = getIO();
      io.to('role_admin').emit('land_created', { id: newId });
    } catch (err) {
      console.error('Socket emit error:', err);
    }

    res.status(201).json({ id: newId, ...l, verificationStatus: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/lands/:id/status
async function updateLandStatus(req, res) {
  try {
    const { status, surveyorNotes, rejectionReason } = req.body;
    const isPublished = status === 'verified' ? 1 : 0;
    const verifiedAt = status === 'verified' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    await pool.query(
      `UPDATE lands SET verification_status = ?, surveyor_notes = ?, rejection_reason = ?, is_published = ?, verified_at = ? WHERE id = ?`,
      [status, surveyorNotes || null, rejectionReason || null, isPublished, verifiedAt, req.params.id]
    );

    try {
      const io = getIO();
      io.to('role_admin').emit('land_updated', { id: req.params.id, status });
    } catch (err) {
      console.error('Socket emit error:', err);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/unlocked-lands/:userId
async function getUnlockedLands(req, res) {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const [rows] = await pool.query('SELECT land_id FROM unlocked_lands WHERE user_id = ?', [req.params.userId]);
    res.json(rows.map((r) => r.land_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/unlocked-lands
async function unlockLand(req, res) {
  try {
    const { landId } = req.body;
    
    // Security check: verify that a successful transaction exists for this user and land
    const [transactions] = await pool.query(
      'SELECT id FROM transactions WHERE user_id = ? AND land_id = ? AND status = ? LIMIT 1',
      [req.user.id, landId, 'success']
    );

    if (transactions.length === 0) {
      return res.status(403).json({ error: 'Cannot unlock property without a successful payment.' });
    }

    await pool.query('INSERT IGNORE INTO unlocked_lands (user_id, land_id) VALUES (?, ?)', [req.user.id, landId]);
    res.json({ success: true, userId: req.user.id, landId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/lands/:id
async function deleteLand(req, res) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM lands WHERE id = ?', [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllLands,
  getLandById,
  createLand,
  updateLandStatus,
  getUnlockedLands,
  unlockLand,
  deleteLand,
};
