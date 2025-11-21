// Checkout specific variables
let currentDiscount = 0;
let originalTotal = 0;
let appliedPromoCode = null;

// Initialize checkout page
function initCheckoutPage() {
    updateOrderSummary();
    setupCheckoutEventListeners();
    updateCheckoutUI();
}

// Update order summary with cart items - ENHANCED with real-time updates
function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    if (!orderItems) return;
    
    orderItems.innerHTML = '';
    let subtotal = 0;
    
    if (cartProducts.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-order';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '40px 20px';
        emptyMessage.style.color = '#777';
        emptyMessage.innerHTML = `
            <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 15px; color: #e0e0e0;"></i>
            <p style="font-size: 16px;">Your cart is empty</p>
        `;
        orderItems.appendChild(emptyMessage);
    } else {
        cartProducts.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;
                
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <div class="order-item-main">
                        <div class="order-item-image-container">
                            <div class="order-item-image">
                                <img src="${product.image || 'https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(8)%20(1).png?updatedAt=1756876605119'}" alt="${product.name}" onerror="this.src='https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(8)%20(1).png?updatedAt=1756876605119'">
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
                                    <input type="number" class="quantity-input-checkout" value="${item.quantity}" min="1" max="10" data-id="${item.id}">
                                    <button class="quantity-btn-checkout" data-action="increase" data-id="${item.id}">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <button class="remove-item-checkout" data-id="${item.id}">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                orderItems.appendChild(orderItem);
            }
        });
    }
    
    originalTotal = subtotal;
    updateTotals();
}

// Update totals including discount
function updateTotals() {
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('discountAmount');
    
    if (!subtotalElement || !totalElement || !discountRow || !discountAmount) return;
    
    const newTotal = originalTotal - currentDiscount;
    
    subtotalElement.textContent = `₹${originalTotal}`;
    
    if (currentDiscount > 0) {
        discountRow.style.display = 'flex';
        discountAmount.textContent = `-₹${currentDiscount}`;
        discountAmount.style.color = '#27ae60';
    } else {
        discountRow.style.display = 'none';
    }
    
    totalElement.textContent = `₹${newTotal}`;
    
    // Update checkout button state
    const checkoutBtnMain = document.querySelector('.checkout-btn');
    if (checkoutBtnMain) {
        checkoutBtnMain.disabled = cartProducts.length === 0;
        checkoutBtnMain.style.opacity = cartProducts.length === 0 ? '0.6' : '1';
        checkoutBtnMain.style.cursor = cartProducts.length === 0 ? 'not-allowed' : 'pointer';
    }
}

// Setup event listeners for checkout page - ENHANCED
function setupCheckoutEventListeners() {
    const loginBtnCheckout = document.getElementById('loginBtnCheckout');
    const applyBtn = document.querySelector('.apply-btn');
    const checkoutBtnMain = document.querySelector('.checkout-btn');
    const promoInput = document.querySelector('.promo-input');

    if (loginBtnCheckout) {
        loginBtnCheckout.addEventListener('click', function() {
            if (currentUser) {
                if (confirm('Are you sure you want to logout?')) {
                    auth.signOut().then(() => {
                        window.location.reload();
                    }).catch((error) => {
                        console.error("Error signing out:", error);
                    });
                }
            } else {
                showLoginView();
                loginModal.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', applyPromoCode);
    }

    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });
    }

    if (checkoutBtnMain) {
        checkoutBtnMain.addEventListener('click', processCheckout);
    }

    // Enhanced quantity controls with instant updates
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.quantity-btn-checkout');
        if (button) {
            handleCheckoutQuantityChange(e);
        }
        
        // Handle remove item from checkout
        const removeBtn = e.target.closest('.remove-item-checkout');
        if (removeBtn) {
            handleRemoveFromCheckout(e);
        }
    });

    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input-checkout')) {
            handleCheckoutQuantityInput(e);
        }
    });

    // Form validation
    const formInputs = document.querySelectorAll('.checkout-form input, .checkout-form select');
    formInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Handle quantity change in checkout - INSTANT UPDATE
function handleCheckoutQuantityChange(e) {
    const button = e.target.closest('.quantity-btn-checkout');
    if (!button) return;
    
    const productId = parseInt(button.getAttribute('data-id'));
    const action = button.getAttribute('data-action');
    
    if (action === 'decrease') {
        updateCartQuantity(productId, -1);
    } else if (action === 'increase') {
        updateCartQuantity(productId, 1);
    }
    
    // INSTANT UPDATE: Refresh order summary immediately
    updateOrderSummary();
    updateCartUI();
    
    // Save changes to localStorage
    localStorage.setItem('guestCart', JSON.stringify(cartProducts));
}

// Handle quantity input in checkout - INSTANT UPDATE
function handleCheckoutQuantityInput(e) {
    const input = e.target;
    const productId = parseInt(input.getAttribute('data-id'));
    const newQuantity = parseInt(input.value) || 1;
    
    setCartQuantity(productId, newQuantity);
    
    // INSTANT UPDATE: Refresh order summary immediately
    updateOrderSummary();
    updateCartUI();
    
    // Save changes to localStorage
    localStorage.setItem('guestCart', JSON.stringify(cartProducts));
}

