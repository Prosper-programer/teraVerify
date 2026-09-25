const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

const { requireAuth, requireRole, optionalAuth } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/', optionalAuth, landController.getAllLands);
router.get('/:id', landController.getLandById);
router.post('/', requireAuth, requireRole('seller', 'admin'), upload.array('documents', 5), landController.createLand);
router.put('/:id/status', requireAuth, requireRole('admin', 'surveyor'), landController.updateLandStatus);
router.delete('/:id', requireAuth, requireRole('admin'), landController.deleteLand);

module.exports = router;
