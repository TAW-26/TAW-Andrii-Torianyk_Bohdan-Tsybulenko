require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const promBundle = require("express-prom-bundle");
const fs = require('fs');
const path = require('path');
const promClient = require('prom-client');

promClient.collectDefaultMetrics();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const fieldRoutes = require('./routes/fields');
const reservationRoutes = require('./routes/reservations');
const reviewRoutes = require('./routes/reviews');

const app = express();

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeDefaultMetrics: true, 
});

app.use(metricsMiddleware);

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
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorType = err.name || 'Error';
  const context = `Method: ${req.method} | URL: ${req.originalUrl} | IP: ${req.ip}`;
  
  const logMessage = `[${timestamp}] [${errorType}] ${err.message}\nContext: ${context}\nStack: ${err.stack}\n${'-'.repeat(50)}\n`;

  fs.appendFileSync(path.join(__dirname, '../errors.log'), logMessage, 'utf8');

  next(err);
});


app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));