// Handle remove item from checkout - INSTANT UPDATE
function handleRemoveFromCheckout(e) {
    const removeBtn = e.target.closest('.remove-item-checkout');
    if (!removeBtn) return;
    
    const productId = parseInt(removeBtn.getAttribute('data-id'));
    
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        removeFromCart(productId);
        
        // INSTANT UPDATE: Refresh order summary immediately
        updateOrderSummary();
        updateCartUI();
        
        // Save changes to localStorage
        localStorage.setItem('guestCart', JSON.stringify(cartProducts));
        
        // Show notification
        showCheckoutNotification('Item removed from cart', 'success');
    }
}

// Enhanced cart functions for checkout page
function updateCartQuantity(productId, change) {
    const item = cartProducts.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        }
    }
}

function setCartQuantity(productId, quantity) {
    const item = cartProducts.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
        }
    }
}

function removeFromCart(productId) {
    cartProducts = cartProducts.filter(item => item.id !== productId);
}

// Show notification for checkout actions
function showCheckoutNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `checkout-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        font-family: 'Unbounded', sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
if (!document.querySelector('#checkout-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'checkout-notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Apply promo code with cart validation
function applyPromoCode() {
    const promoInput = document.querySelector('.promo-input');
    const promoSuccess = document.getElementById('promoSuccess');
    const promoError = document.getElementById('promoError');
    
    if (!promoInput || !promoSuccess || !promoError) return;
    
    const promoCode = promoInput.value.trim().toUpperCase();
    
    if (promoCode === '') {
        showPromoError('Please enter a promo code');
        return;
    }
    
    if (cartProducts.length === 0) {
        showPromoError('Please add items to cart before applying promo code');
        return;
    }
    
    hideAllPromoMessages();
    
    const activePromoCodes = getActivePromoCodes();
    
    if (activePromoCodes[promoCode] && activePromoCodes[promoCode].active) {
        currentDiscount = activePromoCodes[promoCode].value;
        appliedPromoCode = promoCode;
        updateTotals();
        promoInput.value = '';
        showPromoSuccess(`Promo code "${promoCode}" applied successfully! ₹${currentDiscount} discount applied.`);
    } else {
        showPromoError('Invalid promo code. Please try again.');
    }
}

// Get active promo codes
function getActivePromoCodes() {
    const promoCodes = {
        'WELCOME10': { value: 50, active: true, type: 'fixed' },
        'HONEY20': { value: 100, active: true, type: 'fixed' },
        'FIRSTORDER': { value: 75, active: true, type: 'fixed' }
    };
    
    return promoCodes;
}

// Show promo success message
function showPromoSuccess(message) {
    const promoSuccess = document.getElementById('promoSuccess');
    const promoError = document.getElementById('promoError');
    
    if (!promoSuccess || !promoError) return;
    
    promoSuccess.textContent = message;
    promoSuccess.style.display = 'block';
    promoError.style.display = 'none';
    
    setTimeout(() => {
        promoSuccess.style.display = 'none';
    }, 5000);
}

// Show promo error message
function showPromoError(message) {
    const promoSuccess = document.getElementById('promoSuccess');
    const promoError = document.getElementById('promoError');
    
    if (!promoSuccess || !promoError) return;
    
    promoError.textContent = message;
    promoError.style.display = 'block';
    promoSuccess.style.display = 'none';
    
    setTimeout(() => {
        promoError.style.display = 'none';
    }, 5000);
}

// Hide all promo messages
function hideAllPromoMessages() {
    const promoSuccess = document.getElementById('promoSuccess');
    const promoError = document.getElementById('promoError');
    
    if (promoSuccess) promoSuccess.style.display = 'none';
    if (promoError) promoError.style.display = 'none';
}

// Process checkout with enhanced validation
function processCheckout() {
    if (cartProducts.length === 0) {
        alert('Your cart is empty. Please add items to proceed.');
        return;
    }
    
    if (!validateCheckoutForm()) {
        return;
    }
    
    // Continue with checkout process...
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const apartment = document.getElementById('apartment').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zipCode = document.getElementById('zipCode').value;
    const phone = document.getElementById('phone').value;

    const orderData = {
        email: email,
        shippingAddress: {
            firstName: firstName,
            lastName: lastName,
            address: address,
            apartment: apartment,
            city: city,
            state: state,
            zipCode: zipCode,
            phone: '+91 ' + phone,
            country: 'India'
        },
        items: cartProducts.map(item => {
            const product = products.find(p => p.id === item.id);
            return {
                productId: item.id,
                name: product ? product.name : 'Unknown Product',
                weight: product ? product.weight : '',
                price: product ? product.price : 0,
                quantity: item.quantity,
                image: product ? product.image : ''
            };
        }),
        subtotal: originalTotal,
        discount: currentDiscount,
        total: originalTotal - currentDiscount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentMethod: 'razorpay'
    };
    
    if (appliedPromoCode) {
        orderData.promoCode = appliedPromoCode;
    }
    
    if (currentUser) {
        orderData.userId = currentUser.uid;
        orderData.userEmail = currentUser.email;
        saveOrderToFirestore(orderData);
    } else {
        saveGuestOrder(orderData);
    }
    
    processPayment(orderData);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load cart data from localStorage
    const guestCart = localStorage.getItem('guestCart');
    if (guestCart) {
        cartProducts = JSON.parse(guestCart);
    }
    
    // Initialize checkout page if on checkout page
    if (document.querySelector('.checkout-section')) {
        initCheckoutPage();
    }
});
