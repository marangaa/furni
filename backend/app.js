const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { join } = require('path');


require('dotenv').config();

const app = express();
connectDB();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://rchdmaranga:cluster0@cluster0.whqvjf9.mongodb.net/shop' }),
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

module.exports = app;
