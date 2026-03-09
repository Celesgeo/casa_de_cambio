const express = require('express');
const { getDailyBalance } = require('../controllers/reportsController');

const router = express.Router();

router.get('/daily-balance', getDailyBalance);

module.exports = router;
