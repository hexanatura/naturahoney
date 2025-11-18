let currentDiscount = 0;
let originalTotal = 0;
let isProcessingOrder = false;

function initCheckoutPage() {
    updateOrderSummary();
    setupCheckoutEventListeners();
    populateUserData();
    
    // Auto-hide notification bar after 5 seconds
    setTimeout(() => {
        toggleNotificationBar();
    }, 5000);
}

function populateUserData() {
    if (currentUser) {
        // Populate email field
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = currentUser.email;
            emailInput.disabled = true;
        }
        
        // Update login button text
        const loginBtnCheckout = document.getElementById('loginBtnCheckout');
        if (loginBtnCheckout) {
            loginBtnCheckout.textContent = 'Logout';
            loginBtnCheckout.title = 'Click to logout';
        }
        
        // Load user's saved addresses if available
        loadUserAddresses();
    } else {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.disabled = false;
        }
        
        const loginBtnCheckout = document.getElementById('loginBtnCheckout');
        if (loginBtnCheckout) {
            loginBtnCheckout.textContent = 'Login';
            loginBtnCheckout.title = 'Click to login';
        }
    }
}

function loadUserAddresses() {
    if (!currentUser || !db) return;
    
    db.collection('users').doc(currentUser.uid).collection('addresses').get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                // You can implement address selection here
                console.log('User addresses loaded:', querySnapshot.size);
            }
        })
        .catch((error) => {
            console.error("Error loading addresses:", error);
        });
}

function toggleNotificationBar() {
    const notificationBar = document.getElementById('notificationBar');
    if (notificationBar) {
        notificationBar.classList.toggle('hidden');
        
        // Update nav and content positioning
        updateLayoutAfterNotificationToggle();
    }
}

function updateLayoutAfterNotificationToggle() {
    const notificationBar = document.getElementById('notificationBar');
    const nav = document.getElementById('navBar');
    const contentWrapper = document.querySelector('.content-wrapper');
    
    if (notificationBar && nav && contentWrapper) {
        if (notificationBar.classList.contains('hidden')) {
            // Notification bar is hidden
            nav.style.top = '0';
            contentWrapper.style.marginTop = '120px';
        } else {
            // Notification bar is visible
            nav.style.top = '43px';
            contentWrapper.style.marginTop = '165px';
        }
    }
}

function setupCheckoutEventListeners() {
    const loginBtnCheckout = document.getElementById('loginBtnCheckout');
    const applyBtn = document.querySelector('.apply-btn');
    const checkoutBtnMain = document.querySelector('.checkout-btn');
    const promoInput = document.querySelector('.promo-input');

    // Login/Logout button
    if (loginBtnCheckout) {
        loginBtnCheckout.addEventListener('click', handleLoginLogout);
    }

    // Apply promo code button
    if (applyBtn) {
        applyBtn.addEventListener('click', applyPromoCode);
    }

    // Enter key for promo code
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });
    }

    // Checkout button
    if (checkoutBtnMain) {
        checkoutBtnMain.addEventListener('click', processCheckout);
    }

    // Quantity controls
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn-checkout')) {
            handleCheckoutQuantityChange(e);
        }
    });

    // Quantity input changes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input-checkout')) {
            handleCheckoutQuantityInput(e);
        }
    });

    // Input validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }

    // Real-time form validation
    setupFormValidation();
}

