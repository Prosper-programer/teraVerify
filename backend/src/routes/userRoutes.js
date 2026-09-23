const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireRole('admin'), userController.getAllUsers);
router.put('/:id/toggle-status', requireAuth, requireRole('admin'), userController.toggleUserStatus);
router.put('/:id/role', requireAuth, requireRole('admin'), userController.changeUserRole);

module.exports = router;
