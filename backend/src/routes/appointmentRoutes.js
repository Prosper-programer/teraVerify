const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, appointmentController.getAllAppointments);
router.post('/', requireAuth, appointmentController.createAppointment);
router.put('/:id/status', requireAuth, appointmentController.updateAppointmentStatus);
router.put('/:id/cancel', requireAuth, appointmentController.cancelAppointment);

module.exports = router;
