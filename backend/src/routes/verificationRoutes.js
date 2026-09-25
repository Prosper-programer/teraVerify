const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('admin', 'surveyor'), verificationController.getAllVerifications);
router.post('/', requireAuth, requireRole('seller', 'admin'), verificationController.createVerification);
router.put('/:id/status', requireAuth, requireRole('surveyor', 'admin'), verificationController.updateVerificationStatus);
router.get('/title/:titleNumber', verificationController.verifyTitlePublic);

module.exports = router;
