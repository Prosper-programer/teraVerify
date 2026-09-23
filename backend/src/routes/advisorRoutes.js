const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');

router.get('/', advisorController.getAllAdvisors);

module.exports = router;
