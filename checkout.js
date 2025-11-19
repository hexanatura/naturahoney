// Checkout page JavaScript
let cartProducts = [];
let currentDiscount = 0;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page loaded');
    loadCart();
    updateOrderSummary();
    setupEventListeners();
    checkUserAuth();
});

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('guestCart');
    cartProducts = savedCart ? JSON.parse(savedCart) : [];
    console.log('Cart loaded:', cartProducts);
}

// Check user authentication
function checkUserAuth() {
    const emailInput = document.getElementById('email');
    const loginBtn = document.getElementById('loginBtnCheckout');
    
    if (typeof auth !== 'undefined' && auth.currentUser) {
        // User is logged in
        emailInput.value = auth.currentUser.email;
        emailInput.disabled = true;
        emailInput.style.backgroundColor = '#f5f5f5';
        loginBtn.textContent = 'LOGOUT';
        loginBtn.style.color = '#e74c3c';
        
        // Load user addresses
        loadUserAddresses(auth.currentUser.uid);
    } else {
        // User is not logged in
        loginBtn.textContent = 'LOGIN';
        loginBtn.style.color = '#3498db';
    }
}

// Load user addresses
function loadUserAddresses(userId) {
    if (!db) return;
    
    db.collection('users').doc(userId).collection('addresses')
        .where('isDefault', '==', true)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const address = querySnapshot.docs[0].data();
                fillAddressForm(address);
            }
        })
        .catch((error) => {
            console.error('Error loading addresses:', error);
        });
}

// Fill address form with user data
function fillAddressForm(address) {
    if (address.name) {
        const nameParts = address.name.split(' ');
        document.getElementById('firstName').value = nameParts[0] || '';
        document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
    }
    if (address.address) document.getElementById('address').value = address.address;
    if (address.pincode) document.getElementById('zipCode').value = address.pincode;
    if (address.phone) document.getElementById('phone').value = address.phone;
}

// Setup event listeners
function setupEventListeners() {
    const loginBtn = document.getElementById('loginBtnCheckout');
    const applyBtn = document.querySelector('.apply-btn');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const promoInput = document.querySelector('.promo-input');

    // Login/Logout button
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (typeof auth !== 'undefined' && auth.currentUser) {
                // Logout
                if (confirm('Are you sure you want to logout?')) {
                    auth.signOut();
                }
            } else {
                // Show login modal
                showLoginModal();
            }
        });
    }

    // Apply promo code
    if (applyBtn) {
        applyBtn.addEventListener('click', applyPromoCode);
    }
    
    // Enter key for promo code
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') applyPromoCode();
        });
    }

    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }

    // Quantity controls
    document.addEventListener('click', function(e) {
        if (e.target.closest('.quantity-btn-checkout')) {
            handleQuantityChange(e);
        }
    });
}

// Show login modal
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const overlay = document.getElementById('overlay');
    
    if (loginModal && overlay) {
        loginModal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Update order summary
function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const summarySection = document.querySelector('.order-summary-details');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const securityNotice = document.querySelector('.security-notice');
    
    if (!orderItems) return;

    orderItems.innerHTML = '';
    
    if (cartProducts.length === 0) {
        // Show empty cart
        orderItems.innerHTML = `
            <div class="empty-order" style="text-align: center; padding: 40px 20px; color: #777;">
                <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 15px; color: #e0e0e0;"></i>
                <h3 style="font-size: 18px; margin-bottom: 10px; color: #5f2b27;">Your cart is empty</h3>
                <p style="font-size: 14px; margin-bottom: 20px;">Add some delicious honey products to get started</p>
                <a href="shop.html" class="continue-shopping" style="display: inline-block; margin-top: 15px;">
                    <i class="fas fa-arrow-left"></i> Continue Shopping
                </a>
            </div>
        `;
        
        if (summarySection) summarySection.style.display = 'none';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        if (securityNotice) securityNotice.style.display = 'none';
        
    } else {
        // Show cart items
        let subtotal = 0;
        
        cartProducts.forEach(item => {
            const product = getProductById(item.id);
            if (product) {
                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;
                
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <div class="order-item-main">
                        <div class="order-item-image-container">
                            <div class="order-item-image">
                                <img src="${product.image}" alt="${product.name}" 
                                     onerror="this.src='https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(8)%20(1).png?updatedAt=1756876605119'"
                                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
                            </div>
                        </div>
                        <div class="order-item-content">
                            <div class="order-item-header">
                                <div class="order-item-info">
                                    <div class="order-item-name">${product.name}</div>
                                    <div class="order-item-weight">${product.weight}</div>
                                </div>
                                <div class="order-item-price">₹${itemTotal}</div>
                            </div>
                            <div class="order-item-footer">
                                <div class="order-item-quantity-controls">
                                    <button class="quantity-btn-checkout" data-action="decrease" data-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <input type="number" class="quantity-input-checkout" value="${item.quantity}" min="1" data-id="${item.id}">
                                    <button class="quantity-btn-checkout" data-action="increase" data-id="${item.id}">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                orderItems.appendChild(orderItem);
            }
        });

        // Show summary section
        if (summarySection) summarySection.style.display = 'block';
        if (checkoutBtn) checkoutBtn.style.display = 'block';
        if (securityNotice) securityNotice.style.display = 'flex';
        
        updateTotals(subtotal);
    }
}

