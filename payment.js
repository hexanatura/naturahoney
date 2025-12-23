let isProcessingPayment = false;
let razorpayScriptLoaded = false;
const functions = firebase.functions(app, 'asia-south1');


// Initialize checkout page
async function initCheckoutPage() {
    console.log('Initializing checkout page with Razorpay...');
    
    // Initial updates
    updateOrderSummary();
    setupCheckoutEventListeners();
    updateCheckoutUI();
    
    // Preload Razorpay script
    preloadRazorpayScript();
    
    // Load promo codes
    try {
        await loadPromoCodesFromFirebase();
        setTimeout(() => {
            displayAvailablePromoCodes();
        }, 500);
    } catch (error) {
        console.error('Failed to load promo codes:', error);
    }
    
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
        // Wait a bit more for script to initialize
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

// Update checkout UI
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
    
    // REMOVED: Firestore update for promo usage
    // REMOVED: Activity log
    
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

// Generate order ID
function generateOrderId() {
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

// Main checkout function with Razorpay integration
async function processCheckout() {
    // Prevent double-click
    if (isProcessingPayment) {
        console.log('Payment already processing, ignoring click');
        return;
    }
    
    isProcessingPayment = true;
    
    console.log('=== STARTING CHECKOUT PROCESS ===');
    
    // Validate form
    if (!validateCheckoutForm()) {
        console.log('Form validation failed');
        isProcessingPayment = false;
        return;
    }
    
    console.log('Form validation passed');
    
    // Ensure Razorpay is loaded
    try {
        await ensureRazorpayLoaded();
    } catch (error) {
        console.error('Failed to load Razorpay:', error);
        showNotification('Failed to load payment gateway. Please try again.', 'error');
        isProcessingPayment = false;
        return;
    }
    
    // Show processing animation
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
        
        console.log('Form data collected:', { email, firstName, lastName, phone });
        
        // Calculate final amount
        const finalAmount = Math.max(0, window.originalTotal - window.currentDiscount);
        
        if (finalAmount <= 0) {
            throw new Error('Order amount must be greater than 0');
        }
        
        // Create order data for database
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
            total: finalAmount,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            orderDate: new Date(),
            paymentMethod: 'razorpay',
            paymentGateway: 'razorpay',
            customerName: `${firstName} ${lastName}`,
            customerEmail: email,
            customerPhone: '+91 ' + phone
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
        
        console.log('Order data prepared:', orderData);
        
        // Save address to profile if needed
        if (currentUser && isDefaultAddress) {
            console.log('Saving address to profile...');
            await window.saveCheckoutAddressToProfile(
                firstName, lastName, address, city, state, zipCode, '+91 ' + phone, isDefaultAddress
            );
        }
        
        // Initialize Razorpay payment
        await initializeRazorpayPayment(orderData, finalAmount);
        
    } catch (error) {
        console.error('Checkout error:', error);
        
        // Show error
        showNotification(`Payment failed: ${error.message}`, 'error');
        
        // Reset button state
        checkoutBtn.innerHTML = originalBtnText;
        checkoutBtn.disabled = false;
        isProcessingPayment = false;
    }
}

// Razorpay Payment Integration
async function initializeRazorpayPayment(orderData, amount) {
    console.log('Initializing Razorpay payment for amount:', amount);
    
    try {
        // Create Razorpay order via Firebase Function
        const createOrderResponse = await createRazorpayOrder(amount, orderData.orderId);
        
        if (!createOrderResponse || !createOrderResponse.orderId) {
            throw new Error('Failed to create Razorpay order');
        }
        
        console.log('Razorpay order created:', createOrderResponse.orderId);
        
        // Update order with Razorpay order ID
        orderData.razorpayOrderId = createOrderResponse.orderId;
        orderData.razorpayKey = createOrderResponse.razorpayKey;
        
        // Save order to Firestore with pending status
        const orderRef = await saveOrderToFirestore(orderData);
        const orderDocId = orderRef.id;
        
        console.log('Order saved to Firestore:', orderDocId);
        
        // Initialize Razorpay checkout
        await openRazorpayCheckout(
            createOrderResponse.orderId,
            createOrderResponse.razorpayKey,
            amount,
            orderData,
            orderDocId
        );
        
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        throw error;
    }
}

async function createRazorpayOrder(amount, orderId) {
    console.log('Creating Razorpay order for amount:', amount, 'orderId:', orderId);
    
    try {
        // Get functions instance
        const functions = getFunctionsInstance();
        const createRazorpayOrderFn = functions.httpsCallable('createRazorpayOrder');
        
        const result = await createRazorpayOrderFn({
            amount: amount,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                orderId: orderId
            }
        });
        
        console.log('Razorpay order creation response:', result.data);
        return result.data;
        
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        
        // Provide helpful error message
        if (error.code === 'functions/unavailable') {
            throw new Error('Payment service is currently unavailable. Please try again later.');
        } else if (error.message.includes('internal')) {
            // Check if function exists
            console.error('Function internal error - checking if deployed...');
            throw new Error('Payment gateway configuration error. Please contact support.');
        } else {
            throw new Error(`Failed to create payment order: ${error.message}`);
        }
    }
}

