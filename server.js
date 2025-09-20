require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const path = require('path');



const { connectDB } = require('./server/src/config/db.js');
const bookingRoutes = require('./server/src/routes/booking.routes.js');
const adminRoutes = require('./server/src/routes/admin.routes.js');
const checkoutRoutes = require('./server/src/routes/checkout.routes.js');
const webhookRoutes = require('./server/src/routes/webhook.routes.js');

const app = express();

// 🟢 Stripe webhook BEFORE express.json()
app.use('/api/webhook', webhookRoutes);

// Security + middleware
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // JSON for normal routes
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'client')));
// API routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/admin', adminRoutes);

// MongoDB connect (in db.js)
mongoose.connect(process.env.MONGODB_URI);

// Static site
const clientDir = path.join(__dirname, 'client');
app.use(express.static(clientDir));

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// 404 for API
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Not found' }));

// SPA fallback
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(clientDir, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ DB connect failed', err);
    process.exit(1);
  });