function handleLoginLogout() {
    if (currentUser) {
        // Logout
        if (confirm('Are you sure you want to logout?')) {
            auth.signOut().then(() => {
                window.location.reload();
            }).catch((error) => {
                console.error("Error signing out:", error);
                alert('Error logging out. Please try again.');
            });
        }
    } else {
        // Login
        showLoginView();
        loginModal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function setupFormValidation() {
    const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', validateField);
            field.addEventListener('input', clearFieldError);
        }
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific validations
    if (field.id === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    if (field.id === 'phone') {
        if (!validateIndianPhoneNumber(value)) {
            showFieldError(field, 'Please enter a valid Indian phone number');
            return false;
        }
    }
    
    if (field.id === 'zipCode') {
        const zipRegex = /^\d{6}$/;
        if (!zipRegex.test(value)) {
            showFieldError(field, 'Please enter a valid 6-digit PIN code');
            return false;
        }
    }
    
    clearFieldError({ target: field });
    return true;
}

function showFieldError(field, message) {
    clearFieldError({ target: field });
    
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
        font-family: 'Unbounded', sans-serif;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    e.target.value = value;
}

function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    if (!orderItems) return;
    
    orderItems.innerHTML = '';
    let subtotal = 0;
    
    if (cartProducts.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-order';
        emptyMessage.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #777;">
                <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 15px; color: #ddd;"></i>
                <p style="font-family: \'Unbounded\', sans-serif; margin: 0;">Your cart is empty</p>
                <a href="shop.html" style="display: inline-block; margin-top: 15px; color: #5f2b27; text-decoration: none;">
                    <i class="fas fa-arrow-left"></i> Continue Shopping
                </a>
            </div>
        `;
        orderItems.appendChild(emptyMessage);
        
        // Disable checkout button if cart is empty
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.6';
            checkoutBtn.style.cursor = 'not-allowed';
        }
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
                                <i class="fas fa-jar"></i>
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
                                <div class="order-item-quantity">
                                    <span>Quantity: </span>
                                    <div class="quantity-controls">
                                        <button class="quantity-btn-checkout minus" data-id="${product.id}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                        <input type="text" class="quantity-input-checkout" value="${item.quantity}" data-id="${product.id}" min="1" max="10">
                                        <button class="quantity-btn-checkout plus" data-id="${product.id}">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                orderItems.appendChild(orderItem);
            }
        });
        
        // Enable checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }
    }
    
    originalTotal = subtotal;
    updateTotals();
}

function updateTotals() {
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('discountAmount');
    
    if (!subtotalElement || !totalElement || !discountRow || !discountAmount) return;
    
    const newTotal = Math.max(0, originalTotal - currentDiscount);
    
    subtotalElement.textContent = `₹${originalTotal.toLocaleString()}`;
    
    if (currentDiscount > 0) {
        discountRow.style.display = 'flex';
        discountAmount.textContent = `-₹${currentDiscount.toLocaleString()}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    totalElement.textContent = `₹${newTotal.toLocaleString()}`;
    
    // Update checkout button text with total
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.innerHTML = `<i class="fas fa-lock"></i> Pay Now - ₹${newTotal.toLocaleString()}`;
    }
}

function applyPromoCode() {
    if (isProcessingOrder) return;
    
    const promoInput = document.querySelector('.promo-input');
    const promoSuccess = document.getElementById('promoSuccess');
    const promoError = document.getElementById('promoError');
    const applyBtn = document.querySelector('.apply-btn');
    
    if (!promoInput || !promoSuccess || !promoError || !applyBtn) return;
    
    const promoCode = promoInput.value.trim().toUpperCase();
    
    if (promoCode === '') {
        showPromoError('Please enter a promo code');
        return;
    }
    
    if (cartProducts.length === 0) {
        showPromoError('Add items to cart to apply promo code');
        return;
    }
    
    // Show loading state
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    applyBtn.disabled = true;
    
    hideAllPromoMessages();
    
    // Simulate API call delay
    setTimeout(() => {
        const activePromoCodes = getActivePromoCodes();
        
        if (activePromoCodes[promoCode] && activePromoCodes[promoCode].active) {
            const discount = activePromoCodes[promoCode].value;
            if (discount <= originalTotal) {
                currentDiscount = discount;
                updateTotals();
                promoInput.value = '';
                showPromoSuccess(`Promo code applied successfully! ₹${currentDiscount.toLocaleString()} discount applied.`);
            } else {
                showPromoError('Discount amount exceeds order total');
            }
        } else {
            showPromoError('Invalid or expired promo code');
        }
        
        // Reset button
        applyBtn.innerHTML = 'Apply';
        applyBtn.disabled = false;
    }, 1000);
}

function getActivePromoCodes() {
    // Default promo codes
    const defaultPromoCodes = {
        'WELCOME10': { value: 100, active: true, minOrder: 500 },
        'NATURA25': { value: 250, active: true, minOrder: 1000 },
        'HONEY50': { value: 500, active: true, minOrder: 2000 }
    };
    
    const storedPromoCodes = localStorage.getItem('naturaPromoCodes');
    return storedPromoCodes ? JSON.parse(storedPromoCodes) : defaultPromoCodes;
}

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

function hideAllPromoMessages() {
    const promoSuccess = document.getElementById('promoSuccess');
    const promoError = document.getElementById('promoError');
    
    if (promoSuccess) promoSuccess.style.display = 'none';
    if (promoError) promoError.style.display = 'none';
}

function handleCheckoutQuantityChange(e) {
    if (isProcessingOrder) return;
    
    const productId = parseInt(e.target.getAttribute('data-id'));
    const isMinus = e.target.classList.contains('minus');
    
    if (isMinus) {
        updateCartQuantity(productId, -1);
    } else {
        updateCartQuantity(productId, 1);
    }
    
    updateOrderSummary();
}

function handleCheckoutQuantityInput(e) {
    if (isProcessingOrder) return;
    
    const productId = parseInt(e.target.getAttribute('data-id'));
    let newQuantity = parseInt(e.target.value) || 1;
    
    // Validate quantity
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;
    
    setCartQuantity(productId, newQuantity);
    updateOrderSummary();
}

function validateIndianPhoneNumber(phone) {
    if (phone.startsWith('+91')) {
        phone = phone.replace('+91', '').trim();
    }

    const cleanedPhone = phone.replace(/\D/g, '');

    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(cleanedPhone);
}

function validateForm() {
    const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function processCheckout() {
    if (isProcessingOrder) return;
    
    if (cartProducts.length === 0) {
        alert('Your cart is empty. Please add items to proceed.');
        return;
    }
    
    if (!validateForm()) {
        alert('Please fix the errors in the form before proceeding.');
        return;
    }
    
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zipCode = document.getElementById('zipCode').value;
    const phone = document.getElementById('phone').value;
    const apartment = document.getElementById('apartment')?.value || '';

    if (!validateIndianPhoneNumber(phone)) {
        alert('Please enter a valid Indian phone number (10 digits starting with 6-9)');
        return;
    }
    
    isProcessingOrder = true;
    
    // Show loading state on checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalBtnText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    checkoutBtn.disabled = true;
    
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
        total: Math.max(0, originalTotal - currentDiscount),
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentMethod: 'razorpay',
        orderNumber: generateOrderNumber()
    };
    
    if (currentUser) {
        orderData.userId = currentUser.uid;
        orderData.userEmail = currentUser.email;
        saveOrderToFirestore(orderData);
    } else {
        saveGuestOrder(orderData);
    }
}

function generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `NAT${timestamp.slice(-6)}${random}`;
}

