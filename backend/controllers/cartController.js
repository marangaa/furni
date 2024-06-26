const User = require('../models/user');
const Product = require('../models/product');

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    const cartItems = user.cart.map(item => ({
      productId: item.product._id,
      title: item.product.title,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity
    }));

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal; // Add tax or shipping if needed

    res.json({ items: cartItems, subtotal, total });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const user = await User.findById(req.user.id);

    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      if (action === 'increase') {
        user.cart[cartItemIndex].quantity += 1;
      } else if (action === 'decrease') {
        user.cart[cartItemIndex].quantity -= 1;
        if (user.cart[cartItemIndex].quantity <= 0) {
          user.cart.splice(cartItemIndex, 1);
        }
      }
    }

    await user.save();
    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);

    await user.save();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};