// Helper function to get functions instance
function getFunctionsInstance() {
    try {
        // Try with region first
        return firebase.functions(firebase.app(), 'asia-south1');
    } catch (error) {
        console.warn('Could not get functions with region, using default:', error);
        return firebase.functions();
    }
}
// Open Razorpay checkout modal
async function openRazorpayCheckout(razorpayOrderId, razorpayKey, amount, orderData, orderDocId) {
    console.log('Opening Razorpay checkout with orderId:', razorpayOrderId);
    
    return new Promise((resolve, reject) => {
        const options = {
            key: razorpayKey,
            amount: amount * 100, // Amount in paise
            currency: "INR",
            name: "Natura Honey",
            description: `Order ${orderData.orderId}`,
            order_id: razorpayOrderId,
            handler: async function(response) {
                console.log('Razorpay payment successful:', response);
                
                try {
                    // Verify payment
                    const verifyPayment = firebase.functions().httpsCallable('verifyPayment');
                    const verificationResult = await verifyPayment({
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature,
                        orderId: orderData.orderId
                    });
                    
                    console.log('Payment verification result:', verificationResult.data);
                    
                    // Process payment success
                    await processPaymentSuccess(orderData, orderDocId, response);
                    resolve(response);
                    
                } catch (error) {
                    console.error('Payment verification failed:', error);
                    handlePaymentError(error, orderDocId);
                    reject(new Error('Payment verification failed: ' + error.message));
                }
            },
            prefill: {
                name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
                email: orderData.email,
                contact: orderData.shippingAddress.phone.replace('+91 ', '')
            },
            notes: {
                orderId: orderData.orderId,
                orderDocId: orderDocId
            },
            theme: {
                color: "#5f2b27"
            },
            modal: {
                ondismiss: function() {
                    console.log('Razorpay modal dismissed');
                    handlePaymentCancellation(orderDocId);
                    reject(new Error('Payment cancelled by user'));
                }
            }
        };
        
        const rzp = new Razorpay(options);
        
        rzp.on('payment.failed', async function(response) {
            console.error('Razorpay payment failed:', response.error);
            await handlePaymentFailure(response, orderDocId);
            reject(new Error(`Payment failed: ${response.error.description}`));
        });
        
        rzp.open();
    });
}

