// Globalny handler błędów – obsługuje wszystkie wyjątki z kontrolerów
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Błąd nieprawidłowego ID w MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Nieprawidłowe ID zasobu' });
  }

  // Błąd unikalności (np. duplikat emaila)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `Pole '${field}' musi być unikalne` });
  }

  // Błąd walidacji Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Błąd nieprawidłowego tokenu JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }

  // Błąd wygasłego tokenu JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token wygasł' });
  }

  // Domyślny błąd serwera
  res.status(err.statusCode || 500).json({
    message: err.message || 'Wewnętrzny błąd serwera',
  });
};

module.exports = errorHandler;