const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

// Rejestracja i logowanie (publiczne) – z walidacją
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Dane zalogowanego użytkownika (wymaga tokenu)
router.get('/me', protect, getMe);

module.exports = router;