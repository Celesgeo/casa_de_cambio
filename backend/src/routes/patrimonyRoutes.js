const express = require('express');
const { getPatrimony, updatePatrimony, initPatrimony } = require('../controllers/patrimonyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getPatrimony);
router.put('/', updatePatrimony);
router.post('/init', initPatrimony);

module.exports = router;
