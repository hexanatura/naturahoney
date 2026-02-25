let isProcessingPayment = false;
let razorpayScriptLoaded = false;

// Initialize checkout page
async function initCheckoutPage() {
    console.log('Initializing checkout page with Razorpay...');
    
    // Basic updates
    updateOrderSummary();
    setupCheckoutEventListeners();
    
    // Preload Razorpay script
    preloadRazorpayScript();
    
    // Load user's default address if logged in
    if (currentUser) {
        loadUserDefaultAddress();
    }
}

// Preload Razorpay script
function preloadRazorpayScript() {
    if (razorpayScriptLoaded || window.Razorpay) {
        return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
        console.log('Razorpay script preloaded');
        razorpayScriptLoaded = true;
    };
    script.onerror = () => {
        console.error('Failed to preload Razorpay script');
    };
    
    document.head.appendChild(script);
}

// Ensure Razorpay script is loaded
async function ensureRazorpayLoaded() {
    if (window.Razorpay) {
        return true;
    }
    
    if (razorpayScriptLoaded) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return !!window.Razorpay;
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            console.log('Razorpay script loaded');
            razorpayScriptLoaded = true;
            resolve(true);
        };
        script.onerror = () => {
            console.error('Failed to load Razorpay script');
            reject(new Error('Failed to load payment gateway'));
        };
        
        document.head.appendChild(script);
    });
}

// Load user's default address for auto-fill
function loadUserDefaultAddress() {
    if (!currentUser || !db) return;
    
    console.log('Loading default address for user:', currentUser.uid);
    
    // Unsubscribe from previous listener if exists
    if (window.addressUnsubscribe) {
        window.addressUnsubscribe();
    }
    
    // Set up real-time listener for default address changes
    window.addressUnsubscribe = db.collection('users').doc(currentUser.uid).collection('addresses')
        .where('isDefault', '==', true)
        .onSnapshot((querySnapshot) => {
            if (!querySnapshot.empty && querySnapshot.docs.length > 0) {
                const defaultAddress = querySnapshot.docs[0].data();
                console.log('Default address found:', defaultAddress);
                
                setTimeout(() => {
                    fillAddressForm(defaultAddress);
                }, 100);
            } else {
                console.log('No default address found for user');
                db.collection('users').doc(currentUser.uid).collection('addresses')
                    .orderBy('createdAt', 'desc')
                    .limit(1)
                    .get()
                    .then((addressSnapshot) => {
                        if (!addressSnapshot.empty && addressSnapshot.docs.length > 0) {
                            const recentAddress = addressSnapshot.docs[0].data();
                            console.log('Using most recent address:', recentAddress);
                            
                            setTimeout(() => {
                                fillAddressForm(recentAddress);
                            }, 100);
                        }
                    });
            }
        }, (error) => {
            console.error("Error in address listener:", error);
        });
}

function fillAddressForm(address) {
    console.log('Filling address form with:', address);
    
    if (address.name) {
        const nameParts = address.name.split(' ');
        if (nameParts.length > 1) {
            window.safeSetFormField('firstName', nameParts[0]);
            window.safeSetFormField('lastName', nameParts.slice(1).join(' '));
        } else {
            window.safeSetFormField('firstName', address.name);
        }
    }
    
    window.safeSetFormField('address', address.address);
    window.safeSetFormField('zipCode', address.pincode);
    
    if (address.city) {
        window.safeSetFormField('city', address.city);
    }
    
    if (address.state) {
        window.safeSetFormField('state', address.state);
    }
    
    const phoneField = document.getElementById('phone');
    if (phoneField && address.phone) {
        let phoneNumber = address.phone.toString().replace(/\+91/g, '').replace(/\D/g, '');
        
        if (phoneNumber.length > 10) {
            phoneNumber = phoneNumber.substring(phoneNumber.length - 10);
        }
        
        if (phoneNumber.length === 10 && /^[6-9]\d{9}$/.test(phoneNumber)) {
            phoneField.value = phoneNumber;
            console.log('Phone number autofilled:', phoneNumber);
        } else {
            console.log('Invalid phone number format:', address.phone);
            phoneField.value = '';
        }
    }
}

