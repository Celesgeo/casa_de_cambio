const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Company = require('../models/Company');

const generateToken = (userId, companyId, role) =>
  jwt.sign({ userId, companyId: String(companyId), role }, process.env.JWT_SECRET || 'Alvarez2026', { expiresIn: '7d' });

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }
    const companyId = req.body.companyId;
    if (!companyId) return res.status(400).json({ message: 'companyId required' });
    const exists = await User.findOne({ companyId, email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      companyId,
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || 'teller'
    });
    const token = generateToken(user._id, user.companyId, user.role);
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
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    const emailLower = String(email).trim().toLowerCase();
    
    // Acceso directo para grupoalvarez / elterribleusd1: crea o corrige usuario y devuelve token
    if (emailLower === 'grupoalvarez' && password === 'elterribleusd1') {
      let company = await Company.findOne({ name: 'GRUPO ALVAREZ' });
      if (!company) company = await Company.create({ name: 'GRUPO ALVAREZ', plan: 'standard', isActive: true });
      const cid = company._id;
      const hashed = await bcrypt.hash('elterribleusd1', 10);
      let user = await User.findOne({ email: 'grupoalvarez' }).select('+password').populate('companyId');
      if (!user) {
        user = await User.create({
          companyId: cid,
          name: 'Grupo Alvarez',
          email: 'grupoalvarez',
          password: hashed,
          role: 'admin'
        });
        console.log('[LOGIN] Created user grupoalvarez');
      } else {
        await User.updateOne(
          { _id: user._id },
          { $set: { companyId: cid, password: hashed, isActive: true } }
        );
        user.companyId = company;
        user.role = user.role || 'admin';
        console.log('[LOGIN] Updated grupoalvarez (company + password reset)');
      }
      const token = generateToken(user._id, cid, user.role);
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    }
    
    // Flujo normal
    let user = await User.findOne({ email: emailLower }).select('+password').populate('companyId');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.isActive === false) {
      return res.status(401).json({ message: 'User account is inactive' });
    }
    let cid = user.companyId?._id ?? user.companyId;
    if (!cid) {
      let company = await Company.findOne({ name: 'GRUPO ALVAREZ' });
      if (!company) company = await Company.create({ name: 'GRUPO ALVAREZ', plan: 'standard', isActive: true });
      await User.updateOne({ _id: user._id }, { $set: { companyId: company._id } });
      cid = company._id;
      user.companyId = company;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id, cid, user.role);
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
