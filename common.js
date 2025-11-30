// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDuF6bdqprddsE871GuOablXPYqXI_HJxc",
    authDomain: "hexahoney-96aed.firebaseapp.com",
    projectId: "hexahoney-96aed",
    storageBucket: "hexahoney-96aed.firebasestorage.app",
    messagingSenderId: "700458850837",
    appId: "1:700458850837:web:0eb4fca98a5f4acc2d0c1c",
    measurementId: "G-MQGKK9709H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global State variables
let currentUser = null;
let likedProducts = [];
let cartProducts = [];
let userOrders = [];
let currentModalView = 'login';

// Product data (common across pages)
const products = [
    { 
        id: 1, 
        name: "Natura Agmark Honey", 
        price: 249, 
        weight: "1Kg",
        image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_gyalrfgyalrfgyal.jpg?updatedAt=1757217705022",
        category: "crystal"
    },
    { 
        id: 2, 
        name: "Natura Agmark Honey", 
        price: 449, 
        weight: "500g",
        image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_i8jo3di8jo3di8jo.jpg?updatedAt=1757217705026",
        category: "crystal"
    },
    { 
        id: 3, 
        name: "Natura Agmark Honey", 
        price: 149, 
        weight: "100g",
        image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_imbwdcimbwdcimbw.jpg?updatedAt=1757217705115",
        category: "crystal"
    },
    { 
        id: 4, 
        name: "Natura Agmark Honey", 
        price: 349, 
        weight: "50g",
        image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_i8jo3di8jo3di8jo4.jpg?updatedAt=1757217704864",
        category: "crystal"
    },
    { 
        id: 5, 
        name: "Natura Agmark Honey", 
        price: 199, 
        weight: "1Kg",
        image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_84o9o484o9o484o9.jpg?updatedAt=1757217704894",
        category: "premium"
    },
    { 
        id: 6, 
        name: "Natura Agmark Honey - Premium Pet", 
        price: 329, 
        weight: "500g",
        image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_cbat36cbat36cbat.jpg?updatedAt=1757217704908",
        category: "premium"
    }
];