// Handle payment success
async function processPaymentSuccess(orderData, orderDocId, razorpayResponse) {
    console.log('Processing payment success for order:', orderDocId);
    
    try {
        // Update order status to paid
        if (orderDocId && db) {
            await db.collection('orders').doc(orderDocId).update({
                paymentStatus: 'paid',
                razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                razorpayOrderId: razorpayResponse.razorpay_order_id,
                razorpaySignature: razorpayResponse.razorpay_signature,
                status: 'ordered',
                paidAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Order updated as paid');
            
            // Update user's orders if logged in
            if (currentUser) {
                await db.collection('users').doc(currentUser.uid).collection('orders').doc(orderDocId).update({
                    paymentStatus: 'paid',
                    razorpayPaymentId: razorpayResponse.razorpay_payment_id,
                    razorpayOrderId: razorpayResponse.razorpay_order_id,
                    status: 'ordered',
                    paidAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
        
        // Clear cart
        await clearCartAfterOrder();
        
        // Reset payment processing flag
        isProcessingPayment = false;
        
        // Show success popup
        const updatedOrderData = {
            ...orderData,
            id: orderDocId,
            orderId: orderData.orderId,
            status: 'ordered',
            paymentStatus: 'paid',
            paidAt: new Date().toISOString(),
            total: orderData.total || (window.originalTotal - window.currentDiscount)
        };
        
        console.log('Calling showOrderSuccessPopup...');
        
        // Call success popup function
        if (typeof showOrderSuccessPopup === 'function') {
            showOrderSuccessPopup(updatedOrderData);
            console.log('Success popup should be visible now');
        } else {
            console.error('showOrderSuccessPopup function not found!');
            alert(`Order confirmed successfully! Order ID: ${updatedOrderData.orderId}`);
            window.location.href = 'index.html';
        }
        
    } catch (error) {
        console.error('Error processing payment success:', error);
        showNotification('Error updating order status. Please contact support.', 'error');
        
        // Reset payment processing flag
        isProcessingPayment = false;
        
        throw error;
    }
}

// Handle payment failure
async function handlePaymentFailure(response, orderDocId) {
    console.error('Payment failed:', response.error);
    
    // Update order with failed status
    if (orderDocId && db) {
        try {
            await db.collection('orders').doc(orderDocId).update({
                paymentStatus: 'failed',
                paymentError: response.error,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Order marked as failed');
            
        } catch (error) {
            console.error('Error updating failed payment:', error);
        }
    }
    
    // Show error to user
    showNotification(`Payment failed: ${response.error.description}`, 'error');
    
    // Reset payment processing flag
    isProcessingPayment = false;
}

// Handle payment error
function handlePaymentError(error, orderDocId) {
    console.error('Payment error:', error);
    
    let errorMessage = 'Payment failed. ';
    
    if (error.message.includes('cancelled')) {
        errorMessage = 'Payment was cancelled.';
    } else if (error.message.includes('verification')) {
        errorMessage += 'Verification failed. Please contact support.';
    } else {
        errorMessage += error.message;
    }
    
    showNotification(errorMessage, 'error');
    isProcessingPayment = false;
}

// Handle payment cancellation
async function handlePaymentCancellation(orderDocId) {
    console.log('Payment cancelled by user');
    
    // Update order status if needed
    if (orderDocId && db) {
        try {
            await db.collection('orders').doc(orderDocId).update({
                paymentStatus: 'cancelled',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating cancelled order:', error);
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

// Enhanced saveOrderToFirestore function
async function saveOrderToFirestore(orderData) {
    return new Promise(async (resolve, reject) => {
        try {
            // Save to main orders collection
            const orderRef = await db.collection('orders').add(orderData);
            console.log('Order saved to main collection:', orderRef.id);
            
            // Save to user's orders if logged in
            if (currentUser) {
                await db.collection('users').doc(currentUser.uid).collection('orders').doc(orderRef.id).set({
                    ...orderData,
                    id: orderRef.id
                }, { merge: true });
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
                // Continue anyway
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
        // Don't throw, as this shouldn't prevent order success
    }
}

// Order success popup functions
function showOrderSuccessPopup(orderData) {
    console.log('showOrderSuccessPopup called with:', orderData);
    
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) {
        console.error('Order success modal not found!');
        createOrderSuccessModal();
        setTimeout(() => showOrderSuccessPopup(orderData), 100);
        return;
    }
    
    // Set order details
    const successOrderId = document.getElementById('successOrderId');
    const successOrderDate = document.getElementById('successOrderDate');
    const successOrderTotal = document.getElementById('successOrderTotal');
    
    if (successOrderId) {
        successOrderId.textContent = orderData.orderId || orderData.orderNumber || orderData.id;
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
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
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
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
        }
    };
    
    // Close with Escape key - REDIRECT TO INDEX.HTML
    const closeOnEscape = function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
            
            document.removeEventListener('keydown', closeOnEscape);
        }
    };
    
    document.removeEventListener('keydown', closeOnEscape);
    document.addEventListener('keydown', closeOnEscape);
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
}

function createOrderSuccessModal() {
    console.log('Creating order success modal dynamically');
    
    const modalHTML = `
    <div id="orderSuccessModal" class="order-success-modal">
        <div class="order-success-content">
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
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Close popup function
function closeOrderSuccessPopup() {
    const modal = document.getElementById('orderSuccessModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `checkout-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="close-notification">&times;</button>
    `;
    
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
    `;
    document.head.appendChild(style);
    
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
    
    document.body.appendChild(notification);
    
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

// Add button animation function
function addButtonAnimation(button) {
    button.classList.add('processing');
    button.style.transform = 'scale(0.98)';
    button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    // Add ripple effect
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: 0;
        top: 0;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Make functions available globally
window.updateCheckoutUI = updateCheckoutUI;
window.loadUserDefaultAddress = loadUserDefaultAddress;
window.updateOrderSummary = updateOrderSummary;
window.refreshPromoCodes = refreshPromoCodes;
window.applyPromoCode = applyPromoCode;
window.removePromoCode = removePromoCode;
window.selectPromoCode = selectPromoCode;
window.processCheckout = processCheckout;
window.showNotification = showNotification;
window.showOrderSuccessPopup = showOrderSuccessPopup;
window.closeOrderSuccessPopup = closeOrderSuccessPopup;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing checkout...');
    
    // Initialize checkout page if on checkout page
    if (document.querySelector('.checkout-section')) {
        console.log('Checkout section found, initializing...');
        initCheckoutPage();
    }
});
