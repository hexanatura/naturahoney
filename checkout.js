// checkout.js - Checkout Page Specific JavaScript

// Checkout page specific variables
let currentDiscount = 0;
let originalTotal = 0;

// Checkout page DOM elements
const loginBtnCheckout = document.getElementById('loginBtnCheckout');
const emailInput = document.getElementById('email');
const orderItems = document.getElementById('orderItems');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const discountRow = document.getElementById('discountRow');
const discountAmount = document.getElementById('discountAmount');
const applyBtn = document.querySelector('.apply-btn');
const promoInput = document.querySelector('.promo-input');
const promoSuccess = document.getElementById('promoSuccess');
const promoError = document.getElementById('promoError');
const checkoutBtnMain = document.querySelector('.checkout-btn');

// Initialize checkout page
function initCheckoutPage() {
    updateOrderSummary();
    setupCheckoutEventListeners();
    
    // Update email field based on login status
    if (currentUser) {
        emailInput.value = currentUser.email;
        emailInput.disabled = true;
        loginBtnCheckout.textContent = 'Logout';
    } else {
        emailInput.disabled = false;
        loginBtnCheckout.textContent = 'Login';
    }
}

// Setup checkout specific event listeners
function setupCheckoutEventListeners() {
    // Login/logout button in checkout
    loginBtnCheckout.addEventListener('click', function() {
        if (currentUser) {
            auth.signOut().then(() => {
                isLoggedIn = false;
                userEmail = '';
                loginBtnCheckout.textContent = 'Login';
                emailInput.disabled = false;
                emailInput.value = '';
                emailInput.placeholder = 'your@email.com';
                alert('You have been logged out successfully!');
            }).catch((error) => {
                console.error("Error signing out:", error);
            });
        } else {
            showLoginView();
            loginModal.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    // Promo code application
    applyBtn.addEventListener('click', applyPromoCode);

    // Main checkout button
    checkoutBtnMain.addEventListener('click', processCheckout);

    // Quantity controls in checkout order summary
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn-checkout')) {
            handleCheckoutQuantityChange(e);
        }
    });

    // Quantity input changes in checkout
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input-checkout')) {
            handleCheckoutQuantityInput(e);
        }
    });
}

