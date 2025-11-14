document.addEventListener('DOMContentLoaded', function() {
  console.log('About page loaded successfully');
  
  // Initialize profile functionality for about page
  initProfileFunctionality();
  
  // Add any about page specific functionality here
});

// Initialize profile functionality
function initProfileFunctionality() {
  const profileLink = document.getElementById('profileLink');
  const profilePage = document.getElementById('profilePage');
  const mainContent = document.getElementById('mainContent');
  const profileCloseBtn = document.getElementById('profileCloseBtn');
  
  if (profileLink && profilePage && mainContent) {
    profileLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Close any open dropdowns
      const userDropdown = document.getElementById('userDropdown');
      if (userDropdown) {
        userDropdown.classList.remove('active');
      }
      
      // Show profile page and hide main content
      mainContent.style.display = 'none';
      profilePage.classList.add('active');
      
      // Load user data if logged in
      const auth = firebase.auth();
      const user = auth.currentUser;
      if (user) {
        console.log('Loading profile data for user:', user.uid);
        // Load addresses and orders
        loadUserAddresses(user.uid);
        loadUserOrders(user.uid);
      }
    });
  }
  
  if (profileCloseBtn && profilePage && mainContent) {
    profileCloseBtn.addEventListener('click', () => {
      profilePage.classList.remove('active');
      mainContent.style.display = 'block';
    });
  }
}

// Load user addresses
function loadUserAddresses(userId) {
  const addressesContainer = document.getElementById('addresses-container');
  if (!addressesContainer) return;
  
  addressesContainer.innerHTML = '<div class="loading">Loading addresses...</div>';
  
  const db = firebase.firestore();
  db.collection('users').doc(userId).collection('addresses')
    .orderBy('createdAt', 'desc')
    .get()
    .then((querySnapshot) => {
      addressesContainer.innerHTML = '';
      
      if (querySnapshot.empty) {
        addressesContainer.innerHTML = `
          <div class="empty-state" style="text-align: center; padding: 40px; color: #777;">
            <i class="fas fa-map-marker-alt" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
            <p>No addresses saved yet</p>
          </div>
        `;
        return;
      }
      
      querySnapshot.forEach((doc) => {
        const address = doc.data();
        displayAddress(doc.id, address);
      });
    })
    .catch((error) => {
      console.error("Error loading addresses:", error);
      addressesContainer.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 40px; color: #d32f2f;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
          <p>Error loading addresses</p>
          <button class="btn btn-sm" onclick="loadUserAddresses('${userId}')">Retry</button>
        </div>
      `;
    });
}

// Load user orders
function loadUserOrders(userId) {
  const ordersContainer = document.getElementById('orders-container');
  if (!ordersContainer) return;
  
  ordersContainer.innerHTML = '<div class="loading">Loading orders...</div>';
  
  const db = firebase.firestore();
  db.collection('users').doc(userId).collection('orders')
    .orderBy('createdAt', 'desc')
    .get()
    .then((querySnapshot) => {
      ordersContainer.innerHTML = '';
      
      if (querySnapshot.empty) {
        ordersContainer.innerHTML = `
          <div class="empty-state" style="text-align: center; padding: 40px; color: #777;">
            <i class="fas fa-shopping-bag" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
            <p>No orders yet</p>
          </div>
        `;
        return;
      }
      
      querySnapshot.forEach((doc) => {
        const order = doc.data();
        order.id = doc.id;
        displayOrder(order);
      });
    })
    .catch((error) => {
      console.error("Error loading orders:", error);
      ordersContainer.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 40px; color: #d32f2f;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
          <p>Error loading orders</p>
          <button class="btn btn-sm" onclick="loadUserOrders('${userId}')">Retry</button>
        </div>
      `;
    });
}

// Display address in the UI
function displayAddress(addressId, address) {
  const addressesContainer = document.getElementById('addresses-container');
  if (!addressesContainer) return;
  
  const addressCard = document.createElement('div');
  addressCard.className = 'address-card';
  addressCard.innerHTML = `
    <h3>
      ${address.label || 'Address'}
      ${address.isDefault ? '<span style="background: #e7d90f; color: #333; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 8px;">Default</span>' : ''}
    </h3>
    <p><strong>${address.name || 'No name'}</strong></p>
    <p>${(address.address || '').replace(/\n/g, '<br>')}</p>
    <p>Phone: ${address.phone || 'Not provided'}</p>
    <p>Pincode: ${address.pincode || 'Not provided'}</p>
    <div class="address-actions">
      ${!address.isDefault ? `
        <button class="btn btn-sm set-default-address" data-id="${addressId}">
          <i class="fas fa-star"></i> Set Default
        </button>
      ` : ''}
      <button class="btn btn-sm edit-address" data-id="${addressId}">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="btn btn-sm btn-danger delete-address" data-id="${addressId}">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
  `;
  
  addressesContainer.appendChild(addressCard);
  
  // Add event listeners
  const deleteBtn = addressCard.querySelector('.delete-address');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to delete this address?')) {
        deleteAddress(addressId);
      }
    });
  }
}

// Display order in the UI
function displayOrder(order) {
  const ordersContainer = document.getElementById('orders-container');
  if (!ordersContainer) return;
  
  const orderCard = document.createElement('div');
  orderCard.className = 'order-card';
  
  // Get status class
  const statusClass = `status-${order.status || 'placed'}`;
  const statusText = (order.status || 'placed').charAt(0).toUpperCase() + (order.status || 'placed').slice(1);
  
  orderCard.innerHTML = `
    <div class="order-header">
      <div>
        <span class="order-id">Order #${order.id.substring(0, 8)}</span>
        <span class="order-date">${new Date(order.createdAt?.toDate() || new Date()).toLocaleDateString()}</span>
      </div>
      <span class="order-status ${statusClass}">${statusText}</span>
    </div>
    <div class="order-items">
      <div class="order-item">
        <div class="order-item-main">
          <div class="order-item-image-container">
            <div class="order-item-image">
              <i class="fas fa-jar"></i>
            </div>
          </div>
          <div class="order-item-content">
            <div class="order-item-header">
              <div class="order-item-info">
                <div class="order-item-name">Order Items</div>
                <div class="order-item-weight">${order.items ? order.items.length : 0} items</div>
              </div>
              <div class="order-item-price">₹${order.total || '0'}</div>
            </div>
            <div class="order-item-footer">
              <div class="order-item-quantity">
                <i class="fas fa-box"></i>
                Total: ₹${order.total || '0'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  ordersContainer.appendChild(orderCard);
}

// Delete address function
function deleteAddress(addressId) {
  const auth = firebase.auth();
  const user = auth.currentUser;
  if (!user) return;
  
  const db = firebase.firestore();
  db.collection('users').doc(user.uid).collection('addresses').doc(addressId).delete()
    .then(() => {
      loadUserAddresses(user.uid);
    })
    .catch((error) => {
      console.error("Error deleting address:", error);
      alert('Error deleting address: ' + error.message);
    });
}
