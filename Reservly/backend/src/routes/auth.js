const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rejestracja i logowanie (publiczne)
router.post('/register', register);
router.post('/login', login);

// Dane zalogowanego użytkownika (wymaga tokenu)
router.get('/me', protect, getMe);

module.exports = router;