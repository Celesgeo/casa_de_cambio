const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback-secret-change-me', { expiresIn: '7d' });

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || 'teller'
    });
    const token = generateToken(user._id, user.role);
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Auth register error:', error);
    next(error);
  }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Debug logging
    console.log('[LOGIN] Request received:', {
      email: email ? `${email.substring(0, 3)}***` : 'missing',
      hasPassword: !!password,
      bodyKeys: Object.keys(req.body),
      origin: req.headers.origin || 'no-origin'
    });
    
    if (!email || !password) {
      console.log('[LOGIN] Missing fields:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower }).select('+password');
    
    if (!user) {
      console.log('[LOGIN] User not found:', emailLower);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('[LOGIN] User found:', { email: user.email, name: user.name });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('[LOGIN] Password mismatch for:', emailLower);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id, user.role);
    console.log('[LOGIN] Success for:', emailLower);
    
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error.message);
    next(error);
  }
};