function saveOrderToFirestore(orderData) {
    if (!db) {
        alert('Database connection error. Please try again.');
        resetCheckoutButton();
        return;
    }
    
    db.collection('orders').add(orderData)
        .then((docRef) => {
            orderData.id = docRef.id;
            orderData.firestoreId = docRef.id;
            
            if (currentUser) {
                // Save to user's orders subcollection
                db.collection('users').doc(currentUser.uid).collection('orders').doc(docRef.id).set(orderData)
                    .then(() => {
                        processPayment(orderData);
                    })
                    .catch((error) => {
                        console.error("Error saving to user orders:", error);
                        processPayment(orderData); // Continue anyway
                    });
            } else {
                processPayment(orderData);
            }
        })
        .catch((error) => {
            console.error("Error creating order:", error);
            alert('Error creating order. Please try again.');
            resetCheckoutButton();
        });
}

function saveGuestOrder(orderData) {
    const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
    orderData.id = 'guest_' + Date.now();
    guestOrders.push(orderData);
    localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
    
    processPayment(orderData);
}

function processPayment(orderData) {
    // Show success message
    alert(`Order #${orderData.orderNumber} created successfully! You will be redirected to payment.`);
    
    // Simulate payment processing
    setTimeout(() => {
        if (currentUser && orderData.firestoreId) {
            // Update order status in Firestore
            db.collection('orders').doc(orderData.firestoreId).update({
                status: 'confirmed',
                paymentStatus: 'paid',
                paidAt: new Date().toISOString()
            })
            .then(() => {
                if (currentUser) {
                    db.collection('users').doc(currentUser.uid).collection('orders').doc(orderData.firestoreId).update({
                        status: 'confirmed',
                        paymentStatus: 'paid',
                        paidAt: new Date().toISOString()
                    });
                }
                
                completeOrderProcess(orderData);
            })
            .catch((error) => {
                console.error("Error updating order status:", error);
                completeOrderProcess(orderData); // Continue anyway
            });
        } else {
            // Update guest order
            const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
            const orderIndex = guestOrders.findIndex(order => order.id === orderData.id);
            if (orderIndex !== -1) {
                guestOrders[orderIndex].status = 'confirmed';
                guestOrders[orderIndex].paymentStatus = 'paid';
                guestOrders[orderIndex].paidAt = new Date().toISOString();
                localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
                
                completeOrderProcess(orderData);
            }
        }
    }, 2000);
}

function completeOrderProcess(orderData) {
    clearCartAfterOrder();
    
    // Show final success message
    alert(`Payment successful! Order #${orderData.orderNumber} has been confirmed.\n\nA confirmation email has been sent to ${orderData.email}`);
    
    // Redirect to order confirmation page or home page
    setTimeout(() => {
        window.location.href = 'index.html'; // or 'order-confirmation.html?id=' + orderData.id
    }, 1000);
}

function clearCartAfterOrder() {
    if (currentUser) {
        // Clear cart from Firestore
        cartProducts.forEach(item => {
            db.collection('users').doc(currentUser.uid).collection('cart').doc(item.id.toString()).delete()
            .catch((error) => {
                console.error("Error clearing cart item:", error);
            });
        });
    }
    
    // Clear local storage
    localStorage.removeItem('guestCart');
    
    // Reset cart
    cartProducts = [];
    updateCartUI();
    updateOrderSummary();
    
    // Reset processing state
    isProcessingOrder = false;
}

function resetCheckoutButton() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = `<i class="fas fa-lock"></i> Pay Now - ₹${Math.max(0, originalTotal - currentDiscount).toLocaleString()}`;
    }
    isProcessingOrder = false;
}

// Enhanced cart UI integration
if (typeof updateCartUI !== 'undefined') {
    const originalUpdateCartUI = updateCartUI;
    updateCartUI = function() {
        originalUpdateCartUI();
        if (typeof updateOrderSummary === 'function') {
            updateOrderSummary();
        }
    };
}

// Initialize checkout page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.checkout-section')) {
        initCheckoutPage();
    }
});

// Export functions for global access
window.toggleNotificationBar = toggleNotificationBar;
window.applyPromoCode = applyPromoCode;
