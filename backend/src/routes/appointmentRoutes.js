const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, appointmentController.getAllAppointments);
router.post('/', requireAuth, appointmentController.createAppointment);

module.exports = router;
