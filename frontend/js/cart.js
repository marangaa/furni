// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
  
    // Event delegation for dynamically added elements
    document.querySelector('.product-section').addEventListener('click', async (e) => {
      if (e.target.closest('.icon-cross')) {
        e.preventDefault();
        const productItem = e.target.closest('.product-item');
        const productId = productItem.dataset.productId;
        await addToCart(productId);
        updateCart();
      }
    });
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
  
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
  
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message);
    }
  }
  
  async function updateCart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch cart data');
      }
  
      const cartData = await response.json();
      renderCart(cartData);
    } catch (error) {
      console.error('Error updating cart:', error);
      alert(error.message);
    }
  }
  
  function renderCart(cartData) {
    const cartTableBody = document.getElementById('cart-items');
    cartTableBody.innerHTML = '';
  
    cartData.items.forEach(item => {
      const row = `
        <tr>
          <td class="product-thumbnail">
            <img src="${item.image}" alt="Image" class="img-fluid">
          </td>
          <td class="product-name">
            <h2 class="h5 text-black">${item.title}</h2>
          </td>
          <td>$${item.price.toFixed(2)}</td>
          <td>
            <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px;">
              <div class="input-group-prepend">
                <button class="btn btn-outline-black decrease" type="button" data-product-id="${item.productId}">&minus;</button>
              </div>
              <input type="text" class="form-control text-center quantity-amount" value="${item.quantity}" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1">
              <div class="input-group-append">
                <button class="btn btn-outline-black increase" type="button" data-product-id="${item.productId}">&plus;</button>
              </div>
            </div>
          </td>
          <td>$${(item.price * item.quantity).toFixed(2)}</td>
          <td><a href="#" class="btn btn-black btn-sm remove-item" data-product-id="${item.productId}">X</a></td>
        </tr>
      `;
      cartTableBody.insertAdjacentHTML('beforeend', row);
    });
  
    // Update cart totals
    document.getElementById('cart-subtotal').textContent = `$${cartData.subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${cartData.total.toFixed(2)}`;
  
    // Add event listeners for quantity changes and item removal
    addCartEventListeners();
  }
  
  function addCartEventListeners() {
    document.querySelectorAll('.increase, .decrease').forEach(button => {
      button.addEventListener('click', async () => {
        const productId = button.dataset.productId;
        const action = button.classList.contains('increase') ? 'increase' : 'decrease';
        await updateCartItem(productId, action);
        updateCart();
      });
    });
  
    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const productId = button.dataset.productId;
        await removeCartItem(productId);
        updateCart();
      });
    });
  }
  
  async function updateCartItem(productId, action) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, action })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }
  
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error updating cart item:', error);
      alert(error.message);
    }
  }
  
  async function removeCartItem(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
  
      if (!response.ok) {
        throw new Error('Failed to remove cart item');
      }
  
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error removing cart item:', error);
      alert(error.message);
    }
  }