// DOM Elements (common across pages)
const notificationBar = document.getElementById('notificationBar');
const navBar = document.getElementById('navBar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const likeIcon = document.getElementById('likeIcon');
const likeCount = document.getElementById('likeCount');
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const whatsappIcon = document.getElementById('whatsappIcon');
const userIcon = document.getElementById('userIcon');
const userDropdown = document.getElementById('userDropdown');
const profileLink = document.getElementById('profileLink');
const logoutLink = document.getElementById('logoutLink');

// Sidebars and Modals
const likesSidebar = document.getElementById('likesSidebar');
const closeLikes = document.getElementById('closeLikes');
const likesItems = document.getElementById('likesItems');
const emptyLikes = document.getElementById('emptyLikes');
const browseProducts = document.getElementById('browseProducts');

const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const emptyCart = document.getElementById('emptyCart');
const cartSummary = document.getElementById('cartSummary');
const checkoutBtn = document.getElementById('checkoutBtn');
const continueShopping = document.getElementById('continueShopping');

const overlay = document.getElementById('overlay');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const backBtn = document.getElementById('backBtn');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const forgotForm = document.getElementById('forgotForm');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const resetBtn = document.getElementById('resetBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const forgotPassword = document.getElementById('forgotPassword');
const signUp = document.getElementById('signUp');
const loginFooter = document.getElementById('loginFooter');
const termsCheckbox = document.getElementById('termsCheckbox');

// =============================================
// ORDER TRACKING FUNCTIONS
// =============================================

// Function to open order tracking with specific order
function showOrderTracking(orderId) {
    const orderTrackingSection = document.getElementById('orderTrackingSection');
    const profilePage = document.getElementById('profilePage');
    const mainContent = document.getElementById('mainContent');
    
    // Hide other sections
    if (profilePage && profilePage.classList.contains('active')) {
        profilePage.classList.remove('active');
    }
    if (mainContent) {
        mainContent.style.display = 'none';
    }
    
    // Show order tracking
    if (orderTrackingSection) {
        orderTrackingSection.classList.add('active');
        
        // Load the order data
        if (orderId) {
            loadOrderTrackingData(orderId);
        }
    }
}

// Close order tracking
function closeOrderTracking() {
    const orderTrackingSection = document.getElementById('orderTrackingSection');
    const mainContent = document.getElementById('mainContent');
    
    if (orderTrackingSection) {
        orderTrackingSection.classList.remove('active');
    }
    if (mainContent) {
        mainContent.style.display = 'block';
    }
}

// Load order tracking data from Firebase
function loadOrderTrackingData(orderId) {
    if (!orderId) return;
    
    // Show loading state
    document.getElementById('tracking-order-id').textContent = 'Loading...';
    document.getElementById('tracking-order-date').textContent = 'Loading...';
    document.getElementById('tracking-estimated-delivery').textContent = 'Loading...';
    
    const db = firebase.firestore();
    
    // First try to find order in main orders collection
    db.collection("orders").doc(orderId).get()
        .then((doc) => {
            if (doc.exists) {
                displayOrderTrackingData(doc.data(), orderId);
            } else {
                // If not found in main orders, search in user orders
                searchOrderInUserCollections(orderId);
            }
        })
        .catch((error) => {
            console.error("Error loading order:", error);
            showTrackingError("Failed to load order details");
        });
}

// Search for order in user collections
function searchOrderInUserCollections(orderId) {
    const db = firebase.firestore();
    
    if (!currentUser) {
        showTrackingError("Please log in to view order details");
        return;
    }
    
    db.collection("users").doc(currentUser.uid).collection("orders").doc(orderId).get()
        .then((orderDoc) => {
            if (orderDoc.exists) {
                displayOrderTrackingData(orderDoc.data(), orderId);
            } else {
                showTrackingError("Order not found");
            }
        })
        .catch((error) => {
            console.error("Error searching user orders:", error);
            showTrackingError("Failed to search for order");
        });
}

// Display order tracking data
function displayOrderTrackingData(orderData, orderId) {
    // Update order info
    document.getElementById('tracking-order-id').textContent = `#${orderId.substring(0, 8).toUpperCase()}`;
    
    // Format and display dates
    if (orderData.createdAt) {
        const orderDate = orderData.createdAt.toDate ? orderData.createdAt.toDate() : new Date(orderData.createdAt);
        document.getElementById('tracking-order-date').textContent = formatDate(orderDate);
        
        // Calculate estimated delivery (7 days from order date)
        const estimatedDate = new Date(orderDate);
        estimatedDate.setDate(estimatedDate.getDate() + 7);
        document.getElementById('tracking-estimated-delivery').textContent = formatDate(estimatedDate);
    } else {
        document.getElementById('tracking-order-date').textContent = 'N/A';
        document.getElementById('tracking-estimated-delivery').textContent = 'N/A';
    }
    
    // Update status timeline
    updateStatusTimeline(orderData);
    
    // Update order items and summary
    updateOrderDetails(orderData);
    
    // Update progress bar
    updateProgressBar(orderData.status);
}

// Update status timeline based on order data
function updateStatusTimeline(orderData) {
    // Reset all steps
    const steps = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
    steps.forEach(step => {
        const stepElement = document.getElementById(`step-${step}`);
        const dateElement = document.getElementById(`date-${step}`);
        
        if (stepElement) {
            stepElement.classList.remove('completed', 'active');
        }
        if (dateElement) {
            dateElement.textContent = '-';
        }
    });
    
    // Set status dates from order data
    if (orderData.statusDates) {
        Object.keys(orderData.statusDates).forEach(status => {
            const dateElement = document.getElementById(`date-${status}`);
            if (dateElement && orderData.statusDates[status]) {
                const statusDate = orderData.statusDates[status].toDate ? 
                    orderData.statusDates[status].toDate() : new Date(orderData.statusDates[status]);
                dateElement.textContent = formatDateTime(statusDate);
            }
        });
    }
    
    // Set current status
    const currentStatus = orderData.status || 'pending';
    const statusOrder = {
        'pending': ['placed'],
        'confirmed': ['placed', 'confirmed'],
        'processing': ['placed', 'confirmed', 'processing'],
        'shipped': ['placed', 'confirmed', 'processing', 'shipped'],
        'delivered': ['placed', 'confirmed', 'processing', 'shipped', 'delivered']
    };
    
    const completedSteps = statusOrder[currentStatus] || [];
    
    completedSteps.forEach(step => {
        const stepElement = document.getElementById(`step-${step}`);
        if (stepElement) {
            stepElement.classList.add('completed');
        }
    });
    
    // Set active step (if not delivered)
    if (currentStatus !== 'delivered' && completedSteps.length > 0) {
        const activeStep = completedSteps[completedSteps.length - 1];
        const stepElement = document.getElementById(`step-${activeStep}`);
        if (stepElement) {
            stepElement.classList.add('active');
        }
    }
}

// Update progress bar based on status
function updateProgressBar(status) {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;
    
    const progressMap = {
        'pending': 0,
        'confirmed': 25,
        'processing': 50,
        'shipped': 75,
        'delivered': 100
    };
    
    const progressPercentage = progressMap[status] || 0;
    
    if (window.innerWidth > 640) {
        progressBar.style.width = `${progressPercentage}%`;
    } else {
        progressBar.style.height = `${progressPercentage}%`;
    }
}

// Update order details section
function updateOrderDetails(orderData) {
    const itemsContainer = document.getElementById('tracking-order-items');
    const subtotalElement = document.getElementById('tracking-subtotal');
    const shippingElement = document.getElementById('tracking-shipping');
    const totalElement = document.getElementById('tracking-total');
    
    if (!itemsContainer) return;
    
    // Clear existing items
    itemsContainer.innerHTML = '';
    
    // Add order items
    if (orderData.items && orderData.items.length > 0) {
        orderData.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="order-item-image">
                    <i class="fas fa-jar"></i>
                </div>
                <div class="order-item-details">
                    <div class="order-item-name">${product ? product.name : 'Product'}</div>
                    <div class="order-item-meta">${product ? product.weight : ''} • Qty: ${item.quantity || 1}</div>
                </div>
                <div class="order-item-price">₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
            `;
            itemsContainer.appendChild(itemElement);
        });
    } else {
        itemsContainer.innerHTML = '<div class="muted">No items found</div>';
    }
    
    // Update summary
    const subtotal = orderData.subtotal || orderData.total || 0;
    const shipping = orderData.shipping || 0;
    const total = orderData.total || subtotal + shipping;
    
    if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `₹${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
}

// Utility functions for order tracking
function formatDate(date) {
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateTime(date) {
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showTrackingError(message) {
    alert('Tracking Error: ' + message);
}

// =============================================
// EXISTING FUNCTIONS (KEEPING ALL YOUR ORIGINAL CODE)
// =============================================

// Initialize Firebase Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        updateUIForUser(user);
        // Load profile data including addresses
        loadUserProfileData(user.uid);
    } else {
        currentUser = null;
        updateUIForGuest();
        // Reset profile-related elements if they exist
        const profilePage = document.getElementById('profilePage');
        const mainContent = document.getElementById('mainContent');
        if (profilePage && mainContent) {
            profilePage.classList.remove('active');
            mainContent.style.display = 'block';
        }
    }
});

// Update UI for logged in user - ENHANCED
function updateUIForUser(user) {
    userIcon.classList.add('logged-in');
    profileLink.style.display = 'block';
    
    // Update profile info if elements exist
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const editNameElement = document.getElementById('edit-name');
    const editEmailElement = document.getElementById('edit-email');
    const memberSinceElement = document.getElementById('member-since');
    
    if (userNameElement) userNameElement.textContent = user.displayName || 'User';
    if (userEmailElement) userEmailElement.textContent = user.email;
    if (editNameElement) editNameElement.value = user.displayName || '';
    if (editEmailElement) editEmailElement.value = user.email;
    
    // Update member since date
    if (memberSinceElement) {
        const memberSince = user.metadata.creationTime;
        memberSinceElement.textContent = new Date(memberSince).toLocaleDateString();
    }
}

// Update UI for guest
function updateUIForGuest() {
    userIcon.classList.remove('logged-in');
    profileLink.style.display = 'block';
    
    // Reset profile info if elements exist
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    
    if (userNameElement) userNameElement.textContent = 'User Name';
    if (userEmailElement) userEmailElement.textContent = 'user@example.com';
}

// Load only profile data (orders, addresses) from Firestore - NOT cart/likes
function loadUserProfileData(userId) {
    console.log('Loading profile data for user:', userId);
    
    // Load addresses if on profile page
    loadUserAddresses(userId);

    // Load orders if on profile page
    const ordersContainer = document.getElementById('orders-container');
    if (ordersContainer) {
        console.log('Loading orders...');
        db.collection('users').doc(userId).collection('orders').get()
            .then((querySnapshot) => {
                console.log('Orders loaded:', querySnapshot.size);
                ordersContainer.innerHTML = '';
                userOrders = [];
                
                if (querySnapshot.empty) {
ordersContainer.innerHTML = `
    <div class="empty-state">
        <i class="fas fa-shopping-bag"></i> No orders yet
    </div>
`;
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const order = doc.data();
                    order.id = doc.id;
                    userOrders.push(order);
                    displayOrder(order);
                });
            })
            .catch((error) => {
                console.error("Error loading orders:", error);
                ordersContainer.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Error loading orders</h3>
                        <p>Please try refreshing the page</p>
                        <button class="btn btn-sm" onclick="loadUserProfileData('${userId}')">Retry</button>
                    </div>
                `;
            });
    }
}

// Save checkout address to user's profile
function saveCheckoutAddressToProfile(firstName, lastName, address, city, state, zipCode, phone, isDefault) {
    if (!currentUser || !db) return;
    
    const fullName = `${firstName} ${lastName}`.trim();
    
    const newAddress = {
        label: 'Home', // Default label, you can customize this
        name: fullName,
        address: address,
        phone: phone.replace('+91 ', ''), // Remove country code for storage
        pincode: zipCode,
        city: city,
        state: state,
        country: 'India',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isDefault: isDefault
    };
    
    console.log('Saving checkout address to profile:', newAddress);
    
    // If setting as default, first remove default from all other addresses
    if (isDefault) {
        db.collection('users').doc(currentUser.uid).collection('addresses').get()
            .then((querySnapshot) => {
                const batch = db.batch();
                
                querySnapshot.forEach((doc) => {
                    const addressRef = db.collection('users').doc(currentUser.uid).collection('addresses').doc(doc.id);
                    batch.update(addressRef, { isDefault: false });
                });
                
                return batch.commit();
            })
            .then(() => {
                // Now add the new address as default
                return db.collection('users').doc(currentUser.uid).collection('addresses').add(newAddress);
            })
            .then((docRef) => {
                console.log('Default address saved with ID:', docRef.id);
                showNotification('Address saved as default in your profile!', 'success');
            })
            .catch((error) => {
                console.error("Error saving default address:", error);
                showNotification('Error saving address to profile: ' + error.message, 'error');
            });
    } else {
        // Just add the address without setting as default
        db.collection('users').doc(currentUser.uid).collection('addresses').add(newAddress)
            .then((docRef) => {
                console.log('Address saved with ID:', docRef.id);
                showNotification('Address saved to your profile!', 'success');
            })
            .catch((error) => {
                console.error("Error saving address:", error);
                showNotification('Error saving address to profile: ' + error.message, 'error');
            });
    }
}

// Load addresses from user's Firestore profile with better error handling
function loadUserAddresses(userId) {
    const addressesContainer = document.getElementById('addresses-container');
    if (!addressesContainer) {
        console.log('Addresses container not found');
        return;
    }
    
    console.log('Loading addresses for user:', userId);
    addressesContainer.innerHTML = '<div class="loading">Loading addresses...</div>';
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        db.collection('users').doc(userId).collection('addresses')
            .orderBy('createdAt', 'desc')
            .get()
            .then((querySnapshot) => {
                console.log('Addresses query result:', querySnapshot.size, 'addresses found');
                addressesContainer.innerHTML = '';
                
                if (querySnapshot.empty) {
        addressesContainer.innerHTML = `
    <div class="empty-state">
        <i class="fas fa-map-marker-alt"></i> No addresses saved
    </div>
`;
                    return;
                }
                
                querySnapshot.forEach((doc) => {
                    const address = doc.data();
                    console.log('Displaying address:', doc.id, address);
                    displayAddress(doc.id, address);
                });
            })
            .catch((error) => {
                console.error("Error loading addresses:", error);
                console.error("Error details:", error.code, error.message);
                
                // Check if it's a permissions error
                if (error.code === 'permission-denied') {
                    addressesContainer.innerHTML = `
                        <div class="error-state">
                            <i class="fas fa-shield-alt"></i>
                            <h3>Permission Denied</h3>
                            <p>Please check Firebase Firestore rules</p>
                            <button class="btn btn-sm" onclick="loadUserAddresses('${userId}')">Retry</button>
                        </div>
                    `;
                } else {
                    addressesContainer.innerHTML = `
                        <div class="error-state">
                            <i class="fas fa-exclamation-circle"></i>
                            <h3>Error loading addresses</h3>
                            <p>${error.message}</p>
                            <button class="btn btn-sm" onclick="loadUserAddresses('${userId}')">Retry</button>
                        </div>
                    `;
                }
            });
    }, 100);
}

// Display address in profile with better UI
// Display address in profile with NEW fields
function displayAddress(addressId, address) {
    const addressesContainer = document.getElementById('addresses-container');
    if (!addressesContainer) {
        console.error('Addresses container not found for displaying address');
        return;
    }
    
    // Remove loading or empty states if present
    const loadingState = addressesContainer.querySelector('.loading, .empty-state, .error-state');
    if (loadingState) {
        loadingState.remove();
    }
    
    const addressCard = document.createElement('div');
    addressCard.className = 'address-card';
    addressCard.innerHTML = `
        <div class="address-header">
            <h3>
                ${address.label || 'Address'}
                ${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
            </h3>
            <span class="address-pincode">Pincode: ${address.pincode || 'N/A'}</span>
        </div>
        <div class="address-details">
            <p><strong>${address.name || 'No name'}</strong></p>
            <p><strong>Address:</strong> ${address.address || 'No address provided'}</p>
            <p><strong>City:</strong> ${address.city || 'N/A'}</p>
            <p><strong>State:</strong> ${address.state || 'N/A'}</p>
            <p><strong>Country:</strong> ${address.country || 'India'}</p>
            <p><strong>Phone:</strong> ${address.phone || 'N/A'}</p>
        </div>
        <div class="address-actions">
            ${!address.isDefault ? `
                <button class="btn btn-sm set-default-address-btn" data-id="${addressId}">
                    <i class="fas fa-star"></i> Set Default
                </button>
            ` : ''}
            <button class="btn btn-sm edit-address-btn" data-id="${addressId}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger delete-address-btn" data-id="${addressId}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
        <div class="address-form edit-address-form" id="edit-address-form-${addressId}" style="display: none;">
            <h4>Edit Address</h4>
            <div class="form-row">
                <div class="form-group">
                    <label for="edit-label-${addressId}">Address Label</label>
                    <input type="text" id="edit-label-${addressId}" value="${address.label || ''}" placeholder="Home, Work, etc.">
                </div>
                <div class="form-group">
                    <label for="edit-pincode-${addressId}">Pincode</label>
                    <input type="text" id="edit-pincode-${addressId}" value="${address.pincode || ''}" maxlength="6">
                </div>
            </div>
            <div class="form-group">
                <label for="edit-name-${addressId}">Full Name</label>
                <input type="text" id="edit-name-${addressId}" value="${address.name || ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="edit-country-${addressId}">Country</label>
                    <select id="edit-country-${addressId}" required>
                        <option value="">Select Country</option>
                        <option value="India" ${address.country === 'India' ? 'selected' : ''}>India</option>
                        <option value="United States" ${address.country === 'United States' ? 'selected' : ''}>United States</option>
                        <option value="United Kingdom" ${address.country === 'United Kingdom' ? 'selected' : ''}>United Kingdom</option>
                        <option value="Canada" ${address.country === 'Canada' ? 'selected' : ''}>Canada</option>
                        <option value="Australia" ${address.country === 'Australia' ? 'selected' : ''}>Australia</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-state-${addressId}">State</label>
                    <select id="edit-state-${addressId}" required>
                        <option value="">Select State</option>
                        <option value="Kerala" ${address.state === 'Kerala' ? 'selected' : ''}>Kerala</option>
                        <option value="Tamil Nadu" ${address.state === 'Tamil Nadu' ? 'selected' : ''}>Tamil Nadu</option>
                        <option value="Karnataka" ${address.state === 'Karnataka' ? 'selected' : ''}>Karnataka</option>
                        <option value="Maharashtra" ${address.state === 'Maharashtra' ? 'selected' : ''}>Maharashtra</option>
                        <option value="Delhi" ${address.state === 'Delhi' ? 'selected' : ''}>Delhi</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="edit-city-${addressId}">City</label>
                    <input type="text" id="edit-city-${addressId}" value="${address.city || ''}" placeholder="Enter city" required>
                </div>
                <div class="form-group">
                    <label for="edit-phone-${addressId}">Phone</label>
                    <input type="text" id="edit-phone-${addressId}" value="${address.phone || ''}" maxlength="10">
                </div>
            </div>
            <div class="form-group">
                <label for="edit-address-${addressId}">Address</label>
                <textarea id="edit-address-${addressId}" rows="3">${address.address || ''}</textarea>
            </div>
            <div class="form-actions">
                <button class="btn save-edit-address-btn" data-id="${addressId}">
                    <i class="fas fa-save"></i> Save Changes
                </button>
                <button class="btn btn-outline cancel-edit-address-btn" data-id="${addressId}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    addressesContainer.appendChild(addressCard);
    
    // Add event listeners
    attachAddressEventListeners(addressId);
}

// Attach event listeners to address actions
function attachAddressEventListeners(addressId) {
    setTimeout(() => {
        // Edit button
        const editBtn = document.querySelector(`.edit-address-btn[data-id="${addressId}"]`);
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                document.getElementById(`edit-address-form-${addressId}`).style.display = 'block';
            });
        }
        
        // Delete button
        const deleteBtn = document.querySelector(`.delete-address-btn[data-id="${addressId}"]`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this address?')) {
                    deleteAddressFromFirestore(addressId);
                }
            });
        }
        
        // Save edited address button
        const saveBtn = document.querySelector(`.save-edit-address-btn[data-id="${addressId}"]`);
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                saveEditedAddressToFirestore(addressId);
            });
        }
        
        // Cancel edit button
        const cancelBtn = document.querySelector(`.cancel-edit-address-btn[data-id="${addressId}"]`);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                document.getElementById(`edit-address-form-${addressId}`).style.display = 'none';
            });
        }
        
        // Set default address button
        const setDefaultBtn = document.querySelector(`.set-default-address-btn[data-id="${addressId}"]`);
        if (setDefaultBtn) {
            setDefaultBtn.addEventListener('click', function() {
                setDefaultAddress(addressId);
            });
        }
    }, 100);
}

