const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { saveExchangeKeys, getBalances } = require('../controllers/exchangeController');

// Save/Update API keys (validates by making a test call)
router.post('/keys', auth, saveExchangeKeys);

// Get balances (uses stored keys)
router.get('/balances', auth, getBalances);

module.exports = router;
