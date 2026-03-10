const express = require('express');
const { getDailyBalance } = require('../controllers/reportsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/daily-balance', getDailyBalance);

module.exports = router;
