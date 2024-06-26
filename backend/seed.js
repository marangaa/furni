const mongoose = require('mongoose');
const Product = require('./models/product'); // Assuming we have a Product model

mongoose.connect('mongodb://localhost:27017/shop');

const products = [
  { title: 'Nordic Chair', price: 50, image: '../frontend/images/product-3.png' },
  { title: 'Kruzo Aero Chair', price: 78, image: '../frontend/images/product-2.png' },
  { title: 'Ergonomic Chair', price: 43, image: '../frontend/images/product-1.png' },
  // Add more products as needed
];

Product.insertMany(products)
  .then(() => {
    console.log('Data seeded successfully');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error seeding data:', err);
    mongoose.connection.close();
  });
