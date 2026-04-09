const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generowanie tokenu JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Rejestracja nowego użytkownika
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email jest już zajęty' });

  const user = await User.create({ name, email, password });

  res.status(201).json({
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// Logowanie użytkownika
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
  }

  res.json({
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// Pobranie danych zalogowanego użytkownika
const getMe = async (req, res) => {
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role });
};

module.exports = { register, login, getMe };