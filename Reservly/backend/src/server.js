require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB     = require('./config/db');
const errorHandler  = require('./middleware/errorHandler');

const cors    = require('cors');
const morgan  = require('morgan');
const connectDB     = require('./config/db');
const errorHandler  = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: { message: 'Za dużo prób logowania, spróbuj za 15 minut' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth',         authRoutes);
app.use('/api/fields',       fieldRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews',      reviewRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));