// Save new address to user's profile in Firestore - UPDATED for new fields
function saveNewAddressToProfile() {
    const label = document.getElementById('new-label').value.trim();
    const name = document.getElementById('new-name').value.trim();
    const address = document.getElementById('new-address').value.trim();
    const phone = document.getElementById('new-phone').value.trim();
    const pincode = document.getElementById('new-pincode').value.trim();
    const city = document.getElementById('new-city').value.trim();
    const state = document.getElementById('new-state').value;
    const country = document.getElementById('new-country').value;
    
    if (!label || !name || !address || !phone || !pincode || !city || !state || !country) {
        alert('Please fill in all fields');
        return;
    }
    
    // Validate phone number (basic validation)
    if (phone.length < 10 || !/^\d+$/.test(phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Validate pincode (basic validation)
    if (pincode.length < 6 || !/^\d+$/.test(pincode)) {
        alert('Please enter a valid 6-digit pincode');
        return;
    }
    
    if (!currentUser) {
        alert('Please log in to save addresses');
        showLoginView();
        loginModal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        return;
    }
    
    const newAddress = {
        label: label,
        name: name,
        address: address,
        phone: phone,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        isDefault: false
    };
    
    console.log('Saving new address:', newAddress);
    
    // Save to Firestore under user's addresses collection
    db.collection('users').doc(currentUser.uid).collection('addresses').add(newAddress)
        .then((docRef) => {
            console.log('Address saved with ID:', docRef.id);
            
            // Add the new address to the UI
            displayAddress(docRef.id, newAddress);
            
            // Reset the form
            const addAddressForm = document.getElementById('add-address-form');
            if (addAddressForm) {
                addAddressForm.style.display = 'none';
            }
            document.getElementById('new-label').value = '';
            document.getElementById('new-name').value = '';
            document.getElementById('new-address').value = '';
            document.getElementById('new-phone').value = '';
            document.getElementById('new-pincode').value = '';
            document.getElementById('new-city').value = '';
            document.getElementById('new-state').value = '';
            document.getElementById('new-country').value = 'India';
            
            // Show success message
            showNotification('Address saved successfully!', 'success');
        })
        .catch((error) => {
            console.error("Error adding address:", error);
            showNotification('Error saving address: ' + error.message, 'error');
        });
}

// Save edited address to Firestore - UPDATED for new fields
function saveEditedAddressToFirestore(addressId) {
    const label = document.getElementById(`edit-label-${addressId}`).value.trim();
    const name = document.getElementById(`edit-name-${addressId}`).value.trim();
    const address = document.getElementById(`edit-address-${addressId}`).value.trim();
    const phone = document.getElementById(`edit-phone-${addressId}`).value.trim();
    const pincode = document.getElementById(`edit-pincode-${addressId}`).value.trim();
    const city = document.getElementById(`edit-city-${addressId}`).value.trim();
    const state = document.getElementById(`edit-state-${addressId}`).value;
    const country = document.getElementById(`edit-country-${addressId}`).value;
    
    if (!label || !name || !address || !phone || !pincode || !city || !state || !country) {
        alert('Please fill in all fields');
        return;
    }
    
    const updatedAddress = {
        label: label,
        name: name,
        address: address,
        phone: phone,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(currentUser.uid).collection('addresses').doc(addressId).update(updatedAddress)
        .then(() => {
            // Refresh addresses display
            const addressesContainer = document.getElementById('addresses-container');
            if (addressesContainer) {
                addressesContainer.innerHTML = '';
                loadUserAddresses(currentUser.uid);
            }
            showNotification('Address updated successfully!', 'success');
        })
        .catch((error) => {
            console.error("Error updating address:", error);
            showNotification('Error updating address: ' + error.message, 'error');
        });
}

// Delete address from Firestore
function deleteAddressFromFirestore(addressId) {
    db.collection('users').doc(currentUser.uid).collection('addresses').doc(addressId).delete()
        .then(() => {
            // Refresh addresses display
            const addressesContainer = document.getElementById('addresses-container');
            if (addressesContainer) {
                addressesContainer.innerHTML = '';
                loadUserAddresses(currentUser.uid);
            }
            showNotification('Address deleted successfully!', 'success');
        })
        .catch((error) => {
            console.error("Error deleting address:", error);
            showNotification('Error deleting address: ' + error.message, 'error');
        });
}

// Set default address
function setDefaultAddress(addressId) {
    // First, remove default from all addresses
    db.collection('users').doc(currentUser.uid).collection('addresses').get()
        .then((querySnapshot) => {
            const batch = db.batch();
            
            querySnapshot.forEach((doc) => {
                const addressRef = db.collection('users').doc(currentUser.uid).collection('addresses').doc(doc.id);
                if (doc.id === addressId) {
                    batch.update(addressRef, { isDefault: true });
                } else {
                    batch.update(addressRef, { isDefault: false });
                }
            });
            
            return batch.commit();
        })
        .then(() => {
            // Refresh addresses display
            const addressesContainer = document.getElementById('addresses-container');
            if (addressesContainer) {
                addressesContainer.innerHTML = '';
                loadUserAddresses(currentUser.uid);
            }
            showNotification('Default address set successfully!', 'success');
        })
        .catch((error) => {
            console.error("Error setting default address:", error);
            showNotification('Error setting default address: ' + error.message, 'error');
        });
}

// Display order in profile - UPDATED WITH TRACK ORDER BUTTON
function displayOrder(order) {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;
    
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    let orderItemsHTML = '';
    order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            orderItemsHTML += `
                <div class="order-items">
                    <div class="order-item-img">
                        <i class="fas fa-jar"></i>
                    </div>
                    <div class="order-item-info">
                        <div class="order-item-name">${product.name} - ${product.weight}</div>
                        <div class="order-item-qty">Quantity: ${item.quantity}</div>
                    </div>
                </div>
            `;
        }
    });
    
    orderCard.innerHTML = `
        <div class="order-header">
            <div>
                <span class="order-id">Order #${order.id.substring(0, 8)}</span>
                <span class="order-date">Placed on ${new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <span class="order-status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
        </div>
        ${orderItemsHTML}
        <div class="order-total">Total: ₹${order.total}</div>
        <div class="order-actions">
            <button class="btn btn-outline track-order-btn" data-id="${order.id}">
                <i class="fas fa-truck"></i> Track Order
            </button>
            <button class="btn reorder-btn" data-id="${order.id}">
                <i class="fas fa-redo"></i> Reorder
            </button>
        </div>
    `;
    
    ordersContainer.appendChild(orderCard);
    
    // Add event listeners
    setTimeout(() => {
        const trackBtn = orderCard.querySelector('.track-order-btn');
        const reorderBtn = orderCard.querySelector('.reorder-btn');
        
        if (trackBtn) {
            trackBtn.addEventListener('click', function() {
                showOrderTracking(order.id);
            });
        }
        
        if (reorderBtn) {
            reorderBtn.addEventListener('click', function() {
                reorderItems(order.items);
            });
        }
    }, 100);
}

