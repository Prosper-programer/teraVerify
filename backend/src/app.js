const express = require('express');
const cors = require('cors');

// Import Middlewares
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import Database check
const { checkConnection } = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const landRoutes = require('./routes/landRoutes');
const unlockedLandRoutes = require('./routes/unlockedLandRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const advisorRoutes = require('./routes/advisorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkConnection();
  if (dbStatus.ok) {
    res.json({ status: 'ok', database: dbStatus.database });
  } else {
    res.status(500).json({ status: 'error', error: dbStatus.error });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lands', landRoutes);
app.use('/api/unlocked-lands', unlockedLandRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