// Update order summary
function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    if (!orderItems) return;
    
    orderItems.innerHTML = '';
    let subtotal = 0;
    
    if (cartProducts.length === 0) {
        orderItems.innerHTML = `
            <div class="empty-order-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some delicious honey products to get started</p>
            </div>
        `;
        
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.cursor = 'not-allowed';
        }
        
        setTimeout(() => {
            showNotification('Your cart is empty! Redirecting to Home...', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        }, 1000);
        
        return;
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
                            <img src="${product.image}" alt="${product.name}" 
                                 class="order-product-img" 
                                 onerror="this.onerror=null;this.src='https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(8)%20(1).png?updatedAt=1756876605119'">
                        </div>
                        <div class="order-item-content">
                            <div class="order-item-header">
                                <div class="order-item-info">
                                    <div class="order-item-name">${product.name}</div>
                                    <div class="order-item-weight">${product.weight}</div>
                                </div>
                                <div class="order-item-price">₹${itemTotal.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                `;
                orderItems.appendChild(orderItem);
            }
        });
        
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }
    }
    
    // Calculate totals
    let shipping = 0;
    if (subtotal < 299) {
        shipping = 59;
    }
    
    window.originalTotal = subtotal + shipping;
    window.shippingCost = shipping;
    window.currentDiscount = 0;
    
    updateTotals();
}

function updateTotals() {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (!subtotalElement || !shippingElement || !totalElement) return;
    
    const subtotal = window.originalTotal - window.shippingCost;
    const shipping = window.shippingCost;
    const finalTotal = window.originalTotal - window.currentDiscount;
    
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    
    if (shipping > 0) {
        shippingElement.textContent = `₹${shipping.toFixed(2)}`;
        shippingElement.style.color = '#e74c3c';
    } else {
        shippingElement.textContent = 'FREE';
        shippingElement.style.color = '#27ae60';
    }
    
    totalElement.textContent = `₹${finalTotal.toFixed(2)}`;
}

// Validate checkout form
function validateCheckoutForm() {
    const requiredFields = [
        'email', 'firstName', 'lastName', 'address', 
        'city', 'state', 'zipCode', 'phone'
    ];
    
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
    
    // Validate required fields
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            const value = field.value.trim();
            if (!value) {
                field.classList.add('error');
                showFieldError(field, 'This field is required');
                isValid = false;
            }
            
            // Email validation
            if (fieldId === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    field.classList.add('error');
                    showFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                }
            }
            
            // Phone validation
            if (fieldId === 'phone' && value) {
                const phoneNumber = value.replace(/\D/g, '');
                if (phoneNumber.length !== 10 || !/^[6-9]\d{9}$/.test(phoneNumber)) {
                    field.classList.add('error');
                    showFieldError(field, 'Please enter a valid 10-digit phone number');
                    isValid = false;
                }
            }
            
            // PIN code validation
            if (fieldId === 'zipCode' && value) {
                const zipRegex = /^\d{6}$/;
                if (!zipRegex.test(value)) {
                    field.classList.add('error');
                    showFieldError(field, 'Please enter a valid 6-digit PIN code');
                    isValid = false;
                }
            }
        }
    });
    
    // Validate cart
    if (cartProducts.length === 0) {
        showNotification('Your cart is empty. Please add items to proceed.', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        showNotification('Please fill in the form correctly!', 'error');
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '5px';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
}

// Generate order ID
function generateOrderId() {
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    return `NA-${randomNumber}`;
}

// Main checkout function
async function processCheckout() {
    if (isProcessingPayment) return;
    
    isProcessingPayment = true;
    
    if (!validateCheckoutForm()) {
        isProcessingPayment = false;
        return;
    }
    
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalBtnText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    checkoutBtn.disabled = true;
    
    try {
        // Collect form data
        const email = document.getElementById('email').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const address = document.getElementById('address').value.trim();
        const apartment = document.getElementById('apartment')?.value.trim() || '';
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value;
        const zipCode = document.getElementById('zipCode').value.trim();
        const phoneInput = document.getElementById('phone').value.replace(/\D/g, '');
        const phone = phoneInput.length === 10 ? phoneInput : '';
        const isDefaultAddress = document.getElementById('defaultAddress')?.checked || false;
        
        console.log('Form data collected');
        
        // Calculate final amount
        const finalAmount = Math.max(0, window.originalTotal - window.currentDiscount);
        
        if (finalAmount <= 0) {
            throw new Error('Order amount must be greater than 0');
        }
        
        // Generate order ID
        const orderId = generateOrderId();
        
        // Create temporary order data
        const tempOrderData = {
            orderId: orderId,
            email: email,
            customerName: `${firstName} ${lastName}`,
            customerEmail: email,
            customerPhone: '+91 ' + phone,
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
                    image: product ? product.image : '',
                    subtotal: (product ? product.price : 0) * item.quantity
                };
            }),
            subtotal: window.originalTotal,
            discount: window.currentDiscount,
            shipping: window.shippingCost,
            total: finalAmount,
            status: 'payment_initiated',
            paymentStatus: 'initiated',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            expiresAt: firebase.firestore.Timestamp.fromDate(
                new Date(Date.now() + 30 * 60 * 1000)
            )
        };
        
        // Add user info if logged in
        if (currentUser) {
            tempOrderData.userId = currentUser.uid;
            tempOrderData.userEmail = currentUser.email;
        }
        
        console.log('Creating temp order');
        
        // Save address to profile if needed
        if (currentUser && isDefaultAddress) {
            console.log('Saving address to profile...');
            await window.saveCheckoutAddressToProfile(
                firstName, lastName, address, city, state, zipCode, '+91 ' + phone, isDefaultAddress
            );
        }
        
        // Save temp order to Firestore
        const tempOrderRef = await db.collection('tempOrders').add(tempOrderData);
        const tempOrderId = tempOrderRef.id;
        
        console.log('Temp order created:', tempOrderId);
        
        // Initialize Razorpay payment
        await initializeRazorpayPayment(tempOrderData, finalAmount, tempOrderId);
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification(`Payment failed: ${error.message}`, 'error');
        checkoutBtn.innerHTML = originalBtnText;
        checkoutBtn.disabled = false;
        isProcessingPayment = false;
    }
}

// Initialize Razorpay payment
async function initializeRazorpayPayment(orderData, amount, tempOrderId) {
    console.log('Initializing Razorpay payment for temp order:', tempOrderId);
    
    try {
        let createOrderResponse;
        
        try {
            // Try Firebase Function
            const createOrder = firebase.functions().httpsCallable('createRazorpayOrder');
            createOrderResponse = await createOrder({
                amount: amount,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: {
                    orderId: orderData.orderId,
                    tempOrderId: tempOrderId,
                    source: 'checkout'
                }
            });
            
            console.log('Firebase Function response:', createOrderResponse.data);
            
        } catch (firebaseError) {
            console.warn('Firebase Function failed:', firebaseError);
            createOrderResponse = await createRazorpayOrderDirect(amount, orderData.orderId, tempOrderId);
        }
        
        if (!createOrderResponse || !createOrderResponse.orderId) {
            throw new Error('Failed to create Razorpay order');
        }
        
        console.log('Razorpay order created:', createOrderResponse.orderId);
        
        // Update temp order with Razorpay order ID
        await db.collection('tempOrders').doc(tempOrderId).update({
            razorpayOrderId: createOrderResponse.orderId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Open Razorpay checkout
        await openRazorpayCheckout(
            createOrderResponse.orderId,
            'rzp_live_SKGf8KU7czOSKl', // Your Razorpay Key ID
            amount,
            orderData,
            tempOrderId
        );
        
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        throw error;
    }
}

// Direct API fallback for Razorpay order creation
async function createRazorpayOrderDirect(amount, orderId, tempOrderId) {
    try {
        console.log('Trying direct API call...');
        
        const functionURL = 'https://asia-south1-hexahoney-96aed.cloudfunctions.net/createRazorpayOrder';
        
        const response = await fetch(functionURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify({
                data: {
                    amount: amount,
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`,
                    notes: {
                        orderId: orderId,
                        tempOrderId: tempOrderId,
                        source: 'direct_fallback'
                    }
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Direct API success:', data);
        
        return {
            success: true,
            orderId: data.result.orderId,
            amount: data.result.amount,
            currency: data.result.currency,
        };
        
    } catch (error) {
        console.error('Direct API failed:', error);
        throw new Error('Payment service unavailable. Please try again.');
    }
}