// Reorder items
function reorderItems(items) {
    items.forEach(item => {
        addToCart(item.productId, item.quantity);
    });
    alert('Items added to cart!');
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    // Simple alert for now - you can enhance this with toast notifications
    if (type === 'error') {
        alert('Error: ' + message);
    } else {
        alert(message);
    }
}

// Close all sidebars and modals
function closeAllSidebars() {
    likesSidebar.classList.remove('active');
    cartSidebar.classList.remove('active');
    loginModal.classList.remove('active');
    
    // Close filter sidebar if it exists
    const filterSidebar = document.getElementById('filterSidebar');
    if (filterSidebar) {
        filterSidebar.classList.remove('active');
    }
    
    // Close quick view modal if it exists
    const quickViewModal = document.getElementById('quickViewModal');
    if (quickViewModal) {
        quickViewModal.style.display = 'none';
    }
    
    // Close review modal if it exists
    const reviewModal = document.getElementById('reviewModal');
    if (reviewModal) {
        reviewModal.style.display = 'none';
    }
    
    // Close order tracking if open
    const orderTrackingSection = document.getElementById('orderTrackingSection');
    if (orderTrackingSection) {
        orderTrackingSection.classList.remove('active');
    }
    
    navLinks.classList.remove('active');
    userDropdown.classList.remove('active');
    
    // Reset hamburger icon
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
    
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Mobile menu functionality
mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    
    // Toggle hamburger icon to close icon
    const icon = mobileMenuBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset hamburger icon
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Overlay click to close modals
overlay.addEventListener('click', () => {
    closeAllSidebars();
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// User dropdown functionality
userIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentUser) {
        userDropdown.classList.toggle('active');
    } else {
        closeAllSidebars();
        showLoginView();
        loginModal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    userDropdown.classList.remove('active');
});

// Profile link functionality - ENHANCED
profileLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    userDropdown.classList.remove('active');
    if (currentUser) {
        // Show profile page if it exists
        const profilePage = document.getElementById('profilePage');
        const mainContent = document.getElementById('mainContent');
        if (profilePage && mainContent) {
            mainContent.style.display = 'none';
            profilePage.classList.add('active');
            // Load user data for profile page
            loadUserProfileData(currentUser.uid);
        } else {
            alert('Profile page would open here');
        }
    } else {
        closeAllSidebars();
        showLoginView();
        loginModal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
});

