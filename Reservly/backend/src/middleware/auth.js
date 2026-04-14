const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware sprawdzający token JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Brak autoryzacji – nie podano tokenu' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: 'Użytkownik nie istnieje' });
    }

    next();
  } catch (err) {
    next(err); 
  }
};

// Middleware tylko dla administratora
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Wymagane uprawnienia administratora' });
  }
  next();
};

module.exports = { protect, adminOnly };