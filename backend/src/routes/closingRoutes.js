const express = require('express');
const { calculate } = require('../controllers/closingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/calculate', calculate);

module.exports = router;
