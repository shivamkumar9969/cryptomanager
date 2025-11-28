const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const supportContoller = require('../controllers/supportContoller');


router.post('/support', authenticate, supportContoller.saveSupport);

module.exports = router