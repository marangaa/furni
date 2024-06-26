const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const User = require('../models/user'); // Import the User model
const { validationResult, check } = require('express-validator');

// POST route to create a new order
router.post('/create', [
  authenticateToken,
  [
    check('items', 'Items are required').isArray().notEmpty(),
    check('totalAmount', 'Total amount is required').isNumeric(),
    check('shippingAddress', 'Shipping address is required').notEmpty(),
  ]
], async (req, res) => {
  try {
    // 1. Validate the order data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, totalAmount, shippingAddress } = req.body;

    // 2. Find the user and update their document with the new order
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newOrder = {
      items,
      totalAmount,
      shippingAddress,
      status: 'pending',
      createdAt: new Date()
    };

    user.orders.push(newOrder);

    // 3. Clear the user's cart
    user.cart = [];

    await user.save();

    res.status(201).json({
      message: 'Order created successfully',
      orderId: user.orders[user.orders.length - 1]._id
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// GET route to fetch user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// GET route to fetch a specific order
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const order = user.orders.id(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

module.exports = router;