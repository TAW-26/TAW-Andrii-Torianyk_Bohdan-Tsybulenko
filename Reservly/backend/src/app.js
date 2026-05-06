require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler  = require('./middleware/errorHandler');

const authRoutes        = require('./routes/auth');
const fieldRoutes       = require('./routes/fields');
const reservationRoutes = require('./routes/reservations');
const reviewRoutes      = require('./routes/reviews');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting dla endpointów auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Za dużo prób logowania, spróbuj za 15 minut' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Trasy API
app.use('/api/auth',         authRoutes);
app.use('/api/fields',       fieldRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews',      reviewRoutes);

// Sprawdzenie czy serwer działa
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Globalny handler błędów (musi być ostatni)
app.use(errorHandler);

module.exports = app;