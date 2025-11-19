let currentDiscount = 0;
let originalTotal = 0;

function initCheckoutPage() {
    updateOrderSummary();
    setupCheckoutEventListeners();
    updateUserInterface();
    
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateUserInterface();
    });
}

function updateUserInterface() {
    const emailInput = document.getElementById('email');
    const loginBtnCheckout = document.getElementById('loginBtnCheckout');
    
    if (currentUser) {
        // User is logged in - auto-fill email and disable it
        if (emailInput) {
            emailInput.value = currentUser.email;
            emailInput.disabled = true;
            emailInput.style.backgroundColor = '#f5f5f5';
            emailInput.style.color = '#666';
            emailInput.style.cursor = 'not-allowed';
        }
        
        // Change button to Logout - text only changes, no background
        if (loginBtnCheckout) {
            loginBtnCheckout.textContent = 'LOGOUT';
            loginBtnCheckout.style.backgroundColor = 'transparent';
            loginBtnCheckout.style.color = '#e74c3c'; // Red color for logout
            loginBtnCheckout.style.textDecoration = 'none';
            loginBtnCheckout.style.fontFamily = "'Unbounded', sans-serif";
            loginBtnCheckout.style.fontWeight = '600';
            loginBtnCheckout.style.textTransform = 'uppercase';
            loginBtnCheckout.style.border = 'none';
            loginBtnCheckout.style.cursor = 'pointer';
            loginBtnCheckout.style.fontSize = '14px';
            loginBtnCheckout.style.padding = '0';
            loginBtnCheckout.style.margin = '0';
        }
        
        // Try to load user's saved addresses if available
        loadUserAddresses();
        
    } else {
        // User is not logged in
        if (emailInput) {
            emailInput.value = '';
            emailInput.disabled = false;
            emailInput.style.backgroundColor = '';
            emailInput.style.color = '';
            emailInput.style.cursor = '';
        }
        
        if (loginBtnCheckout) {
            loginBtnCheckout.textContent = 'LOGIN';
            loginBtnCheckout.style.backgroundColor = 'transparent';
            loginBtnCheckout.style.color = '#3498db'; // Blue color for login
            loginBtnCheckout.style.textDecoration = 'none';
            loginBtnCheckout.style.fontFamily = "'Unbounded', sans-serif";
            loginBtnCheckout.style.fontWeight = '600';
            loginBtnCheckout.style.textTransform = 'uppercase';
            loginBtnCheckout.style.border = 'none';
            loginBtnCheckout.style.cursor = 'pointer';
            loginBtnCheckout.style.fontSize = '14px';
            loginBtnCheckout.style.padding = '0';
            loginBtnCheckout.style.margin = '0';
        }
    }
}

function loadUserAddresses() {
    if (!currentUser || !db) return;
    
    // Load user's default/saved addresses from Firestore
    db.collection('users').doc(currentUser.uid).collection('addresses').where('isDefault', '==', true)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const defaultAddress = querySnapshot.docs[0].data();
                fillAddressForm(defaultAddress);
            }
        })
        .catch((error) => {
            console.error("Error loading user addresses:", error);
        });
}

function fillAddressForm(address) {
    if (address.firstName) document.getElementById('firstName').value = address.firstName;
    if (address.lastName) document.getElementById('lastName').value = address.lastName;
    if (address.address) document.getElementById('address').value = address.address;
    if (address.city) document.getElementById('city').value = address.city;
    if (address.state) document.getElementById('state').value = address.state;
    if (address.zipCode) document.getElementById('zipCode').value = address.zipCode;
    if (address.phone) document.getElementById('phone').value = address.phone;
}

