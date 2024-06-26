// Function to render cart items
function renderCartItems(cartData) {
  const orderTable = document.querySelector('.site-block-order-table tbody');
  orderTable.innerHTML = '';

  if (!cartData || !Array.isArray(cartData.items)) {
    console.error('Invalid cart data structure:', cartData);
    orderTable.innerHTML = '<tr><td colspan="2">No items in cart</td></tr>';
    return;
  }

  cartData.items.forEach(item => {
    if (!item || !item.title || !item.price) {
      console.error('Invalid item in cart:', item);
      return;
    }

    const row = `
      <tr>
        <td>${item.title} <strong class="mx-2">x</strong> ${item.quantity}</td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `;
    orderTable.insertAdjacentHTML('beforeend', row);
  });

  const subtotalRow = `
    <tr>
      <td class="text-black font-weight-bold"><strong>Cart Subtotal</strong></td>
      <td class="text-black">$${cartData.subtotal.toFixed(2)}</td>
    </tr>
  `;
  orderTable.insertAdjacentHTML('beforeend', subtotalRow);

  const totalRow = `
    <tr>
      <td class="text-black font-weight-bold"><strong>Order Total</strong></td>
      <td class="text-black font-weight-bold"><strong>$${cartData.total.toFixed(2)}</strong></td>
    </tr>
  `;
  orderTable.insertAdjacentHTML('beforeend', totalRow);
}

// Function to load cart items
async function loadCartItems() {
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
    console.log('Received cart data:', cartData);
    renderCartItems(cartData);
  } catch (error) {
    console.error('Error loading cart items:', error);
    alert(error.message);
  }
}

// Function to place an order
async function placeOrder(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const shippingAddress = Object.fromEntries(formData.entries());

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const cartResponse = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!cartResponse.ok) {
      throw new Error('Failed to fetch cart data');
    }

    const cartData = await cartResponse.json();

    if (!cartData || !Array.isArray(cartData.items)) {
      throw new Error('Invalid cart data structure');
    }

    const orderData = {
      items: cartData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity
      })),
      totalAmount: cartData.total,
      shippingAddress: `${shippingAddress.address}, ${shippingAddress.stateCountry}, ${shippingAddress.postalZip}`
    };

    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to place order');
    }

    const result = await response.json();
    alert(result.message);
    console.log('Order ID:', result.orderId);
    window.location.href = 'thankyou.html';
  } catch (error) {
    console.error('Error placing order:', error);
    alert(error.message);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadCartItems();

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', placeOrder);
  }
});