// Update order summary in checkout page
function updateOrderSummary() {
    orderItems.innerHTML = '';
    let subtotal = 0;
    
    if (cartProducts.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-order';
        emptyMessage.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <p>Your cart is empty</p>
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
                    <div class="order-item-row">
                        <img src="${product.image}" alt="${product.name}" class="order-item-image">
                        <div class="order-item-details">
                            <div class="order-item-name">${product.name}</div>
                            <div class="order-item-weight">${product.weight}</div>
                            <div class="order-item-quantity">
                                Quantity: 
                                <div class="quantity-controls">
                                    <button class="quantity-btn-checkout minus" data-id="${product.id}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                    <input type="text" class="quantity-input-checkout" value="${item.quantity}" data-id="${product.id}">
                                    <button class="quantity-btn-checkout plus" data-id="${product.id}">+</button>
                                </div>
                            </div>
                        </div>
                        <div class="order-item-price">₹${itemTotal}</div>
                    </div>
                `;
                orderItems.appendChild(orderItem);
            }
        });
    }
    
    originalTotal = subtotal;
    updateTotals();
}

// Update totals with discount
function updateTotals() {
    const newTotal = originalTotal - currentDiscount;
    
    subtotalElement.textContent = `₹${originalTotal}`;
    
    if (currentDiscount > 0) {
        discountRow.style.display = 'flex';
        discountAmount.textContent = `-₹${currentDiscount}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    totalElement.textContent = `₹${newTotal}`;
}

// Apply promo code
function applyPromoCode() {
    const promoCode = promoInput.value.trim().toUpperCase();
    
    if (promoCode === '') {
        showPromoError('Please enter a promo code');
        return;
    }
    
    hideAllPromoMessages();
    
    const activePromoCodes = getActivePromoCodes();
    
    if (activePromoCodes[promoCode] && activePromoCodes[promoCode].active) {
        currentDiscount = activePromoCodes[promoCode].value;
        updateTotals();
        promoInput.value = '';
        showPromoSuccess(`Promo code applied successfully! ₹${currentDiscount} discount applied.`);
    } else {
        showPromoError('Invalid promo code. Please try again.');
    }
}

// Get active promo codes from localStorage
function getActivePromoCodes() {
    const promoCodes = localStorage.getItem('naturaPromoCodes');
    return promoCodes ? JSON.parse(promoCodes) : {};
}

// Show promo success message
function showPromoSuccess(message) {
    promoSuccess.textContent = message;
    promoSuccess.style.display = 'block';
    promoError.style.display = 'none';
    
    setTimeout(() => {
        promoSuccess.style.display = 'none';
    }, 5000);
}

// Show promo error message
function showPromoError(message) {
    promoError.textContent = message;
    promoError.style.display = 'block';
    promoSuccess.style.display = 'none';
    
    setTimeout(() => {
        promoError.style.display = 'none';
    }, 5000);
}

// Hide all promo messages
function hideAllPromoMessages() {
    promoSuccess.style.display = 'none';
    promoError.style.display = 'none';
}

// Handle quantity changes in checkout
function handleCheckoutQuantityChange(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const isMinus = e.target.classList.contains('minus');
    
    if (isMinus) {
        updateCartQuantity(productId, -1);
    } else {
        updateCartQuantity(productId, 1);
    }
    
    updateOrderSummary();
}

// Handle quantity input changes in checkout
function handleCheckoutQuantityInput(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const newQuantity = parseInt(e.target.value) || 1;
    
    setCartQuantity(productId, newQuantity);
    updateOrderSummary();
}

// Validate Indian phone number
function validateIndianPhoneNumber(phone) {
    if (phone.startsWith('+91')) {
        phone = phone.replace('+91', '').trim();
    }

    const cleanedPhone = phone.replace(/\D/g, '');

    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(cleanedPhone);
}

// Process checkout
function processCheckout() {
    // Get form values
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zipCode = document.getElementById('zipCode').value;
    const phone = document.getElementById('phone').value;

    // Validate phone number
    if (!validateIndianPhoneNumber(phone)) {
        alert('Please enter a valid Indian phone number (10 digits starting with 6-9)');
        return;
    }      
    
    // Validate required fields
    if (!email || !firstName || !lastName || !address || !city || !state || !zipCode || !phone) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Validate cart has items
    if (cartProducts.length === 0) {
        alert('Your cart is empty. Please add items to proceed.');
        return;
    }
    
    // Create order data
    const orderData = {
        email: email,
        shippingAddress: {
            firstName: firstName,
            lastName: lastName,
            address: address,
            city: city,
            state: state,
            zipCode: zipCode,
            phone: phone,
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
    
    // If user is logged in, save to Firestore
    if (currentUser) {
        orderData.userId = currentUser.uid;
        saveOrderToFirestore(orderData);
    } else {
        // For guest users, save to localStorage
        saveGuestOrder(orderData);
    }
    
    // Process payment
    processPayment(orderData);
}

// Save order to Firestore
function saveOrderToFirestore(orderData) {
    db.collection('orders').add(orderData)
        .then((docRef) => {
            orderData.id = docRef.id;
            
            // Also save to user's orders collection if logged in
            if (currentUser) {
                db.collection('users').doc(currentUser.uid).collection('orders').doc(docRef.id).set(orderData)
                    .then(() => {
                        clearCartAfterOrder();
                    })
                    .catch((error) => {
                        console.error("Error saving to user orders:", error);
                    });
            }
            
            alert(`Order created successfully! Order ID: ${docRef.id.substring(0, 8)}`);
        })
        .catch((error) => {
            console.error("Error creating order:", error);
            alert('Error creating order. Please try again.');
        });
}

// Save guest order to localStorage
function saveGuestOrder(orderData) {
    const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
    orderData.id = 'guest_' + Date.now();
    guestOrders.push(orderData);
    localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
    
    clearCartAfterOrder();
}

// Clear cart after successful order
function clearCartAfterOrder() {
    // Clear cart from Firestore if user is logged in
    if (currentUser) {
        cartProducts.forEach(item => {
            db.collection('users').doc(currentUser.uid).collection('cart').doc(item.id.toString()).delete()
            .catch((error) => {
                console.error("Error clearing cart:", error);
            });
        });
    }
    
    // Clear cart from localStorage
    localStorage.removeItem('guestCart');
    
    // Reset cart state
    cartProducts = [];
    updateCartUI();
    updateOrderSummary();
}

// Process payment (simulated Razorpay integration)
function processPayment(orderData) {
    // In a real implementation, this would integrate with Razorpay API
    // For now, we'll simulate the payment process
    
    alert('Thank you for your order! You will be redirected to Razorpay to complete your payment.');
    
    // Simulate payment processing
    setTimeout(() => {
        // Update order status to confirmed
        if (currentUser && orderData.id) {
            db.collection('orders').doc(orderData.id).update({
                status: 'confirmed',
                paymentStatus: 'paid',
                paidAt: new Date().toISOString()
            })
            .then(() => {
                if (currentUser) {
                    db.collection('users').doc(currentUser.uid).collection('orders').doc(orderData.id).update({
                        status: 'confirmed',
                        paymentStatus: 'paid',
                        paidAt: new Date().toISOString()
                    });
                }
                
                alert('Payment successful! Your order has been confirmed.');
                // Redirect to order confirmation page
                // window.location.href = `order-confirmation.html?orderId=${orderData.id}`;
            })
            .catch((error) => {
                console.error("Error updating order status:", error);
            });
        } else {
            // For guest orders, update localStorage
            const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
            const orderIndex = guestOrders.findIndex(order => order.id === orderData.id);
            if (orderIndex !== -1) {
                guestOrders[orderIndex].status = 'confirmed';
                guestOrders[orderIndex].paymentStatus = 'paid';
                guestOrders[orderIndex].paidAt = new Date().toISOString();
                localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
                
                alert('Payment successful! Your order has been confirmed.');
            }
        }
    }, 2000);
}

// Override the global updateCartUI to also update checkout summary
const originalUpdateCartUI = updateCartUI;
updateCartUI = function() {
    originalUpdateCartUI();
    if (typeof updateOrderSummary === 'function') {
        updateOrderSummary();
    }
};

// Initialize checkout page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the checkout page
    if (document.querySelector('.checkout-section')) {
        initCheckoutPage();
    }
});
