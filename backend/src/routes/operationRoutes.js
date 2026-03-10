const express = require('express');
const { createOperation, getOperations, deleteAllOperations } = require('../controllers/operationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/').post(createOperation).get(getOperations).delete(deleteAllOperations);

module.exports = router;

