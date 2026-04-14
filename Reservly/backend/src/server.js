require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB     = require('./config/db');
const errorHandler  = require('./middleware/errorHandler');

const authRoutes        = require('./routes/auth');
const fieldRoutes       = require('./routes/fields');
const reservationRoutes = require('./routes/reservations');
const reviewRoutes      = require('./routes/reviews');

const app = express();

// Połączenie z MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting dla endpointów auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 20, // max 20 prób w ciągu 15 minut
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));