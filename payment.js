
function updateCheckoutUI() {
    const emailInput = document.getElementById('email');
    const loginBtnCheckout = document.getElementById('loginBtnCheckout');
    
    if (currentUser) {
        if (emailInput) {
            emailInput.value = currentUser.email;
            emailInput.disabled = true;
            emailInput.style.backgroundColor = '#f5f5f5';
            emailInput.style.color = '#666';
            emailInput.style.cursor = 'not-allowed';
        }
        
        if (loginBtnCheckout) {
            loginBtnCheckout.textContent = 'LOGOUT';
            loginBtnCheckout.style.backgroundColor = 'transparent';
            loginBtnCheckout.style.color = '#e74c3c';
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
        
    } else {
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
            loginBtnCheckout.style.color = '#3498db';
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
                console.log('Default address found (real-time):', defaultAddress);
                
                // Add a small delay to ensure DOM is ready
                setTimeout(() => {
                    fillAddressForm(defaultAddress);
                }, 100);
                
            } else {
                console.log('No default address found for user');
                // Check if user has any addresses (even without default)
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
        let phoneNumber = address.phone.toString();
        
        phoneNumber = phoneNumber.replace(/\+91/g, '').replace(/\D/g, '');
        
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
    
    const checkoutSection = document.querySelector('.checkout-section');
    if (checkoutSection) {
        const filledFields = document.querySelectorAll('#firstName, #lastName, #address, #phone, #state').length;
    }
}


// Update totals including discount
function updateTotals() {
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const discountRow = document.getElementById('discountRow');
    const discountAmount = document.getElementById('discountAmount');
    
    if (!subtotalElement || !totalElement || !discountRow || !discountAmount) return;
    
    const newTotal = Math.max(0, window.originalTotal - window.currentDiscount);
    
    subtotalElement.textContent = `₹${window.originalTotal}`;
    
    if (window.currentDiscount > 0 && window.appliedPromoCode) {
        discountRow.style.display = 'flex';
        discountAmount.textContent = `-₹${window.currentDiscount}`;
        discountAmount.style.color = '#27ae60';
    } else {
        discountRow.style.display = 'none';
        window.currentDiscount = 0;
        window.appliedPromoCode = null;
    }
    
    totalElement.textContent = `₹${newTotal}`;
    refreshPromoCodes();
}

// PROMO CODE FUNCTIONALITY

// Get active promo codes
function getActivePromoCodes() {
    return window.activePromoCodes || {};
}


// Select promo code with toggle behaviour
function selectPromoCode(code) {
    const promoInput = document.querySelector('.promo-input');
    if (!promoInput) return;
    
    // If same code already applied → remove it
    if (window.appliedPromoCode === code) {
        removePromoCode();
        return;
    }
    
    // If same code is just selected → apply
    if (promoInput.value.toUpperCase() === code && window.appliedPromoCode !== code) {
        applyPromoCode();
        return;
    }
    
    // Otherwise select and auto-apply
    promoInput.value = code;
    refreshPromoCodes();
    applyPromoCode();
}

// Load promo codes from Firebase
function loadPromoCodesFromFirebase() {
    return new Promise((resolve) => {
        db.collection('promoCodes')
            .where('active', '==', true)
            .get()
            .then((querySnapshot) => {
                const promoCodes = {};
                const now = new Date();
                
                querySnapshot.forEach((doc) => {
                    const promoData = doc.data() || {};
                    
                    const isValid =
                        !promoData.validUntil ||
                        new Date(promoData.validUntil) >= now;
                    const showOnCheckout = promoData.showOnCheckout !== false;
                    
                    if (isValid && showOnCheckout) {
                        promoCodes[doc.id] = {
                            ...promoData,
                            id: doc.id,
                            value: Number(promoData.value) || 0,
                            minOrder: Number(promoData.minOrder) || 0,
                            maxDiscount:
                                promoData.maxDiscount == null
                                    ? null
                                    : Number(promoData.maxDiscount),
                            usageLimit:
                                promoData.usageLimit == null || promoData.usageLimit === 0
                                    ? null
                                    : Number(promoData.usageLimit),
                            usedCount: Number(promoData.usedCount) || 0
                        };
                    }
                });
                
                window.activePromoCodes = promoCodes;
                resolve(promoCodes);
            })
            .catch((error) => {
                console.error('Error loading promo codes:', error);
                window.activePromoCodes = {};
                resolve({});
            });
    });
}



// Add this to your existing initCheckoutPage function:
async function initCheckoutPage() {
    console.log('Initializing checkout page...');
    
    // Initial updates
    updateOrderSummary();
    setupCheckoutEventListeners();
    updateCheckoutUI();
    
    // Load promo codes
    try {
        await loadPromoCodesFromFirebase();
        displayAvailablePromoCodes();
    } catch (error) {
        console.error('Failed to load promo codes:', error);
    }
    
    // Load user's default address if logged in
    if (currentUser) {
        loadUserDefaultAddress();
    }
    
    // Check if we're coming from a successful order
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('orderSuccess')) {
        // You could show a simpler success message here if needed
        console.log('Order was successful! Order ID:', urlParams.get('orderSuccess'));
    }
}

// Apply promo code
function applyPromoCode() {
    const promoInput = document.querySelector('.promo-input');
    const applyBtn = document.querySelector('.apply-btn');
    
    if (!promoInput) return;
    
    const promoCode = promoInput.value.trim().toUpperCase();
    if (!promoCode) {
        showPromoError('Please enter a promo code');
        return;
    }
    
    hideAllPromoMessages();
    
    const matchingCode = Object.keys(window.activePromoCodes).find(
        (code) => code === promoCode
    );
    
    if (!matchingCode) {
        showPromoError('Invalid promo code. Please select from available codes below.');
        promoInput.value = '';
        refreshPromoCodes();
        return;
    }
    
    const promoDetails = window.activePromoCodes[matchingCode];
    
    if (!promoDetails.active) {
        showPromoError('This promo code is no longer active');
        promoInput.value = '';
        refreshPromoCodes();
        return;
    }
    
    if (promoDetails.validUntil && new Date(promoDetails.validUntil) < new Date()) {
        showPromoError('This promo code has expired');
        promoInput.value = '';
        refreshPromoCodes();
        return;
    }
    
    const minOrder = Number(promoDetails.minOrder) || 0;
    if (window.originalTotal < minOrder) {
        showPromoError(`Minimum order value of ₹${minOrder} required for this promo code`);
        promoInput.value = '';
        refreshPromoCodes();
        return;
    }
    
    if (typeof promoDetails.usageLimit === 'number' && promoDetails.usageLimit > 0) {
        const used = Number(promoDetails.usedCount) || 0;
        const limit = promoDetails.usageLimit;
        
        if (used >= limit) {
            showPromoError('Promo usage limit reached');
            
            db.collection('activities').add({
                type: 'PROMO_USAGE_LIMIT_REACHED',
                promoCode: promoCode,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            promoInput.value = '';
            refreshPromoCodes();
            return;
        }
    }
    
    let discountValue = 0;
    const promoType = promoDetails.type;
    const total = window.originalTotal;
    
    if (promoType === 'percentage') {
        discountValue = Math.round(total * (promoDetails.value / 100));
        if (typeof promoDetails.maxDiscount === 'number' && promoDetails.maxDiscount > 0 && discountValue > promoDetails.maxDiscount) {
            discountValue = promoDetails.maxDiscount;
        }
    } else if (promoType === 'fixed') {
        discountValue = Math.min(promoDetails.value, total);
    } else if (promoType === 'shipping') {
        discountValue = 0;
    }
    
    window.currentDiscount = discountValue;
    window.appliedPromoCode = promoCode;
    updateTotals();
    
    db.collection('promoCodes').doc(promoCode).update({
        usedCount: firebase.firestore.FieldValue.increment(1)
    }).catch((err) => {
        console.error('Failed to increment promo usage:', err);
    });
    
    db.collection('activities').add({
        type: 'PROMO_USED',
        promoCode: promoCode,
        discount: discountValue,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    refreshPromoCodes();
    
    let successMessage = `Promo code "${promoCode}" applied successfully!`;
    if (promoType === 'shipping') {
        successMessage += ' Free shipping applied.';
    } else if (discountValue > 0) {
        successMessage += ` ₹${discountValue} discount applied.`;
    }
    
    showPromoSuccess(successMessage);
    
    if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.style.opacity = '0.6';
        applyBtn.style.cursor = 'not-allowed';
    }
    
    promoInput.disabled = true;
    promoInput.style.backgroundColor = '#f5f5f5';
    promoInput.style.cursor = 'not-allowed';
}

// Refresh promo cards when totals/cart change
function refreshPromoCodes() {
    if (document.getElementById('promoCodesGrid')) {
        displayAvailablePromoCodes();
    }
}

// Improved updateOrderSummary function
function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const emptyState = document.querySelector('.empty-order-state');
    
    if (!orderItems) return;
    
    orderItems.innerHTML = '';
    let subtotal = 0;
    
    if (cartProducts.length === 0) {
        if (!emptyState) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-order-state';
            emptyMsg.innerHTML = `
                <div class="empty-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3>Your cart is empty</h3>
                <p>Add some delicious honey products to get started</p>
            `;
            orderItems.appendChild(emptyMsg);
        }
        
        // Hide promo section if cart is empty
        const promoSection = document.querySelector('.promo-code-section');
        if (promoSection) promoSection.style.display = 'none';
        
        // Disable checkout button
        const checkoutBtn = document.getElementById('processCheckoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.7';
        }
        
    } else {
        // Show promo section
        const promoSection = document.querySelector('.promo-code-section');
        if (promoSection) promoSection.style.display = 'block';
        
        // Enable checkout button
        const checkoutBtn = document.getElementById('processCheckoutBtn');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
        }
        
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
                                 onerror="this.src='https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(8)%20(1).png?updatedAt=1756876605119'">
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
                                <div class="quantity-controls">
                                    <button class="quantity-btn-checkout" data-action="decrease" data-id="${item.id}">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <input type="number" class="quantity-input-checkout" 
                                           value="${item.quantity}" min="1" max="10" 
                                           data-id="${item.id}">
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
    
    window.originalTotal = subtotal;
    updateTotals();
    refreshPromoCodes();
}

// Enhanced displayAvailablePromoCodes function
function displayAvailablePromoCodes() {
    const promoCodesGrid = document.getElementById('promoCodesGrid');
    const noPromoCodes = document.getElementById('noPromoCodes');
    const availablePromoCodes = document.getElementById('availablePromoCodes');
    
    if (!promoCodesGrid || !noPromoCodes) return;
    
    const availableCodes = Object.entries(window.activePromoCodes);
    
    if (availableCodes.length === 0) {
        promoCodesGrid.style.display = 'none';
        noPromoCodes.style.display = 'block';
        availablePromoCodes.style.display = 'none';
        return;
    }
    
    promoCodesGrid.style.display = 'grid';
    noPromoCodes.style.display = 'none';
    availablePromoCodes.style.display = 'block';
    promoCodesGrid.innerHTML = '';
    
    availableCodes.forEach(([code, details]) => {
        const discountText =
            details.type === 'percentage'
                ? `${details.value}% OFF`
                : details.type === 'shipping'
                ? 'FREE SHIPPING'
                : `₹${details.value} OFF`;
        
        const isApplicable = window.originalTotal >= (Number(details.minOrder) || 0);
        const isAlreadyApplied = window.appliedPromoCode === code;
        
        const promoCard = document.createElement('div');
        promoCard.className = 'promo-code-card';
        if (isAlreadyApplied) promoCard.classList.add('active');
        if (!isApplicable) promoCard.classList.add('disabled');
        promoCard.setAttribute('data-code', code);
        
        promoCard.innerHTML = `
            <div class="promo-code-header">
                <div class="promo-code-value">${code}</div>
                ${isAlreadyApplied ? 
                    '<div class="applied-badge"><i class="fas fa-check"></i> Applied</div>' : 
                    ''}
            </div>
            <div class="promo-code-desc">${discountText} - ${details.description || ''}</div>
            <div class="promo-code-terms">Min. order: ₹${Number(details.minOrder) || 0}</div>
        `;
        
        if (isApplicable) {
            promoCard.addEventListener('click', () => {
                selectPromoCode(code);
            });
        }
        
        promoCodesGrid.appendChild(promoCard);
    });
}

// Improved selectPromoCode function
function selectPromoCode(code) {
    const promoInput = document.getElementById('promoCodeInput');
    const applyBtn = document.getElementById('applyPromoBtn');
    
    if (!promoInput || !applyBtn) return;
    
    // If same code already applied → remove it
    if (window.appliedPromoCode === code) {
        removePromoCode();
        return;
    }
    
    // Select the code and auto-apply if applicable
    promoInput.value = code;
    applyPromoCode();
}

// Enhanced showPromoSuccess function
function showPromoSuccess(message) {
    const promoMessage = document.getElementById('promoMessage');
    if (!promoMessage) return;
    
    promoMessage.className = 'promo-message success';
    promoMessage.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;">
            <span>${message}</span>
            ${window.appliedPromoCode ? 
                '<button onclick="removePromoCode()" style="background:none;border:none;color:#155724;cursor:pointer;font-size:12px;text-decoration:underline;padding:0;">Remove</button>' : 
                ''}
        </div>
    `;
    
    setTimeout(() => {
        if (!window.appliedPromoCode) {
            promoMessage.style.display = 'none';
        }
    }, 5000);
}

// Enhanced removePromoCode function
function removePromoCode() {
    window.currentDiscount = 0;
    window.appliedPromoCode = null;
    
    const promoInput = document.getElementById('promoCodeInput');
    const applyBtn = document.getElementById('applyPromoBtn');
    const promoMessage = document.getElementById('promoMessage');
    
    if (promoInput) {
        promoInput.value = '';
        promoInput.disabled = false;
        promoInput.style.backgroundColor = '';
        promoInput.style.cursor = '';
    }
    
    if (applyBtn) {
        applyBtn.disabled = false;
        applyBtn.style.opacity = '1';
        applyBtn.style.cursor = 'pointer';
    }
    
    if (promoMessage) {
        promoMessage.style.display = 'none';
    }
    
    updateTotals();
    refreshPromoCodes();
}

function showPromoError(message) {
    hideAllPromoMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'promo-message promo-error';
    errorDiv.textContent = message;
    
    const promoCodeSection = document.querySelector('.promo-code');
    if (!promoCodeSection) return;
    const promoInputGroup = promoCodeSection.querySelector('.promo-input-group');
    promoInputGroup.parentNode.insertBefore(errorDiv, promoInputGroup.nextSibling);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function hideAllPromoMessages() {
    document.querySelectorAll('.promo-message').forEach((msg) => msg.remove());
}

// Handle quantity change in checkout
function handleCheckoutQuantityChange(e) {
    const button = e.target.closest('.quantity-btn-checkout');
    if (!button) return;
    
    const productId = parseInt(button.getAttribute('data-id'));
    const action = button.getAttribute('data-action');
    
    if (action === 'decrease') {
        const item = cartProducts.find(item => item.id === productId);
        if (item && item.quantity <= 1) {
            removeFromCart(productId);
        } else {
            updateCartQuantity(productId, -1);
        }
    } else if (action === 'increase') {
        updateCartQuantity(productId, 1);
    }
}

// Handle quantity input in checkout  
function handleCheckoutQuantityInput(e) {
    const input = e.target;
    const productId = parseInt(input.getAttribute('data-id'));
    const newQuantity = parseInt(input.value) || 0;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
    } else {
        setCartQuantity(productId, newQuantity);
    }
}

// Validate form field
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

// Show field error message
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

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
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

// Validate entire checkout form
function validateCheckoutForm() {
    const requiredFields = [
        'email', 'firstName', 'lastName', 'address', 
        'city', 'state', 'zipCode', 'phone'
    ];
    
    let isValid = true;
    
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField({ target: field })) {
            isValid = false;
        }
    });
    
    if (cartProducts.length === 0) {
        alert('Your cart is empty. Please add items to proceed.');
        isValid = false;
    }
    
    return isValid;
}

// Process checkout
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
    const isDefaultAddress = document.getElementById('defaultAddress').checked;

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
        subtotal: window.originalTotal,
        discount: window.currentDiscount,
        total: window.originalTotal - window.currentDiscount,
        status: 'ordered',
        createdAt: new Date().toISOString(),
        paymentMethod: 'razorpay'
    };
    
    if (window.appliedPromoCode) {
        orderData.promoCode = window.appliedPromoCode;
    }
    
    // Use the function from common.js
    if (currentUser && isDefaultAddress) {
        window.saveCheckoutAddressToProfile(firstName, lastName, address, city, state, zipCode, phone, isDefaultAddress);
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

// Save order to Firestore
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

// Process payment (simulated)
function processPayment(orderData) {
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    checkoutBtn.disabled = true;
    
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

// Show order success message
function showOrderSuccess(orderData) {
    alert(`Order confirmed successfully! Order ID: ${orderData.id.substring(0, 8)}\n\nThank you for your purchase. You will receive an email confirmation shortly.`);
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

// Setup event listeners for checkout page
function setupCheckoutEventListeners() {
    const loginBtnCheckout = document.getElementById('loginBtnCheckout');
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const processCheckoutBtn = document.getElementById('processCheckoutBtn');
    const promoCodeInput = document.getElementById('promoCodeInput');

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
                showLoginView();
                loginModal.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Apply promo button
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }

    // Promo code input
    if (promoCodeInput) {
        promoCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });
        
        promoCodeInput.addEventListener('input', function(e) {
            const value = e.target.value.toUpperCase();
            const promoMessage = document.getElementById('promoMessage');
            if (promoMessage) {
                promoMessage.style.display = 'none';
            }
            
            // Highlight matching promo cards
            const promoCards = document.querySelectorAll('.promo-code-card');
            promoCards.forEach(card => {
                const code = card.getAttribute('data-code');
                if (code && code.startsWith(value)) {
                    card.style.borderColor = '#5f2b27';
                    card.style.boxShadow = '0 0 0 2px rgba(95, 43, 39, 0.1)';
                } else {
                    card.style.borderColor = '';
                    card.style.boxShadow = '';
                }
            });
        });
        
        promoCodeInput.addEventListener('focus', function() {
            this.parentElement.style.borderColor = '#5f2b27';
            this.parentElement.style.boxShadow = '0 0 0 2px rgba(95, 43, 39, 0.1)';
        });
        
        promoCodeInput.addEventListener('blur', function() {
            this.parentElement.style.borderColor = '#ddd';
            this.parentElement.style.boxShadow = 'none';
        });
    }

    // Process checkout button
    if (processCheckoutBtn) {
        processCheckoutBtn.addEventListener('click', processCheckout);
    }

    // Quantity controls
    document.addEventListener('click', handleCheckoutQuantityChange);
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
        input.addEventListener('focus', function() {
            this.style.borderColor = '#5f2b27';
        });
        input.addEventListener('blur', function() {
            if (!this.classList.contains('error')) {
                this.style.borderColor = '#ddd';
            }
        });
    });
}

// Initialize checkout page
// Initialize checkout page
async function initCheckoutPage() {
  console.log('Initializing checkout page...');
  
  // Initial updates
  updateOrderSummary();
  setupCheckoutEventListeners();
  updateCheckoutUI();
  
  // Load promo codes with error handling
  try {
    console.log('Loading promo codes...');
    await loadPromoCodesFromFirebase();
    console.log('Promo codes loaded:', window.activePromoCodes);
    
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
      displayAvailablePromoCodes();
      
      // Debug: Check if elements exist
      const promoCodesGrid = document.getElementById('promoCodesGrid');
      const noPromoCodes = document.getElementById('noPromoCodes');
      const availablePromoCodes = document.getElementById('availablePromoCodes');
      
      console.log('Promo elements found:', {
        promoCodesGrid: !!promoCodesGrid,
        noPromoCodes: !!noPromoCodes,
        availablePromoCodes: !!availablePromoCodes
      });
      
      // Add animation for promo cards
      const promoCards = document.querySelectorAll('.promo-code-card');
      promoCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-fade-in');
      });
    }, 500);
    
  } catch (error) {
    console.error('Failed to load promo codes:', error);
    showPromoError('Unable to load promo codes. Please try again later.');
  }
  
  // Update UI based on cart state
  if (cartProducts.length === 0) {
    const checkoutBtn = document.getElementById('processCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.7';
    }
  }
  
  // Load user's default address if logged in
  if (currentUser) {
    loadUserDefaultAddress();
  }
}
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing checkout...');
  
  // Initialize checkout page if on checkout page
  if (document.querySelector('.checkout-section')) {
    console.log('Checkout section found, initializing...');
    initCheckoutPage();
    
    // Test after a delay
    setTimeout(() => {
      console.log('Running promo code test...');
      testPromoCodeDisplay();
    }, 2000);
  }
});

// Make functions available globally
window.updateCheckoutUI = updateCheckoutUI;
window.loadUserDefaultAddress = loadUserDefaultAddress;
window.updateOrderSummary = updateOrderSummary;
window.refreshPromoCodes = refreshPromoCodes;
window.applyPromoCode = applyPromoCode;
window.removePromoCode = removePromoCode;
window.selectPromoCode = selectPromoCode;

let isProcessingPayment = false;

function generateOrderId() {
    // Generate a random 5-digit number
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    return `NA-${randomNumber}`;
}
// Enhanced updateOrderSummary function
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
                                <div class="order-item-price">₹${itemTotal}</div>
                            </div>
                            <div class="order-item-footer">
                                <div class="quantity-controls">
                                    <button class="quantity-btn-checkout" data-action="decrease" data-id="${item.id}">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <input type="number" class="quantity-input-checkout" 
                                           value="${item.quantity}" min="1" max="99" 
                                           data-id="${item.id}">
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
        
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }
    }
    
    window.originalTotal = subtotal;
    updateTotals();
    refreshPromoCodes();
}

// Enhanced validateCheckoutForm function
function validateCheckoutForm() {
    const requiredFields = [
        'email', 'firstName', 'lastName', 'address', 
        'city', 'state', 'zipCode', 'phone'
    ];
    
    let isValid = true;
    let errorMessages = [];
    
    // Clear previous errors
    document.querySelectorAll('.field-error').forEach(error => error.remove());
    document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
    
    // Validate required fields
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            const value = field.value.trim();
            if (field.hasAttribute('required') && !value) {
                field.classList.add('error');
                showFieldError(field, 'This field is required');
                errorMessages.push(`${fieldId} is required`);
                isValid = false;
            }
            
            // Specific validations
            if (fieldId === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    field.classList.add('error');
                    showFieldError(field, 'Please enter a valid email address');
                    errorMessages.push('Invalid email address');
                    isValid = false;
                }
            }
            
            if (fieldId === 'phone' && value) {
                const phoneNumber = value.replace(/\D/g, '');
                if (phoneNumber.length !== 10 || !/^[6-9]\d{9}$/.test(phoneNumber)) {
                    field.classList.add('error');
                    showFieldError(field, 'Please enter a valid 10-digit phone number');
                    errorMessages.push('Invalid phone number');
                    isValid = false;
                }
            }
            
            if (fieldId === 'zipCode' && value) {
                const zipRegex = /^\d{6}$/;
                if (!zipRegex.test(value)) {
                    field.classList.add('error');
                    showFieldError(field, 'Please enter a valid 6-digit PIN code');
                    errorMessages.push('Invalid PIN code');
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
    
    if (!isValid && errorMessages.length > 0) {
        showNotification('Please fix the errors in the form', 'error');
    }
    
    return isValid;
}

// Enhanced processCheckout function
async function processCheckout() {
    // Prevent double-click
    if (isProcessingPayment) {
        return;
    }
    
    isProcessingPayment = true;
    
    // Validate form
    if (!validateCheckoutForm()) {
        isProcessingPayment = false;
        return;
    }
    
    // Show processing animation
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalBtnText = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Order...';
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
        
        // Generate order data
        const orderId = generateOrderId();
        const orderData = {
            orderId: orderId,
            orderNumber: orderId,
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
                    image: product ? product.image : '',
                    subtotal: (product ? product.price : 0) * item.quantity
                };
            }),
            subtotal: window.originalTotal,
            discount: window.currentDiscount,
            shipping: 0,
            total: window.originalTotal - window.currentDiscount,
            status: 'ordered',
            paymentStatus: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            orderDate: new Date(),
            paymentMethod: 'razorpay',
            paymentGateway: 'razorpay'
        };
        
        // Add promo code if applied
        if (window.appliedPromoCode) {
            orderData.promoCode = window.appliedPromoCode;
            orderData.promoDiscount = window.currentDiscount;
        }
        
        // Add user info if logged in
        if (currentUser) {
            orderData.userId = currentUser.uid;
            orderData.userEmail = currentUser.email;
            orderData.userName = currentUser.displayName || `${firstName} ${lastName}`;
        }
        
        console.log('Creating order with data:', orderData);
        
        // Save address to profile if user is logged in and checkbox is checked
        if (currentUser && isDefaultAddress) {
            await window.saveCheckoutAddressToProfile(
                firstName, lastName, address, city, state, zipCode, '+91 ' + phone, isDefaultAddress
            );
        }
        
        // Save order to Firestore
        const orderRef = await saveOrderToFirestore(orderData);
        console.log('Order saved with ID:', orderRef.id);
        
        // Process payment - THIS WILL SHOW THE POPUP
        await processPayment(orderData, orderRef.id);
        
        // Reset processing flag
        isProcessingPayment = false;
        
    } catch (error) {
        console.error('Checkout error:', error);
        
        // Reset button state
        checkoutBtn.innerHTML = originalBtnText;
        checkoutBtn.disabled = false;
        isProcessingPayment = false;
        
        showNotification('Payment failed. Please try again.', 'error');
    }
}

// Enhanced processPayment function with proper popup triggering
async function processPayment(orderData, orderDocId) {
    console.log('processPayment called with orderDocId:', orderDocId);
    
    return new Promise((resolve, reject) => {
        // Update button to show processing
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
        }
        
        // Simulate payment processing (2 seconds)
        setTimeout(async () => {
            try {
                console.log('Payment processing completed for order:', orderDocId);
                
                // Update order status in Firestore
                if (db && orderDocId) {
                    await db.collection('orders').doc(orderDocId).update({
                        status: 'ordered',
                        paymentStatus: 'paid',
                        paidAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    console.log('Order updated in main collection');
                    
                    // Update user's orders if logged in
                    if (currentUser) {
                        await db.collection('users').doc(currentUser.uid).collection('orders').doc(orderDocId).update({
                            status: 'ordered',
                            paymentStatus: 'paid',
                            paidAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        console.log('Order updated in user collection');
                    }
                }
                
                // Clear cart
                cartProducts = [];
                localStorage.removeItem('guestCart');
                
                // Update UI
                updateCartUI();
                updateOrderSummary();
                
                console.log('Cart cleared, showing success popup...');
                
                // Show success popup with updated order data
                const updatedOrderData = {
                    ...orderData,
                    id: orderDocId,
                    orderId: orderData.orderId || `NA-${Math.floor(10000 + Math.random() * 90000)}`,
                    status: 'ordered',
                    paymentStatus: 'paid',
                    paidAt: new Date().toISOString(),
                    total: orderData.total || (window.originalTotal - window.currentDiscount)
                };
                
                // Call the success popup function
                if (typeof showOrderSuccessPopup === 'function') {
                    showOrderSuccessPopup(updatedOrderData);
                } else {
                    console.error('showOrderSuccessPopup function not found!');
                    // Fallback to alert
                    alert(`Order confirmed successfully! Order ID: ${updatedOrderData.orderId}`);
                    window.location.href = 'index.html';
                }
                
                resolve();
                
            } catch (error) {
                console.error('Payment processing error:', error);
                
                // Reset button state on error
                if (checkoutBtn) {
                    checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
                    checkoutBtn.disabled = false;
                }
                
                reject(error);
            }
        }, 2000); // 2 second delay for payment simulation
    });
}

// Enhanced showOrderSuccessPopup function with redirect on close
function showOrderSuccessPopup(orderData) {
    console.log('showOrderSuccessPopup called with:', orderData);
    
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) {
        console.error('Order success modal not found!');
        // Create modal dynamically
        createOrderSuccessModal();
        // Show modal after creation
        setTimeout(() => showOrderSuccessPopup(orderData), 100);
        return;
    }
    
    // Set order details
    const successOrderId = document.getElementById('successOrderId');
    const successOrderDate = document.getElementById('successOrderDate');
    const successOrderTotal = document.getElementById('successOrderTotal');
    
    if (successOrderId) {
        successOrderId.textContent = orderData.orderId || 
                                    orderData.orderNumber || 
                                    orderData.id || 
                                    `NA-${Date.now().toString().slice(-8)}`;
    }
    
    if (successOrderDate) {
        successOrderDate.textContent = new Date().toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    if (successOrderTotal) {
        const total = orderData.total || (window.originalTotal - window.currentDiscount);
        successOrderTotal.textContent = `₹${total.toFixed(2)}`;
    }
    
    // Show modal with animation
    modal.classList.add('active');
    
    // Remove any existing event listeners first to avoid duplicates
    const closeBtn = document.getElementById('closeSuccessModal');
    const trackBtn = document.getElementById('trackOrderBtn');
    const continueBtn = document.getElementById('continueShoppingBtn');
    
    // Close button event - REDIRECT TO INDEX.HTML
    if (closeBtn) {
        // Remove existing listeners
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        // Add new listener that redirects to index.html
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close modal with animation
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Redirect after animation completes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
        });
    }
    
    // Track order button event
    if (trackBtn) {
        const newTrackBtn = trackBtn.cloneNode(true);
        trackBtn.parentNode.replaceChild(newTrackBtn, trackBtn);
        
        newTrackBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Call existing tracking function
            if (typeof window.showOrderTracking === 'function' && orderData.id) {
                window.showOrderTracking(orderData.id);
            }
        });
    }
    
    // Continue shopping button event - REDIRECT TO INDEX.HTML
    if (continueBtn) {
        const newContinueBtn = continueBtn.cloneNode(true);
        continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
        
        newContinueBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            window.location.href = 'index.html';
        });
    }
    
    // Close when clicking outside the content - REDIRECT TO INDEX.HTML
    modal.onclick = function(e) {
        if (e.target === modal) {
            // Close modal with animation
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Redirect after animation completes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
        }
    };
    
    // Close with Escape key - REDIRECT TO INDEX.HTML
    const closeOnEscape = function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            // Close modal with animation
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Redirect after animation completes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
            
            // Remove the event listener
            document.removeEventListener('keydown', closeOnEscape);
        }
    };
    
    // Remove previous event listener and add new one
    document.removeEventListener('keydown', closeOnEscape);
    document.addEventListener('keydown', closeOnEscape);
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
}

// Update the createOrderSuccessModal function to include redirect
function createOrderSuccessModal() {
    console.log('Creating order success modal dynamically');
    
    const modalHTML = `
    <div id="orderSuccessModal" class="order-success-modal">
        <div class="order-success-content">
            <!-- Close button should be the first element inside content -->
            <button id="closeSuccessModal" class="close-modal-btn">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="success-header">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Order Confirmed!</h2>
                <p>Thank you for your purchase</p>
            </div>
            
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Order ID</span>
                    <span id="successOrderId" class="detail-value">NA-12345</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Date</span>
                    <span id="successOrderDate" class="detail-value">${new Date().toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount</span>
                    <span id="successOrderTotal" class="detail-value">₹0.00</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value status-paid">Paid</span>
                </div>
            </div>
            
            <div class="order-actions">
                <button id="trackOrderBtn" class="btn track-order-btn">
                    <i class="fas fa-truck"></i> Track Order
                </button>
                <button id="continueShoppingBtn" class="btn continue-shopping-btn">
                    <i class="fas fa-shopping-cart"></i> Continue Shopping
                </button>
            </div>
            
            <div class="order-tips">
                <div class="tip">
                    <i class="fas fa-envelope"></i>
                    <span>You will receive an order confirmation email shortly.</span>
                </div>
                <div class="tip">
                    <i class="fas fa-phone"></i>
                    <span>Need help? <a href="contact.html">Contact our support</a></span>
                </div>
                <div class="tip">
                    <i class="fas fa-star"></i>
                    <span>Review your products after delivery for special offers!</span>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners after modal is created
    setTimeout(() => {
        const closeBtn = document.getElementById('closeSuccessModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                const modal = document.getElementById('orderSuccessModal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 300);
                }
            });
        }
    }, 100);
}

