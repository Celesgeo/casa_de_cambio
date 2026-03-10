const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route GET /api/users - list users for same company (admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: 'Unauthorized: company context required' });
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const users = await User.find({ companyId }).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    next(error);
  }
};

// @route POST /api/users - create user (admin only)
exports.createUser = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: 'Unauthorized: company context required' });
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }

    const exists = await User.findOne({ companyId, email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'User already exists with this email' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      companyId,
      name: String(name).trim(),
      email: email.toLowerCase(),
      password: hashed,
      role: ['admin', 'manager', 'teller'].includes(role) ? role : 'teller'
    });

    const u = user.toObject();
    delete u.password;
    return res.status(201).json(u);
  } catch (error) {
    console.error('Create user error:', error);
    next(error);
  }
};

// @route PATCH /api/users/:id - toggle isActive (admin only)
exports.updateUserActive = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return res.status(401).json({ message: 'Unauthorized: company context required' });
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, companyId },
      { isActive: req.body.isActive },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    console.error('Update user active error:', error);
    next(error);
  }
};