// Open Razorpay checkout
async function openRazorpayCheckout(orderId, key, amount, orderData, tempOrderId) {
    try {
        await ensureRazorpayLoaded();
        
        const options = {
            key: key,
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            name: 'Hexa Naturals',
            description: `Order ${orderData.orderId}`,
            image: 'https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(8)%20(1).png?updatedAt=1756876605119',
            order_id: orderId,
            handler: function(response) {
                console.log('Payment successful:', response);
                processPaymentSuccess(orderData, tempOrderId, response);
            },
            prefill: {
                name: orderData.customerName,
                email: orderData.customerEmail,
                contact: orderData.customerPhone
            },
            notes: {
                address: `${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.zipCode}`
            },
            theme: {
                color: '#5f2b27'
            },
            modal: {
                ondismiss: function() {
                    console.log('Payment modal closed');
                    handlePaymentCancellation(tempOrderId);
                },
                confirm_close: true,
                animation: true
            }
        };
        
        const razorpay = new Razorpay(options);
        
        razorpay.on('payment.failed', function(response) {
            console.error('Payment failed:', response.error);
            handlePaymentFailure(response, tempOrderId);
        });
        
        razorpay.open();
        
    } catch (error) {
        console.error('Error opening Razorpay:', error);
        throw error;
    }
}