// Close popup function
function closeOrderSuccessPopup() {
    const modal = document.getElementById('orderSuccessModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}


// Make functions available globally
window.showOrderSuccessPopup = showOrderSuccessPopup;
window.closeOrderSuccessPopup = closeOrderSuccessPopup;
window.processCheckout = processCheckout;


// Enhanced saveOrderToFirestore function
async function saveOrderToFirestore(orderData) {
    return new Promise(async (resolve, reject) => {
        try {
            let orderRef;
            
            // Save to main orders collection
            orderRef = await db.collection('orders').add(orderData);
            console.log('Order saved to main collection:', orderRef.id);
            
            // Save to user's orders if logged in
            if (currentUser) {
                await db.collection('users').doc(currentUser.uid).collection('orders').doc(orderRef.id).set({
                    ...orderData,
                    id: orderRef.id
                });
                console.log('Order saved to user collection:', orderRef.id);
            }
            
            resolve(orderRef);
        } catch (error) {
            console.error('Error saving order:', error);
            reject(error);
        }
    });
}

// Enhanced clearCartAfterOrder function
async function clearCartAfterOrder() {
    try {
        // Clear from localStorage
        localStorage.removeItem('guestCart');
        
        // Clear from Firestore if user is logged in
        if (currentUser) {
            const cartItems = await db.collection('users').doc(currentUser.uid).collection('cart').get();
            const deletePromises = [];
            cartItems.forEach(doc => {
                deletePromises.push(doc.ref.delete());
            });
            await Promise.all(deletePromises);
        }
        
        // Clear local cart
        cartProducts = [];
        
        // Update UI
        updateCartUI();
        updateOrderSummary();
        
        console.log('Cart cleared successfully');
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// Add button animation function
function addButtonAnimation(button) {
    button.classList.add('processing');
    button.style.transform = 'scale(0.98)';
    button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    // Add ripple effect
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = 0;
    const y = 0;
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Enhanced setupCheckoutEventListeners function
function setupCheckoutEventListeners() {
    const loginBtnCheckout = document.getElementById('loginBtnCheckout');
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const promoCodeInput = document.getElementById('promoCodeInput');
    
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
                showLoginView();
                loginModal.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Apply promo button
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }
    
    // Promo code input
    if (promoCodeInput) {
        promoCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });
    }
    
    // Checkout button with animation
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add animation
            addButtonAnimation(this);
            
            // Process checkout
            setTimeout(() => {
                processCheckout();
            }, 300);
        });
        
        // Add hover effects
        checkoutBtn.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 20px rgba(95, 43, 39, 0.4)';
            }
        });
        
        checkoutBtn.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 15px rgba(95, 43, 39, 0.3)';
            }
        });
    }
    
    // Quantity controls
    document.addEventListener('click', handleCheckoutQuantityChange);
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
        input.addEventListener('focus', function() {
            this.style.borderColor = '#5f2b27';
            this.style.boxShadow = '0 0 0 2px rgba(95, 43, 39, 0.1)';
        });
        input.addEventListener('blur', function() {
            if (!this.classList.contains('error')) {
                this.style.borderColor = '#ddd';
                this.style.boxShadow = 'none';
            }
        });
    });
}

