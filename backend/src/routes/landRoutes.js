const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', landController.getAllLands);
router.get('/:id', landController.getLandById);
router.post('/', requireAuth, landController.createLand);
router.put('/:id/status', requireAuth, requireRole('admin', 'surveyor'), landController.updateLandStatus);
router.delete('/:id', requireAuth, requireRole('admin'), landController.deleteLand);

module.exports = router;