// Process successful payment
async function processPaymentSuccess(orderData, tempOrderId, razorpayResponse) {
    console.log('Processing payment success for temp order:', tempOrderId);
    
    try {
        // Get the temp order
        const tempOrderDoc = await db.collection('tempOrders').doc(tempOrderId).get();
        const tempOrderData = tempOrderDoc.data();
        
        if (!tempOrderData) {
            throw new Error('Temp order not found');
        }
        
        // Create final order
        const finalOrderData = {
            ...tempOrderData,
            status: 'ordered',
            paymentStatus: 'paid',
            razorpayPaymentId: razorpayResponse.razorpay_payment_id,
            razorpayOrderId: razorpayResponse.razorpay_order_id,
            razorpaySignature: razorpayResponse.razorpay_signature,
            paidAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Remove expiresAt from final order
        delete finalOrderData.expiresAt;
        
        console.log('Creating final order from temp order:', tempOrderId);
        
        // Create final order
        const orderRef = await db.collection('orders').add(finalOrderData);
        const finalOrderId = orderRef.id;
        
        console.log('✅ Final order created:', finalOrderId);
        
        // Update user's orders if logged in
        if (currentUser) {
            await db.collection('users').doc(currentUser.uid)
                .collection('orders').doc(finalOrderId).set({
                    ...finalOrderData,
                    id: finalOrderId
                });
        }
        
        // Delete temp order
        await db.collection('tempOrders').doc(tempOrderId).delete();
        console.log('🗑️ Temp order deleted:', tempOrderId);
        
        // Clear cart
        await clearCartAfterOrder();
        
        // Reset payment processing flag
        isProcessingPayment = false;
        
        // Show success message
        const updatedOrderData = {
            ...finalOrderData,
            id: finalOrderId
        };
        
        showOrderSuccess(updatedOrderData);
        
    } catch (error) {
        console.error('Error processing payment success:', error);
        
        // Update temp order with error
        try {
            await db.collection('tempOrders').doc(tempOrderId).update({
                paymentStatus: 'failed',
                paymentError: error.message,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (updateError) {
            console.error('Failed to update temp order:', updateError);
        }
        
        showNotification('Error completing order. Please contact support.', 'error');
        isProcessingPayment = false;
        throw error;
    }
}

// Handle payment failure
async function handlePaymentFailure(response, tempOrderId) {
    console.error('Payment failed for temp order:', tempOrderId);
    
    if (tempOrderId && db) {
        try {
            await db.collection('tempOrders').doc(tempOrderId).update({
                paymentStatus: 'failed',
                paymentError: response.error,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Temp order marked as failed:', tempOrderId);
            
        } catch (error) {
            console.error('Error updating failed payment:', error);
        }
    }
    
    showNotification(`Payment failed: ${response.error.description}`, 'error');
    
    // Reset button state
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
        checkoutBtn.disabled = false;
    }
    
    isProcessingPayment = false;
}

// Handle payment cancellation
async function handlePaymentCancellation(tempOrderId) {
    console.log('Payment cancelled for temp order:', tempOrderId);
    
    if (tempOrderId && db) {
        try {
            await db.collection('tempOrders').doc(tempOrderId).update({
                paymentStatus: 'cancelled',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Temp order marked as cancelled');
        } catch (error) {
            console.error('Error updating cancelled temp order:', error);
        }
    }
    
    // Reset button state
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
        checkoutBtn.disabled = false;
    }
    
    isProcessingPayment = false;
}

// Clear cart after order
async function clearCartAfterOrder() {
    try {
        console.log('Clearing cart after successful order...');
        
        // Clear from localStorage
        localStorage.removeItem('guestCart');
        
        // Clear from Firestore if user is logged in
        if (currentUser && db) {
            try {
                const cartRef = db.collection('users').doc(currentUser.uid).collection('cart');
                const cartSnapshot = await cartRef.get();
                
                if (!cartSnapshot.empty) {
                    const batch = db.batch();
                    cartSnapshot.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    console.log('Cart cleared from Firestore');
                }
            } catch (firestoreError) {
                console.error('Error clearing cart from Firestore:', firestoreError);
            }
        }
        
        // Clear local cart
        cartProducts = [];
        
        // Update UI
        if (typeof updateCartUI === 'function') {
            updateCartUI();
        }
        
        if (typeof updateOrderSummary === 'function') {
            updateOrderSummary();
        }
        
        console.log('Cart cleared successfully');
        
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// Show order success message
function showOrderSuccess(orderData) {
    showNotification(`Order confirmed! Order ID: ${orderData.orderId}`, 'success');
    
    setTimeout(() => {
        window.location.href = 'order-success.html?id=' + orderData.id;
    }, 2000);
}

// Show notification
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let container = document.getElementById('notificationContainer');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        font-family: 'Unbounded', sans-serif;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="close-notification" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">&times;</button>
    `;
    
    // Add animation styles if not exists
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Setup event listeners
function setupCheckoutEventListeners() {
    const loginBtnCheckout = document.getElementById('loginBtnCheckout');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Login/Logout button
    if (loginBtnCheckout) {
        loginBtnCheckout.addEventListener('click', function() {
            if (currentUser) {
                if (confirm('Are you sure you want to logout? This will clear your cart.')) {
                    auth.signOut().then(() => {
                        window.location.reload();
                    });
                }
            } else {
                if (typeof showLoginView === 'function' && loginModal) {
                    showLoginView();
                    loginModal.classList.add('active');
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            processCheckout();
        });
    }
    
    // Form validation on blur
    const formInputs = document.querySelectorAll('.checkout-form input, .checkout-form select');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('error');
                showFieldError(this, 'This field is required');
            } else {
                this.classList.remove('error');
                const error = this.parentNode.querySelector('.field-error');
                if (error) error.remove();
            }
        });
        
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const error = this.parentNode.querySelector('.field-error');
            if (error) error.remove();
        });
    });
}

// Make functions globally available
window.updateOrderSummary = updateOrderSummary;
window.processCheckout = processCheckout;
window.showNotification = showNotification;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing checkout...');
    
    if (document.querySelector('.checkout-section')) {
        console.log('Checkout section found, initializing...');
        initCheckoutPage();
    }
});
