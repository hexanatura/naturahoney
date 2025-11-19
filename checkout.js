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
        if (e.target.classList.contains('quantity-btn-checkout') || e.target.closest('.quantity-btn-checkout')) {
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
    const button = e.target.closest('.quantity-btn-checkout');
    if (!button) return;
    
    const productId = parseInt(button.getAttribute('data-id'));
    const action = button.getAttribute('data-action');
    
    if (action === 'decrease') {
        updateCartQuantity(productId, -1);
    } else if (action === 'increase') {
        updateCartQuantity(productId, 1);
    }
    
    updateOrderSummary();
    updateCartUI(); // Also update cart sidebar if open
}

function handleCheckoutQuantityInput(e) {
    const input = e.target;
    const productId = parseInt(input.getAttribute('data-id'));
    const newQuantity = parseInt(input.value) || 1;
    
    setCartQuantity(productId, newQuantity);
    updateOrderSummary();
    updateCartUI(); // Also update cart sidebar if open
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

// Add this CSS for error states and quantity controls
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
    
    /* Product Images in Order Summary */
    .order-item-image {
        width: 70px;
        height: 70px;
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .order-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px;
    }
    
    /* Centered quantity controls */
    .order-item-quantity-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 8px;
        width: 100%;
    }
    
    .quantity-btn-checkout {
        background: #ffffff;
        border: 1px solid #5f2b27;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Unbounded', sans-serif;
        font-weight: 600;
        font-size: 12px;
        transition: all 0.2s ease;
        color: #5f2b27;
    }
    
    .quantity-btn-checkout:hover:not(:disabled) {
        background: #5f2b27;
        color: white;
        transform: scale(1.1);
    }
    
    .quantity-btn-checkout:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        border-color: #ccc;
        color: #ccc;
    }
    
    .quantity-btn-checkout:disabled:hover {
        background: #ffffff;
        color: #ccc;
        transform: none;
    }
    
    .quantity-input-checkout {
        width: 40px;
        height: 24px;
        text-align: center;
        border: 1px solid #e5e5e5;
        border-radius: 12px;
        background: #fafafa;
        font-family: 'Unbounded', sans-serif;
        font-weight: 600;
        font-size: 12px;
        padding: 0 4px;
    }
    
    .quantity-input-checkout:focus {
        border-color: #5f2b27;
        background: white;
        outline: none;
    }
    
    .quantity-input-checkout:invalid {
        border-color: #ff4444;
        background: #fffafa;
    }
    
    /* Mobile responsive adjustments */
    @media (max-width: 767px) {
        .order-item-image {
            width: 60px;
            height: 60px;
        }
        
        .quantity-btn-checkout {
            width: 22px;
            height: 22px;
        }
        
        .quantity-input-checkout {
            width: 35px;
            height: 22px;
            font-size: 11px;
        }
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

// Make sure cartProducts and products are available globally
if (typeof cartProducts === 'undefined') {
    var cartProducts = JSON.parse(localStorage.getItem('guestCart') || '[]');
}

if (typeof products === 'undefined') {
    var products = [
        {
            id: 1,
            name: "Wild Forest Honey",
            weight: "500g",
            price: 499,
            image: "https://ik.imagekit.io/hexaanatura/honey-jar-1.png"
        },
        {
            id: 2,
            name: "Organic Multiflora Honey",
            weight: "1kg",
            price: 899,
            image: "https://ik.imagekit.io/hexaanatura/honey-jar-2.png"
        }
        // Add more products as needed
    ];
}

// Cart management functions
function updateCartQuantity(productId, change) {
    const productIndex = cartProducts.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        cartProducts[productIndex].quantity += change;
        
        // Remove item if quantity becomes 0 or less
        if (cartProducts[productIndex].quantity <= 0) {
            cartProducts.splice(productIndex, 1);
        }
        
        // Save to localStorage or Firestore
        saveCart();
    }
}

function setCartQuantity(productId, quantity) {
    const productIndex = cartProducts.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        if (quantity <= 0) {
            cartProducts.splice(productIndex, 1);
        } else {
            cartProducts[productIndex].quantity = quantity;
        }
        
        // Save to localStorage or Firestore
        saveCart();
    }
}

function saveCart() {
    if (currentUser && db) {
        // Save to Firestore for logged-in users
        cartProducts.forEach(item => {
            db.collection('users').doc(currentUser.uid).collection('cart').doc(item.id.toString()).set({
                productId: item.id,
                quantity: item.quantity
            });
        });
    } else {
        // Save to localStorage for guest users
        localStorage.setItem('guestCart', JSON.stringify(cartProducts));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.checkout-section')) {
        initCheckoutPage();
    }
});
