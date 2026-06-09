const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Nieprawidłowe ID zasobu' });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `Pole '${field}' musi być unikalne` });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token wygasł' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Wewnętrzny błąd serwera',
  });
};

module.exports = errorHandler;