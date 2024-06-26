document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/shop/products');
      const products = await response.json();
  
      const productSection = document.querySelector('.product-section .row');
      productSection.innerHTML = ''; // Clear existing content
  
      products.forEach(product => {
        const productItem = `
          <div class="col-12 col-md-4 col-lg-3 mb-5">
            <a class="product-item" href="#" data-product-id="${product._id}">
              <img src="${product.image}" class="img-fluid product-thumbnail">
              <h3 class="product-title">${product.title}</h3>
              <strong class="product-price">$${product.price.toFixed(2)}</strong>
              <span class="icon-cross">
                <img src="../images/cross.svg" class="img-fluid">
              </span>
            </a>
          </div>
        `;
        productSection.insertAdjacentHTML('beforeend', productItem);
      });
  
      // Add event listener for adding products to cart
      productSection.addEventListener('click', async (e) => {
        if (e.target.closest('.icon-cross')) {
          e.preventDefault();
          const productItem = e.target.closest('.product-item');
          const productId = productItem.dataset.productId;
          await addToCart(productId);
        }
      });
  
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  });
  
  async function addToCart(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Changed from 'x-auth-token' to 'Authorization'
        },
        body: JSON.stringify({ productId })
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in to add items to cart');
        }
        throw new Error('Failed to add item to cart');
      }
  
      const result = await response.json();
      console.log(result.message);
      // You can add a visual feedback here, like a toast notification
    } catch (error) {
      console.error('Error adding to cart:', error.message);
      // Display error message to user (e.g., using an alert or a toast notification)
      alert(error.message);
    }
  }