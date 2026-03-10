const express = require('express');
const { getUsers, createUser, updateUserActive } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUser);
router.patch('/:id', authorize('admin'), updateUserActive);

module.exports = router;
