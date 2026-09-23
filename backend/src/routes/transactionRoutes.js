const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, transactionController.getAllTransactions);
router.post('/', requireAuth, transactionController.createTransaction);

module.exports = router;
