const express = require('express');
const { getPatrimony, updatePatrimony, initPatrimony } = require('../controllers/patrimonyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
// Only require JWT when explicitly enabled (default: no auth for easier dev)
const useAuth = process.env.REQUIRE_AUTH === 'true';

if (useAuth) {
  router.get('/', protect, getPatrimony);
  router.put('/', protect, updatePatrimony);
  router.post('/init', protect, initPatrimony);
} else {
  router.get('/', getPatrimony);
  router.put('/', updatePatrimony);
  router.post('/init', initPatrimony);
}

module.exports = router;