function setupCheckoutEventListeners() {
    const loginBtnCheckout = document.getElementById('loginBtnCheckout');
    const applyBtn = document.querySelector('.apply-btn');
    const checkoutBtnMain = document.querySelector('.checkout-btn');
    const promoInput = document.querySelector('.promo-input');

    if (loginBtnCheckout) {
        loginBtnCheckout.addEventListener('click', function() {
            if (currentUser) {
                // User is logged in - show logout confirmation
                if (confirm('Are you sure you want to logout?')) {
                    auth.signOut().then(() => {
                        window.location.reload();
                    }).catch((error) => {
                        console.error("Error signing out:", error);
                    });
                }
            } else {
                // User is not logged in - show login modal
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

    // Quantity controls
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-btn-checkout')) {
            handleCheckoutQuantityChange(e);
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

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    field.classList.remove('error');
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    if (field.id === 'phone' && value) {
        if (!validateIndianPhoneNumber(value)) {
            showFieldError(field, 'Please enter a valid 10-digit Indian phone number');
            return false;
        }
    }
    
    if (field.id === 'zipCode' && value) {
        const zipRegex = /^\d{6}$/;
        if (!zipRegex.test(value)) {
            showFieldError(field, 'Please enter a valid 6-digit PIN code');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '5px';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

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
                                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="order-item-image-fallback" style="display: none;">
                                    <i class="fas fa-jar"></i>
                                </div>
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
                                    <span>Quantity: ${item.quantity}</span>
                                </div>
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
    } else {
        discountRow.style.display = 'none';
    }
    
    totalElement.textContent = `₹${newTotal}`;
}

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

function getActivePromoCodes() {
    const promoCodes = localStorage.getItem('naturaPromoCodes');
    return promoCodes ? JSON.parse(promoCodes) : {};
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
    const productId = parseInt(e.target.getAttribute('data-id'));
    const newQuantity = parseInt(e.target.value) || 1;
    
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

function validateCheckoutForm() {
    const requiredFields = [
        'email', 'firstName', 'lastName', 'address', 
        'city', 'state', 'zipCode', 'phone'
    ];
    
    let isValid = true;
    
    // Clear all errors first
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
    
    // Validate each required field
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // Validate cart
    if (cartProducts.length === 0) {
        alert('Your cart is empty. Please add items to proceed.');
        isValid = false;
    }
    
    return isValid;
}

function processCheckout() {
    if (!validateCheckoutForm()) {
        return;
    }
    
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
    
    if (currentUser) {
        orderData.userId = currentUser.uid;
        orderData.userEmail = currentUser.email;
        saveOrderToFirestore(orderData);
    } else {
        saveGuestOrder(orderData);
    }
    
    processPayment(orderData);
}

function saveOrderToFirestore(orderData) {
    if (!db) {
        alert('Database connection error. Please try again.');
        return;
    }
    
    db.collection('orders').add(orderData)
        .then((docRef) => {
            orderData.id = docRef.id;
            
            if (currentUser) {
                db.collection('users').doc(currentUser.uid).collection('orders').doc(docRef.id).set(orderData)
                    .then(() => {
                        clearCartAfterOrder();
                    })
                    .catch((error) => {
                        console.error("Error saving to user orders:", error);
                    });
            }
            
            console.log('Order created successfully:', docRef.id);
        })
        .catch((error) => {
            console.error("Error creating order:", error);
            alert('Error creating order. Please try again.');
        });
}

function saveGuestOrder(orderData) {
    const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
    orderData.id = 'guest_' + Date.now();
    guestOrders.push(orderData);
    localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
    
    clearCartAfterOrder();
}

function clearCartAfterOrder() {
    if (currentUser) {
        cartProducts.forEach(item => {
            db.collection('users').doc(currentUser.uid).collection('cart').doc(item.id.toString()).delete()
            .catch((error) => {
                console.error("Error clearing cart:", error);
            });
        });
    }
    
    localStorage.removeItem('guestCart');
    
    cartProducts = [];
    updateCartUI();
    updateOrderSummary();
}

function processPayment(orderData) {
    // Show processing message
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    checkoutBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        if (currentUser && orderData.id && db) {
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
                
                showOrderSuccess(orderData);
            })
            .catch((error) => {
                console.error("Error updating order status:", error);
                checkoutBtn.innerHTML = originalText;
                checkoutBtn.disabled = false;
                alert('Payment processing error. Please try again.');
            });
        } else {
            const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
            const orderIndex = guestOrders.findIndex(order => order.id === orderData.id);
            if (orderIndex !== -1) {
                guestOrders[orderIndex].status = 'confirmed';
                guestOrders[orderIndex].paymentStatus = 'paid';
                guestOrders[orderIndex].paidAt = new Date().toISOString();
                localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
                
                showOrderSuccess(orderData);
            }
        }
    }, 2000);
}

function showOrderSuccess(orderData) {
    alert(`Order confirmed successfully! Order ID: ${orderData.id.substring(0, 8)}\n\nThank you for your purchase. You will receive an email confirmation shortly.`);
    
    // Redirect to home page or order confirmation page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

// Add this CSS for error states and image styling
const style = document.createElement('style');
style.textContent = `
    .checkout-form input.error,
    .checkout-form select.error {
        border-color: #e74c3c !important;
        background-color: #fffafa !important;
    }
    
    .field-error {
        color: #e74c3c;
        font-size: 12px;
        margin-top: 5px;
        font-family: 'Unbounded', sans-serif;
    }
    
    #email:disabled {
        background-color: #f5f5f5 !important;
        color: #666 !important;
        cursor: not-allowed !important;
    }
    
    .login-btn {
        background: transparent !important;
        border: none !important;
        font-family: 'Unbounded', sans-serif !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        text-decoration: none !important;
        cursor: pointer !important;
        font-size: 14px !important;
        padding: 0 !important;
        margin: 0 !important;
        transition: color 0.3s ease !important;
    }
    
    .order-item-image {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        position: relative;
    }
    
    .order-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .order-item-image-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .order-item-image-fallback i {
        font-size: 20px;
    }
    
    .order-item-image-container {
        margin-right: 15px;
        flex-shrink: 0;
    }
    
    .order-item-main {
        display: flex;
        align-items: flex-start;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .order-item-content {
        flex: 1;
        min-width: 0;
    }
    
    .order-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
    }
    
    .order-item-info {
        flex: 1;
        min-width: 0;
    }
    
    .order-item-name {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
        font-size: 14px;
        line-height: 1.3;
    }
    
    .order-item-weight {
        color: #666;
        font-size: 12px;
    }
    
    .order-item-price {
        font-weight: 600;
        color: #2c5530;
        font-size: 14px;
        margin-left: 10px;
        flex-shrink: 0;
    }
    
    .order-item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .order-item-quantity {
        color: #666;
        font-size: 12px;
    }
    
    .empty-order {
        text-align: center;
        padding: 40px 20px;
        color: #777;
    }
    
    .empty-order i {
        font-size: 48px;
        margin-bottom: 15px;
        color: #e0e0e0;
    }
    
    .empty-order p {
        font-size: 16px;
    }
`;
document.head.appendChild(style);

// Override updateCartUI to also update checkout page
if (typeof updateCartUI !== 'undefined') {
    const originalUpdateCartUI = updateCartUI;
    updateCartUI = function() {
        originalUpdateCartUI();
        if (typeof updateOrderSummary === 'function') {
            updateOrderSummary();
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.checkout-section')) {
        initCheckoutPage();
    }
});
