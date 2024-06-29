const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { join } = require('path');

require('dotenv').config();

const app = express();
connectDB();

app.use(express.json());

// Check if MONGODB_URI is set
if (!process.env.MONGO_URI) {
  console.error('MONGODB_URI is not set in the environment variables.');
  process.exit(1);
}



app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback_secret', // Provide a fallback secret
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
      mongoUrl: process.env.MONGO_URI,
      touchAfter: 24 * 3600 // Optional: time period in seconds between session updates
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // Optional: set cookie to expire in 1 day
    }
  })
);

app.use('/auth', require('./routes/authRoutes'));
app.use('/shop', require('./routes/shopRoute'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Serve static files
app.use(express.static(join(__dirname, '../frontend')));
app.use(express.static(join(__dirname, '../frontend/files')))

app.use('/images', express.static(join(__dirname, '../frontend/images')));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../frontend/files', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;