// Add to common.js (update existing function)
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `checkout-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="close-notification">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        font-family: 'Unbounded', sans-serif;
    `;
    
    // Animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes ripple {
            to { transform: scale(4); opacity: 0; }
        }
        .checkout-btn.processing {
            animation: pulse 0.6s ease;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(0.98); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Close button
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
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

async function initCheckoutPage() {
    console.log('Initializing checkout page...');
    
    // Initial updates
    updateOrderSummary();
    setupCheckoutEventListeners();
    updateCheckoutUI();
    
    // Load promo codes with error handling
    try {
        console.log('Loading promo codes...');
        await loadPromoCodesFromFirebase();
        console.log('Promo codes loaded:', window.activePromoCodes);
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            displayAvailablePromoCodes();
            
            // Debug: Check if elements exist
            const promoCodesGrid = document.getElementById('promoCodesGrid');
            const noPromoCodes = document.getElementById('noPromoCodes');
            const availablePromoCodes = document.getElementById('availablePromoCodes');
            
            console.log('Promo elements found:', {
                promoCodesGrid: !!promoCodesGrid,
                noPromoCodes: !!noPromoCodes,
                availablePromoCodes: !!availablePromoCodes
            });
            
            // Add animation for promo cards
            const promoCards = document.querySelectorAll('.promo-code-card');
            promoCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('animate-fade-in');
            });
        }, 500);
        
    } catch (error) {
        console.error('Failed to load promo codes:', error);
        showPromoError('Unable to load promo codes. Please try again later.');
    }
    
    // Update UI based on cart state
    if (cartProducts.length === 0) {
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.7';
        }
    }
    
    if (currentUser) {
        loadUserDefaultAddress();
    }
}

window.updateCheckoutUI = updateCheckoutUI;
window.loadUserDefaultAddress = loadUserDefaultAddress;
window.updateOrderSummary = updateOrderSummary;
window.refreshPromoCodes = refreshPromoCodes;
window.applyPromoCode = applyPromoCode;
window.removePromoCode = removePromoCode;
window.selectPromoCode = selectPromoCode;
window.processCheckout = processCheckout;
window.showNotification = showNotification;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing checkout...');
  
  // Initialize checkout page if on checkout page
  if (document.querySelector('.checkout-section')) {
    console.log('Checkout section found, initializing...');
    initCheckoutPage();
  }
});
