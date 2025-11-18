let currentDiscount = 0;
let originalTotal = 0;

function initCheckoutPage() {
    updateOrderSummary();
    setupCheckoutEventListeners();
    
    if (currentUser) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = currentUser.email;
            emailInput.disabled = true;
        }
        const loginBtnCheckout = document.getElementById('loginBtnCheckout');
        if (loginBtnCheckout) {
            loginBtnCheckout.textContent = 'Logout';
        }
    } else {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.disabled = false;
        }
        const loginBtnCheckout = document.getElementById('loginBtnCheckout');
        if (loginBtnCheckout) {
            loginBtnCheckout.textContent = 'Login';
        }
    }
}

function toggleNotificationBar() {
  const notificationBar = document.getElementById('notificationBar');
  if (notificationBar) {
    notificationBar.classList.toggle('hidden');
  }
}
document.addEventListener('DOMContentLoaded', function() {

});

function setupCheckoutEventListeners() {
    const loginBtnCheckout = document.getElementById('loginBtnCheckout');
    const applyBtn = document.querySelector('.apply-btn');
    const checkoutBtnMain = document.querySelector('.checkout-btn');

    if (loginBtnCheckout) {
        loginBtnCheckout.addEventListener('click', function() {
            if (currentUser) {
                auth.signOut().then(() => {
                    window.location.reload();
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
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', applyPromoCode);
    }

    if (checkoutBtnMain) {
        checkoutBtnMain.addEventListener('click', processCheckout);
    }

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

function processCheckout() {
    const email = document.getElementById('email')?.value;
    const firstName = document.getElementById('firstName')?.value;
    const lastName = document.getElementById('lastName')?.value;
    const address = document.getElementById('address')?.value;
    const city = document.getElementById('city')?.value;
    const state = document.getElementById('state')?.value;
    const zipCode = document.getElementById('zipCode')?.value;
    const phone = document.getElementById('phone')?.value;

    if (!validateIndianPhoneNumber(phone)) {
        alert('Please enter a valid Indian phone number (10 digits starting with 6-9)');
        return;
    }      
    
    if (!email || !firstName || !lastName || !address || !city || !state || !zipCode || !phone) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (cartProducts.length === 0) {
        alert('Your cart is empty. Please add items to proceed.');
        return;
    }
    
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
    
    if (currentUser) {
        orderData.userId = currentUser.uid;
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
            
            alert(`Order created successfully! Order ID: ${docRef.id.substring(0, 8)}`);
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
    alert('Thank you for your order! You will be redirected to Razorpay to complete your payment.');
    
    setTimeout(() => {
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
            })
            .catch((error) => {
                console.error("Error updating order status:", error);
            });
        } else {
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