// Get product by ID
function getProductById(id) {
    const products = [
        { id: 1, name: "Natura Agmark Honey", price: 249, weight: "1Kg", image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_gyalrfgyalrfgyal.jpg" },
        { id: 2, name: "Natura Agmark Honey", price: 449, weight: "500g", image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_i8jo3di8jo3di8jo.jpg" },
        { id: 3, name: "Natura Agmark Honey", price: 149, weight: "100g", image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_imbwdcimbwdcimbw.jpg" },
        { id: 4, name: "Natura Agmark Honey", price: 349, weight: "50g", image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_i8jo3di8jo3di8jo4.jpg" },
        { id: 5, name: "Natura Agmark Honey", price: 199, weight: "1Kg", image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_84o9o484o9o484o9.jpg" },
        { id: 6, name: "Natura Agmark Honey - Premium Pet", price: 329, weight: "500g", image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_cbat36cbat36cbat.jpg" }
    ];
    return products.find(p => p.id === id);
}

// Update totals
function updateTotals(subtotal) {
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('discountAmount');
    
    if (!subtotalEl || !totalEl) return;
    
    const shipping = subtotal >= 599 ? 0 : 50;
    const total = subtotal + shipping - currentDiscount;
    
    subtotalEl.textContent = `₹${subtotal}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    
    if (currentDiscount > 0) {
        discountRow.style.display = 'flex';
        discountAmount.textContent = `-₹${currentDiscount}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    totalEl.textContent = `₹${total}`;
}

// Handle quantity changes
function handleQuantityChange(e) {
    const button = e.target.closest('.quantity-btn-checkout');
    const productId = parseInt(button.getAttribute('data-id'));
    const action = button.getAttribute('data-action');
    
    const item = cartProducts.find(item => item.id === productId);
    if (!item) return;
    
    if (action === 'decrease') {
        item.quantity--;
        if (item.quantity <= 0) {
            cartProducts = cartProducts.filter(i => i.id !== productId);
        }
    } else if (action === 'increase') {
        item.quantity++;
    }
    
    saveCart();
    updateOrderSummary();
}

// Apply promo code
function applyPromoCode() {
    const promoInput = document.querySelector('.promo-input');
    const promoSuccess = document.getElementById('promoSuccess');
    const promoError = document.getElementById('promoError');
    
    if (!promoInput) return;
    
    const code = promoInput.value.trim().toUpperCase();
    
    if (code === 'WELCOME10') {
        currentDiscount = 50; // ₹50 discount
        updateOrderSummary();
        promoInput.value = '';
        
        if (promoSuccess) {
            promoSuccess.textContent = 'Promo code applied! ₹50 discount added.';
            promoSuccess.style.display = 'block';
            if (promoError) promoError.style.display = 'none';
        }
    } else if (code) {
        if (promoError) {
            promoError.textContent = 'Invalid promo code. Try WELCOME10 for ₹50 off.';
            promoError.style.display = 'block';
            if (promoSuccess) promoSuccess.style.display = 'none';
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('guestCart', JSON.stringify(cartProducts));
}

// Process checkout
function processCheckout() {
    // Basic validation
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const phone = document.getElementById('phone').value;
    
    if (!email || !firstName || !phone) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (cartProducts.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Show processing
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    checkoutBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        alert('Order placed successfully! Thank you for your purchase.');
        clearCart();
        window.location.href = 'index.html';
    }, 2000);
}

// Clear cart after order
function clearCart() {
    cartProducts = [];
    localStorage.removeItem('guestCart');
}

// Listen for auth state changes
if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged((user) => {
        checkUserAuth();
    });
}
