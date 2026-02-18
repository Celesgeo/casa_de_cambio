const express = require('express');
const { calculate } = require('../controllers/closingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
// Only require JWT when explicitly enabled (default: no auth for easier dev)
const useAuth = process.env.REQUIRE_AUTH === 'true';

const noop = (req, res, next) => next();
router.get('/calculate', useAuth ? protect : noop, calculate);

module.exports = router;
