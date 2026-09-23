const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');

const { requireAuth } = require('../middleware/authMiddleware');

router.get('/:userId', requireAuth, landController.getUnlockedLands);
router.post('/', requireAuth, landController.unlockLand);

module.exports = router;