// Logout functionality
logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    auth.signOut().then(() => {
        alert('You have been logged out successfully!');
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
});

// Like icon functionality
likeIcon.addEventListener('click', () => {
    closeAllSidebars();
    likesSidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close likes sidebar
closeLikes.addEventListener('click', () => {
    closeAllSidebars();
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Update likes UI
function updateLikeUI() {
    if (likedProducts.length > 0) {
        likeCount.textContent = likedProducts.length;
        likeCount.classList.remove('hidden');
    } else {
        likeCount.classList.add('hidden');
    }
    
    if (likedProducts.length === 0) {
        emptyLikes.style.display = 'flex';
        likesItems.innerHTML = '';
    } else {
        emptyLikes.style.display = 'none';
        likesItems.innerHTML = '';
        
        likedProducts.forEach(productId => {
            const product = products.find(p => p.id === productId);
            if (product) {
                const likeItem = document.createElement('div');
                likeItem.className = 'like-item';
                likeItem.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="like-item-details">
                        <div class="like-item-title">${product.name}</div>
                        <div class="like-item-price">₹${product.price}</div>
                        <div class="like-item-actions">
                            <button class="add-to-cart-btn" data-id="${product.id}">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                            <button class="remove-like" data-id="${product.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
                likesItems.appendChild(likeItem);
            }
        });
        
        // Add event listeners for like items
        document.querySelectorAll('.remove-like').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-id'));
                removeFromLikes(productId);
            });
        });
        
        document.querySelectorAll('.likes-items .add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-id'));
                addToCart(productId, 1);
            });
        });
    }
}

