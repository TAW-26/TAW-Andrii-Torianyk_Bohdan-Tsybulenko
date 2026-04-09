require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const connectDB = require('./config/db');

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

// Trasy API
app.use('/api/auth',         authRoutes);
app.use('/api/fields',       fieldRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews',      reviewRoutes);

// Sprawdzenie czy serwer działa
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Globalny handler błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Błąd serwera' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));