const express = require('express');
const { createOperation, getOperations, deleteAllOperations } = require('../controllers/operationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
// Only require JWT when explicitly enabled (default: no auth for easier dev)
const useAuth = process.env.REQUIRE_AUTH === 'true';
const noop = (req, res, next) => next();

router
  .route('/')
  .post(useAuth ? protect : noop, createOperation)
  .get(useAuth ? protect : noop, getOperations)
  .delete(useAuth ? protect : noop, deleteAllOperations);

module.exports = router;