// Add to likes with auto-open sidebar
function addToLikes(productId) {
    if (!likedProducts.includes(productId)) {
        likedProducts.push(productId);
        
        // Save ONLY to localStorage (no Firestore saving)
        localStorage.setItem('guestLikes', JSON.stringify(likedProducts));
        
        updateLikeUI();
        
        const heartIcon = likeIcon.querySelector('i');
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        heartIcon.style.color = '#ff4d4d';
        
        // Auto-open likes sidebar when adding to favorites (close others first)
        closeAllSidebars();
        likesSidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Remove from likes
function removeFromLikes(productId) {
    likedProducts = likedProducts.filter(id => id !== productId);
    
    // Update ONLY localStorage (no Firestore update)
    localStorage.setItem('guestLikes', JSON.stringify(likedProducts));
    
    updateLikeUI();
    
    if (likedProducts.length === 0) {
        const heartIcon = likeIcon.querySelector('i');
        heartIcon.classList.remove('fas');
        heartIcon.classList.add('far');
        heartIcon.style.color = '';
    }
}

// Cart functionality
cartIcon.addEventListener('click', () => {
    closeAllSidebars();
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close cart sidebar
closeCart.addEventListener('click', () => {
    closeAllSidebars();
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Update cart UI
function updateCartUI() {
    const totalItems = cartProducts.reduce((total, item) => total + item.quantity, 0);
    
    if (totalItems > 0) {
        cartCount.textContent = totalItems;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }
    
    if (cartProducts.length === 0) {
        emptyCart.style.display = 'flex';
        cartItems.innerHTML = '';
        cartSummary.style.display = 'none';
    } else {
        emptyCart.style.display = 'none';
        cartItems.innerHTML = '';
        cartSummary.style.display = 'block';
        
        let subtotal = 0;
        
        cartProducts.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${product.name}</div>
                        <div class="cart-item-price">₹${product.price}</div>
                        <div class="cart-item-controls">
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus" data-id="${product.id}">-</button>
                                <input type="text" class="quantity-input" value="${item.quantity}" data-id="${product.id}">
                                <button class="quantity-btn plus" data-id="${product.id}">+</button>
                            </div>
                            <button class="delete-item" data-id="${product.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                cartItems.appendChild(cartItem);
            }
        });
        
        // Update cart totals
        const cartSubtotal = document.querySelector('.cart-subtotal span:last-child');
        const cartTotal = document.querySelector('.cart-total span:last-child');
        
        if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal}`;
        if (cartTotal) cartTotal.textContent = `₹${subtotal}`;
        
        // Add event listeners for cart items
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-id'));
                updateCartQuantity(productId, -1);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-id'));
                updateCartQuantity(productId, 1);
            });
        });
        
        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
        
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-id'));
                const newQuantity = parseInt(e.currentTarget.value) || 1;
                setCartQuantity(productId, newQuantity);
            });
        });
    }
}

// Enhanced Add to cart function with effects and auto-open sidebar
function addToCart(productId, quantity = 1) {
    const existingItem = cartProducts.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cartProducts.push({ id: productId, quantity });
    }
    
    // Save ONLY to localStorage (no Firestore saving)
    localStorage.setItem('guestCart', JSON.stringify(cartProducts));
    
    updateCartUI();
    addCartVisualFeedback();
    
    // Auto-open cart sidebar when adding to cart (close others first)
    closeAllSidebars();
    cartSidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Visual feedback for adding to cart
function addCartVisualFeedback() {
    cartIcon.classList.add('cart-icon-bounce');
    cartCount.classList.add('badge-pulse');
    
    setTimeout(() => {
        cartIcon.classList.remove('cart-icon-bounce');
        cartCount.classList.remove('badge-pulse');
    }, 600);
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const item = cartProducts.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            // Update ONLY localStorage (no Firestore update)
            localStorage.setItem('guestCart', JSON.stringify(cartProducts));
            
            updateCartUI();
        }
    }
}

// Set cart quantity
function setCartQuantity(productId, quantity) {
    const item = cartProducts.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            
            // Update ONLY localStorage (no Firestore update)
            localStorage.setItem('guestCart', JSON.stringify(cartProducts));
            
            updateCartUI();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cartProducts = cartProducts.filter(item => item.id !== productId);
    
    // Update ONLY localStorage (no Firestore update)
    localStorage.setItem('guestCart', JSON.stringify(cartProducts));
    
    updateCartUI();
}

// WhatsApp functionality
whatsappIcon.addEventListener('click', () => {
    const phoneNumber = "919876543210";
    const message = "Hello, I'm interested in your honey products!";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});

// Close login modal
closeLogin.addEventListener('click', () => {
    closeAllSidebars();
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Back button functionality
backBtn.addEventListener('click', () => {
    showLoginView();
});

// Show login view
function showLoginView() {
    currentModalView = 'login';
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    forgotForm.classList.remove('active');
    backBtn.classList.remove('active');
    modalTitle.textContent = 'Welcome Back';
    modalSubtitle.textContent = 'Sign in to your account';
    loginFooter.style.display = 'block';
}

// Show signup view
function showSignupView() {
    currentModalView = 'signup';
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
    forgotForm.classList.remove('active');
    backBtn.classList.add('active');
    modalTitle.textContent = 'Create Account';
    modalSubtitle.textContent = 'Join Natura Honey today';
    loginFooter.style.display = 'none';
}

// Show forgot password view
function showForgotView() {
    currentModalView = 'forgot';
    loginForm.classList.remove('active');
    signupForm.classList.remove('active');
    forgotForm.classList.add('active');
    backBtn.classList.add('active');
    modalTitle.textContent = 'Reset Password';
    modalSubtitle.textContent = 'Enter your email to reset your password';
    loginFooter.style.display = 'none';
}

// Login functionality
loginBtn.addEventListener('click', () => {
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
        const user = userCredential.user;

        await db.collection("users").doc(user.uid).set({
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            phone: user.phoneNumber || null
        }, { merge: true });

        closeAllSidebars();
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        alert('Login successful!');
    })

        .catch((error) => {
            console.error("Error signing in:", error);
            alert('Error signing in: ' + error.message);
        });
});

// Signup functionality
signupBtn.addEventListener('click', () => {
    const name = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;
    
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!termsCheckbox.checked) {
        alert('Please agree to the Terms & Conditions and Privacy Policy');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Update profile with display name
            return user.updateProfile({
                displayName: name
            }).then(() => {
                // Send email verification
                return user.sendEmailVerification();
            }).then(() => {
                // Create user document in Firestore (only for profile data)
                return db.collection('users').doc(user.uid).set({
                    displayName: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
        })
        .then(() => {
            closeAllSidebars();
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            alert('Account created successfully! Please check your email for verification.');
        })
        .catch((error) => {
            console.error("Error creating account:", error);
            alert('Error creating account: ' + error.message);
        });
});

// Reset password functionality
resetBtn.addEventListener('click', () => {
    const email = forgotForm.querySelector('input[type="email"]').value;
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            closeAllSidebars();
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            alert('Password reset link sent to your email!');
        })
        .catch((error) => {
            console.error("Error sending reset email:", error);
            alert('Error sending reset email: ' + error.message);
        });
});

// Google login
googleLoginBtn.addEventListener('click', () => {
    // Check if we're in a supported environment
    if (window.location.protocol !== 'https:' && window.location.protocol !== 'http:' && !window.location.hostname.includes('localhost')) {
        alert('Google login is not supported in this environment. Please use email/password login instead.');
        return;
    }
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
    .then(async (result) => {
    const user = result.user;

    await db.collection("users").doc(user.uid).set({
        displayName: user.displayName,
        email: user.email,
        phone: user.phoneNumber || null,
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
})

            .then(() => {
                closeAllSidebars();
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
                alert('Google login successful!');
            })
            .catch((error) => {
                console.error("Error with Google login:", error);
                if (error.code === 'auth/operation-not-supported-in-this-environment') {
                    alert('Google login is not supported in this environment. Please use email/password login instead.');
                } else {
                    alert('Error with Google login: ' + error.message);
                }
            });
    } catch (error) {
        console.error("Error with Google login:", error);
        alert('Google login is not available in this environment. Please use email/password login instead.');
    }
});

// Forgot password link
forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    showForgotView();
});

// Sign up link
signUp.addEventListener('click', (e) => {
    e.preventDefault();
    showSignupView();
});

// Checkout button - REDIRECT TO CHECKOUT.HTML
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cartProducts.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Save cart data to localStorage for checkout page
        localStorage.setItem('checkoutCart', JSON.stringify(cartProducts));
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    });
}

// Continue shopping button
if (continueShopping) {
    continueShopping.addEventListener('click', function() {
        window.location.href = "shop.html";
    });
}

// Browse products button
browseProducts.addEventListener('click', () => {
    closeAllSidebars();
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Load guest data from localStorage
function loadGuestData() {
    // Load liked products
    const guestLikes = localStorage.getItem('guestLikes');
    if (guestLikes) {
        likedProducts = JSON.parse(guestLikes);
        updateLikeUI();
    }
    
    // Load cart items
    const guestCart = localStorage.getItem('guestCart');
    if (guestCart) {
        cartProducts = JSON.parse(guestCart);
        updateCartUI();
    }
}

// Hide notification bar on scroll down
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 5) {
        if (!notificationBar.classList.contains('hidden')) {
            notificationBar.classList.add('hidden');
            navBar.style.top = '0';
            document.querySelector('.content-wrapper').style.marginTop = '130px';
        }
    } else {
        if (notificationBar.classList.contains('hidden')) {
            notificationBar.classList.remove('hidden');
            navBar.style.top = '40px';
            document.querySelector('.content-wrapper').style.marginTop = '165px';
        }
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, { passive: true });

// Initialize common functionality
function initCommon() {
    loadGuestData();
    
    // Initialize profile close button if it exists
    const profileCloseBtn = document.getElementById('profileCloseBtn');
    if (profileCloseBtn) {
        profileCloseBtn.addEventListener('click', () => {
            const profilePage = document.getElementById('profilePage');
            const mainContent = document.getElementById('mainContent');
            if (profilePage && mainContent) {
                profilePage.classList.remove('active');
                mainContent.style.display = 'block';
            }
        });
    }
    
    // Initialize order tracking close button
    const orderTrackingCloseBtn = document.getElementById('orderTrackingCloseBtn');
    if (orderTrackingCloseBtn) {
        orderTrackingCloseBtn.addEventListener('click', closeOrderTracking);
    }
    
    // Initialize order tracking refresh button
    const refreshTrackingBtn = document.getElementById('refreshTrackingBtn');
    if (refreshTrackingBtn) {
        refreshTrackingBtn.addEventListener('click', function() {
            const currentOrderId = document.getElementById('tracking-order-id').textContent.replace('#', '');
            if (currentOrderId && currentOrderId !== 'Loading...') {
                loadOrderTrackingData(currentOrderId);
            }
        });
    }
    
    // Initialize order tracking support button
    const supportTrackingBtn = document.getElementById('supportTrackingBtn');
    if (supportTrackingBtn) {
        supportTrackingBtn.addEventListener('click', function() {
            window.location.href = 'contact.html';
        });
    }
    
    // Initialize profile edit functionality if elements exist
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditProfileModal = document.getElementById('close-edit-profile-modal');
    const cancelEditProfile = document.getElementById('cancel-edit-profile');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    
    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener('click', function() {
            editProfileModal.style.display = 'flex';
        });
    }
    
    if (closeEditProfileModal && editProfileModal) {
        closeEditProfileModal.addEventListener('click', function() {
            editProfileModal.style.display = 'none';
        });
    }
    
    if (cancelEditProfile && editProfileModal) {
        cancelEditProfile.addEventListener('click', function() {
            editProfileModal.style.display = 'none';
        });
    }
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function() {
            const newName = document.getElementById('edit-name').value;
            if (newName.trim() === '') {
                alert('Please enter a valid name');
                return;
            }
            
            currentUser.updateProfile({
                displayName: newName
            }).then(() => {
                // Update Firestore (only for profile data)
                return db.collection('users').doc(currentUser.uid).set({
                    displayName: newName,
                    email: currentUser.email,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }).then(() => {
                alert('Profile updated successfully!');
                editProfileModal.style.display = 'none';
                updateUIForUser(currentUser);
            }).catch((error) => {
                console.error("Error updating profile:", error);
                alert('Error updating profile. Please try again.');
            });
        });
    }
    
    // Initialize address functionality if elements exist
    const addAddressBtn = document.getElementById('add-address-btn');
    const addAddressForm = document.getElementById('add-address-form');
    const cancelNewAddress = document.getElementById('cancel-new-address');
    const saveNewAddress = document.getElementById('save-new-address');
    
    if (addAddressBtn && addAddressForm) {
        addAddressBtn.addEventListener('click', function() {
            addAddressForm.style.display = 'block';
        });
    }
    
    if (cancelNewAddress && addAddressForm) {
        cancelNewAddress.addEventListener('click', function() {
            addAddressForm.style.display = 'none';
            document.getElementById('new-label').value = '';
            document.getElementById('new-name').value = '';
            document.getElementById('new-address').value = '';
            document.getElementById('new-phone').value = '';
            document.getElementById('new-pincode').value = '';
        });
    }
    
    if (saveNewAddress) {
        saveNewAddress.addEventListener('click', saveNewAddressToProfile);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initCommon();
});
