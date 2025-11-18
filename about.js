// Profile Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Profile elements
    const profilePage = document.getElementById('profilePage');
    const profileCloseBtn = document.getElementById('profileCloseBtn');
    const mainContent = document.getElementById('mainContent');
    const profileLink = document.getElementById('profileLink');
    const userIcon = document.querySelector('.user-dropdown');
    
    // Edit profile elements
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditProfileModal = document.getElementById('close-edit-profile-modal');
    const cancelEditProfile = document.getElementById('cancel-edit-profile');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    
    // Address elements
    const addAddressBtn = document.getElementById('add-address-btn');
    const addAddressForm = document.getElementById('add-address-form');
    const saveNewAddress = document.getElementById('save-new-address');
    const cancelNewAddress = document.getElementById('cancel-new-address');
    
    // User info elements
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const memberSince = document.getElementById('member-since');
    const editName = document.getElementById('edit-name');
    const editEmail = document.getElementById('edit-email');
    
    // Check if user is logged in
    function checkAuthStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        return currentUser && currentUser.uid;
    }

    // Show profile page
    function showProfilePage() {
        if (!checkAuthStatus()) {
            showLoginModal();
            return;
        }
        
        mainContent.style.display = 'none';
        profilePage.classList.add('active');
        loadUserProfile();
        loadAddresses();
        loadOrders();
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Hide profile page
    function hideProfilePage() {
        profilePage.classList.remove('active');
        mainContent.style.display = 'block';
    }

    // Load user profile data
    function loadUserProfile() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            userName.textContent = currentUser.displayName || 'User Name';
            userEmail.textContent = currentUser.email || 'user@example.com';
            editName.value = currentUser.displayName || '';
            editEmail.value = currentUser.email || '';
            
            // Set member since date
            if (currentUser.createdAt) {
                const joinDate = new Date(currentUser.createdAt);
                memberSince.textContent = joinDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } else {
                memberSince.textContent = 'Recently';
            }
        }
    }

    // Load user addresses
    function loadAddresses() {
        const addressesContainer = document.getElementById('addresses-container');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) return;
        
        const userAddresses = JSON.parse(localStorage.getItem(`userAddresses_${currentUser.uid}`)) || [];
        
        if (userAddresses.length === 0) {
            addressesContainer.innerHTML = `
                <div class="address-card">
                    <p>No addresses saved yet. Add your first address to make checkout easier!</p>
                </div>
            `;
            return;
        }
        
        addressesContainer.innerHTML = userAddresses.map((address, index) => `
            <div class="address-card" data-index="${index}">
                <h3>
                    ${address.label}
                    <span style="font-size: 14px; color: #777; font-weight: normal;">${address.isDefault ? '(Default)' : ''}</span>
                </h3>
                <p>
                    <strong>${address.name}</strong><br>
                    ${address.address}<br>
                    Pincode: ${address.pincode}<br>
                    Phone: ${address.phone}
                </p>
                <div class="address-actions">
                    ${!address.isDefault ? `
                        <button class="btn btn-sm btn-outline set-default-address" data-index="${index}">
                            <i class="fas fa-star"></i> Set Default
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline edit-address" data-index="${index}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-address" data-index="${index}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners for address actions
        document.querySelectorAll('.set-default-address').forEach(btn => {
            btn.addEventListener('click', setDefaultAddress);
        });
        
        document.querySelectorAll('.edit-address').forEach(btn => {
            btn.addEventListener('click', editAddress);
        });
        
        document.querySelectorAll('.delete-address').forEach(btn => {
            btn.addEventListener('click', deleteAddress);
        });
    }

    // Load user orders
    function loadOrders() {
        const ordersContainer = document.getElementById('orders-container');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) return;
        
        const userOrders = JSON.parse(localStorage.getItem(`userOrders_${currentUser.uid}`)) || [];
        
        if (userOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <span class="order-id">No orders yet</span>
                        </div>
                    </div>
                    <p>You haven't placed any orders yet. Start shopping to see your order history here!</p>
                </div>
            `;
            return;
        }
        
        // Sort orders by date (newest first)
        userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        
        ordersContainer.innerHTML = userOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Order #${order.orderId}</span>
                        <span class="order-date">${new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
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
                                            <div class="order-item-name">${item.name}</div>
                                            <div class="order-item-weight">${item.weight}</div>
                                        </div>
                                        <div class="order-item-price">₹${item.price}</div>
                                    </div>
                                    <div class="order-item-footer">
                                        <div class="order-item-quantity">
                                            Quantity: ${item.quantity}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                    <strong>Total: ₹${order.total}</strong>
                </div>
            </div>
        `).join('');
    }

    // Set default address
    function setDefaultAddress(e) {
        const index = parseInt(e.target.closest('.set-default-address').dataset.index);
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) return;
        
        const userAddresses = JSON.parse(localStorage.getItem(`userAddresses_${currentUser.uid}`)) || [];
        
        // Remove default from all addresses
        userAddresses.forEach(addr => {
            addr.isDefault = false;
        });
        
        // Set the selected address as default
        userAddresses[index].isDefault = true;
        
        // Save back to localStorage
        localStorage.setItem(`userAddresses_${currentUser.uid}`, JSON.stringify(userAddresses));
        
        // Reload addresses
        loadAddresses();
        
        // Show success message
        showNotification('Default address updated successfully!');
    }

    // Edit address
    function editAddress(e) {
        // For now, we'll implement adding new addresses only
        // Full edit functionality can be added later
        showNotification('Edit functionality coming soon!');
    }

    // Delete address
    function deleteAddress(e) {
        const index = parseInt(e.target.closest('.delete-address').dataset.index);
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) return;
        
        const userAddresses = JSON.parse(localStorage.getItem(`userAddresses_${currentUser.uid}`)) || [];
        const addressToDelete = userAddresses[index];
        
        if (confirm(`Are you sure you want to delete the "${addressToDelete.label}" address?`)) {
            userAddresses.splice(index, 1);
            localStorage.setItem(`userAddresses_${currentUser.uid}`, JSON.stringify(userAddresses));
            loadAddresses();
            showNotification('Address deleted successfully!');
        }
    }

    // Show add address form
    addAddressBtn.addEventListener('click', function() {
        addAddressForm.style.display = 'block';
        addAddressBtn.style.display = 'none';
    });

    // Cancel adding new address
    cancelNewAddress.addEventListener('click', function() {
        addAddressForm.style.display = 'none';
        addAddressBtn.style.display = 'block';
        // Clear form fields
        document.getElementById('new-label').value = '';
        document.getElementById('new-pincode').value = '';
        document.getElementById('new-name').value = '';
        document.getElementById('new-address').value = '';
        document.getElementById('new-phone').value = '';
    });

    // Save new address
    saveNewAddress.addEventListener('click', function() {
        const label = document.getElementById('new-label').value.trim();
        const pincode = document.getElementById('new-pincode').value.trim();
        const name = document.getElementById('new-name').value.trim();
        const address = document.getElementById('new-address').value.trim();
        const phone = document.getElementById('new-phone').value.trim();
        
        if (!label || !pincode || !name || !address || !phone) {
            showNotification('Please fill in all address fields!', 'error');
            return;
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            showNotification('Please log in to save addresses!', 'error');
            return;
        }
        
        const userAddresses = JSON.parse(localStorage.getItem(`userAddresses_${currentUser.uid}`)) || [];
        
        // Check if this is the first address (set as default)
        const isDefault = userAddresses.length === 0;
        
        const newAddress = {
            label,
            pincode,
            name,
            address,
            phone,
            isDefault
        };
        
        userAddresses.push(newAddress);
        localStorage.setItem(`userAddresses_${currentUser.uid}`, JSON.stringify(userAddresses));
        
        // Hide form and show button
        addAddressForm.style.display = 'none';
        addAddressBtn.style.display = 'block';
        
        // Clear form
        document.getElementById('new-label').value = '';
        document.getElementById('new-pincode').value = '';
        document.getElementById('new-name').value = '';
        document.getElementById('new-address').value = '';
        document.getElementById('new-phone').value = '';
        
        // Reload addresses
        loadAddresses();
        
        showNotification('Address saved successfully!');
    });

    // Edit profile functionality
    editProfileBtn.addEventListener('click', function() {
        if (!checkAuthStatus()) {
            showLoginModal();
            return;
        }
        
        editProfileModal.style.display = 'flex';
    });

    // Close edit profile modal
    closeEditProfileModal.addEventListener('click', function() {
        editProfileModal.style.display = 'none';
    });

    cancelEditProfile.addEventListener('click', function() {
        editProfileModal.style.display = 'none';
    });

    // Save profile changes
    saveProfileBtn.addEventListener('click', function() {
        const newName = editName.value.trim();
        
        if (!newName) {
            showNotification('Please enter your name!', 'error');
            return;
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            currentUser.displayName = newName;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update displayed name
            userName.textContent = newName;
            
            // Close modal
            editProfileModal.style.display = 'none';
            
            showNotification('Profile updated successfully!');
        }
    });

    // Event Listeners
    profileLink.addEventListener('click', function(e) {
        e.preventDefault();
        showProfilePage();
        // Close dropdown if open
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.remove('active');
    });

    profileCloseBtn.addEventListener('click', hideProfilePage);

    // Close modal when clicking outside
    editProfileModal.addEventListener('click', function(e) {
        if (e.target === editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    });

    // Utility function to show notifications
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Unbounded', sans-serif;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Check if user is logged in and update UI accordingly
    function updateAuthUI() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userIconWrapper = document.querySelector('.user-icon-wrapper');
        
        if (currentUser) {
            userIconWrapper.classList.add('logged-in');
        } else {
            userIconWrapper.classList.remove('logged-in');
        }
    }

    // Initialize
    updateAuthUI();
});

