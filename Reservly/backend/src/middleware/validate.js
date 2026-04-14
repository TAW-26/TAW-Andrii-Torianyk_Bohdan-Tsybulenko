// Walidacja danych wejściowych dla auth endpointów
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Imię musi mieć co najmniej 2 znaki' });
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Podaj prawidłowy adres email' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Hasło musi mieć co najmniej 6 znaków' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email i hasło są wymagane' });
  }

  next();
};

module.exports = { validateRegister, validateLogin };