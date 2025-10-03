script>
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

    // DOM Elements
    const notificationBar = document.getElementById('notificationBar');
    const navBar = document.getElementById('navBar');
    const likeIcon = document.getElementById('likeIcon');
    const likeCount = document.getElementById('likeCount');
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    const whatsappIcon = document.getElementById('whatsappIcon');
    const userIcon = document.getElementById('userIcon');
    const userDropdown = document.getElementById('userDropdown');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    
    // Layout Switcher Elements
    const desktopViewBtn = document.getElementById('desktopView');
    const mobileViewBtn = document.getElementById('mobileView');
    const body = document.body;
    
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
    const cartTotal = document.querySelector('.cart-total span:last-child');
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

    // Profile Page Elements
    const mainContent = document.getElementById('mainContent');
    const profilePage = document.getElementById('profilePage');
    const profileCloseBtn = document.getElementById('profileCloseBtn');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditProfileModal = document.getElementById('close-edit-profile-modal');
    const cancelEditProfile = document.getElementById('cancel-edit-profile');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const addAddressBtn = document.getElementById('add-address-btn');
    const addAddressForm = document.getElementById('add-address-form');
    const cancelNewAddress = document.getElementById('cancel-new-address');
    const saveNewAddress = document.getElementById('save-new-address');
    const addressesContainer = document.getElementById('addresses-container');
    const ordersContainer = document.getElementById('orders-container');

    // State variables
    let currentUser = null;
    let likedProducts = [];
    let cartProducts = [];
    let userOrders = [];
    let currentModalView = 'login';
    // Product data
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
        name: "Natura Agmark Honey", 
        price: 329, 
        weight: "500g",
        image: "https://ik.imagekit.io/hexaanatura/Gemini_Generated_Image_cbat36cbat36cbat.jpg?updatedAt=1757217704908",
        category: "premium"
      }
    ];

    // Initialize Firebase Auth State Listener
    auth.onAuthStateChanged((user) => {
      if (user) {
        currentUser = user;
        updateUIForUser(user);
        loadUserData(user.uid);
      } else {
        currentUser = null;
        updateUIForGuest();
      }
    });

    // Update UI for logged in user
    function updateUIForUser(user) {
      userIcon.classList.add('logged-in');
      
      // Update profile info
      document.getElementById('user-name').textContent = user.displayName || 'User';
      document.getElementById('user-email').textContent = user.email;
      document.getElementById('edit-name').value = user.displayName || '';
      document.getElementById('edit-email').value = user.email;
      
      // Show profile link
      profileLink.style.display = 'block';
      
      // Update member since date
      const memberSince = user.metadata.creationTime;
      document.getElementById('member-since').textContent = new Date(memberSince).toLocaleDateString();
    }

    // Update UI for guest
    function updateUIForGuest() {
      userIcon.classList.remove('logged-in');
      profileLink.style.display = 'block';
      
      // Reset profile info
      document.getElementById('user-name').textContent = 'User Name';
      document.getElementById('user-email').textContent = 'user@example.com';
    }

    // Load user data from Firestore
    function loadUserData(userId) {
      // Load liked products
      db.collection('users').doc(userId).collection('likes').get()
        .then((querySnapshot) => {
          likedProducts = [];
          querySnapshot.forEach((doc) => {
            likedProducts.push(doc.data().productId);
          });
          updateLikeUI();
        })
        .catch((error) => {
          console.error("Error loading liked products:", error);
        });

      // Load cart items
      db.collection('users').doc(userId).collection('cart').get()
        .then((querySnapshot) => {
          cartProducts = [];
          querySnapshot.forEach((doc) => {
            cartProducts.push({
              id: doc.data().productId,
              quantity: doc.data().quantity
            });
          });
          updateCartUI();
        })
        .catch((error) => {
          console.error("Error loading cart items:", error);
        });

      // Load addresses
      db.collection('users').doc(userId).collection('addresses').get()
        .then((querySnapshot) => {
          addressesContainer.innerHTML = '';
          querySnapshot.forEach((doc) => {
            const address = doc.data();
            displayAddress(doc.id, address);
          });
        })
        .catch((error) => {
          console.error("Error loading addresses:", error);
        });

      // Load orders
      db.collection('users').doc(userId).collection('orders').get()
        .then((querySnapshot) => {
          ordersContainer.innerHTML = '';
          userOrders = [];
          querySnapshot.forEach((doc) => {
            const order = doc.data();
            order.id = doc.id;
            userOrders.push(order);
            displayOrder(order);
          });
        })
        .catch((error) => {
          console.error("Error loading orders:", error);
        });
    }

    // Display address in profile
    function displayAddress(addressId, address) {
      const addressCard = document.createElement('div');
      addressCard.className = 'address-card';
      addressCard.innerHTML = `
        <h3>
          ${address.label} Address
          <span style="font-size: 14px; color: #777;">Pincode: ${address.pincode}</span>
        </h3>
        <p>${address.name}<br>${address.address.replace(/\n/g, '<br>')}<br>Phone: ${address.phone}</p>
        <div class="address-actions">
          <button class="btn btn-sm edit-address-btn" data-id="${addressId}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger delete-address-btn" data-id="${addressId}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
        <div class="address-form edit-address-form" id="edit-address-form-${addressId}">
          <div class="form-row">
            <div class="form-group">
              <label for="edit-label-${addressId}">Address Label</label>
              <input type="text" id="edit-label-${addressId}" value="${address.label}">
            </div>
            <div class="form-group">
              <label for="edit-pincode-${addressId}">Pincode</label>
              <input type="text" id="edit-pincode-${addressId}" value="${address.pincode}">
            </div>
          </div>
          <div class="form-group">
            <label for="edit-name-${addressId}">Full Name</label>
            <input type="text" id="edit-name-${addressId}" value="${address.name}">
          </div>
          <div class="form-group">
            <label for="edit-address-${addressId}">Address</label>
            <textarea id="edit-address-${addressId}">${address.address}</textarea>
          </div>
          <div class="form-group">
            <label for="edit-phone-${addressId}">Phone</label>
            <input type="text" id="edit-phone-${addressId}" value="${address.phone}">
          </div>
          <div class="form-actions">
            <button class="btn save-edit-address-btn" data-id="${addressId}">
              <i class="fas fa-save"></i> Save
            </button>
            <button class="btn btn-outline cancel-edit-address-btn" data-id="${addressId}">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      `;
      addressesContainer.appendChild(addressCard);
      
      // Add event listeners
      document.querySelector(`.edit-address-btn[data-id="${addressId}"]`).addEventListener('click', function() {
        document.getElementById(`edit-address-form-${addressId}`).style.display = 'block';
      });
      
      document.querySelector(`.delete-address-btn[data-id="${addressId}"]`).addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this address?')) {
          deleteAddress(addressId);
        }
      });
      
      document.querySelector(`.save-edit-address-btn[data-id="${addressId}"]`).addEventListener('click', function() {
        saveEditedAddress(addressId);
      });
      
      document.querySelector(`.cancel-edit-address-btn[data-id="${addressId}"]`).addEventListener('click', function() {
        document.getElementById(`edit-address-form-${addressId}`).style.display = 'none';
      });
    }

    // Display order in profile
    function displayOrder(order) {
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
      orderCard.querySelector('.track-order-btn').addEventListener('click', function() {
        alert(`Tracking order #${order.id.substring(0, 8)}`);
      });
      
      orderCard.querySelector('.reorder-btn').addEventListener('click', function() {
        reorderItems(order.items);
      });
    }

    // Reorder items
    function reorderItems(items) {
      items.forEach(item => {
        addToCart(item.productId, item.quantity);
      });
      alert('Items added to cart!');
    }

    // Layout Switcher Functionality
    function setDesktopView() {
      body.classList.remove('mobile-view');
      desktopViewBtn.classList.add('active');
      mobileViewBtn.classList.remove('active');
      document.body.style.transform = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.left = '';
      document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1400, initial-scale=0.35, maximum-scale=5.0, minimum-scale=0.1, user-scalable=yes');
    }
    
    function setMobileView() {
      body.classList.add('mobile-view');
      mobileViewBtn.classList.add('active');
      desktopViewBtn.classList.remove('active');
      document.body.style.transform = 'scale(0.55)';
      document.body.style.transformOrigin = 'top center';
      document.body.style.width = '181.82%';
      document.body.style.height = '181.82%';
      document.body.style.left = '-40.91%';
      document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1400, initial-scale=0.35, maximum-scale=5.0, minimum-scale=0.1, user-scalable=yes');
    }
    
    // Check if mobile device and set appropriate view
    function checkMobileDevice() {
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        setMobileView();
      } else {
        setDesktopView();
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

    // User dropdown functionality
    userIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentUser) {
        userDropdown.classList.toggle('active');
      } else {
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

    // Profile link functionality
    profileLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      userDropdown.classList.remove('active');
      if (currentUser) {
        showProfilePage();
      } else {
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

    // Show Profile Page
    function showProfilePage() {
      mainContent.style.display = 'none';
      profilePage.classList.add('active');
    }

    // Hide Profile Page
    function hideProfilePage() {
      mainContent.style.display = 'block';
      profilePage.classList.remove('active');
    }

    // Profile Close Button
    profileCloseBtn.addEventListener('click', () => {
      hideProfilePage();
    });

    // Profile Functions
    editProfileBtn.addEventListener('click', function() {
      editProfileModal.style.display = 'flex';
    });
    
    closeEditProfileModal.addEventListener('click', function() {
      editProfileModal.style.display = 'none';
    });
    
    cancelEditProfile.addEventListener('click', function() {
      editProfileModal.style.display = 'none';
    });
    
    saveProfileBtn.addEventListener('click', function() {
      const newName = document.getElementById('edit-name').value;
      if (newName.trim() === '') {
        alert('Please enter a valid name');
        return;
      }
      
      currentUser.updateProfile({
        displayName: newName
      }).then(() => {
        // Update Firestore
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
    
    // Address Functions
    addAddressBtn.addEventListener('click', function() {
      addAddressForm.style.display = 'block';
    });
    
    cancelNewAddress.addEventListener('click', function() {
      addAddressForm.style.display = 'none';
      document.getElementById('new-label').value = '';
      document.getElementById('new-name').value = '';
      document.getElementById('new-address').value = '';
      document.getElementById('new-phone').value = '';
      document.getElementById('new-pincode').value = '';
    });
    
    saveNewAddress.addEventListener('click', function() {
      const label = document.getElementById('new-label').value.trim();
      const name = document.getElementById('new-name').value.trim();
      const address = document.getElementById('new-address').value.trim();
      const phone = document.getElementById('new-phone').value.trim();
      const pincode = document.getElementById('new-pincode').value.trim();
      
      if (!label || !name || !address || !phone || !pincode) {
        alert('Please fill in all fields');
        return;
      }
      
      const newAddress = {
        label: label,
        name: name,
        address: address,
        phone: phone,
        pincode: pincode,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      db.collection('users').doc(currentUser.uid).collection('addresses').add(newAddress)
        .then((docRef) => {
          displayAddress(docRef.id, newAddress);
          addAddressForm.style.display = 'none';
          document.getElementById('new-label').value = '';
          document.getElementById('new-name').value = '';
          document.getElementById('new-address').value = '';
          document.getElementById('new-phone').value = '';
          document.getElementById('new-pincode').value = '';
          alert('New address added successfully!');
        })
        .catch((error) => {
          console.error("Error adding address:", error);
          alert('Error adding address. Please try again.');
        });
    });
    
    function saveEditedAddress(addressId) {
      const label = document.getElementById(`edit-label-${addressId}`).value.trim();
      const name = document.getElementById(`edit-name-${addressId}`).value.trim();
      const address = document.getElementById(`edit-address-${addressId}`).value.trim();
      const phone = document.getElementById(`edit-phone-${addressId}`).value.trim();
      const pincode = document.getElementById(`edit-pincode-${addressId}`).value.trim();
      
      if (!label || !name || !address || !phone || !pincode) {
        alert('Please fill in all fields');
        return;
      }
      
      const updatedAddress = {
        label: label,
        name: name,
        address: address,
        phone: phone,
        pincode: pincode,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      db.collection('users').doc(currentUser.uid).collection('addresses').doc(addressId).update(updatedAddress)
        .then(() => {
          // Refresh addresses
          addressesContainer.innerHTML = '';
          loadUserData(currentUser.uid);
          alert('Address updated successfully!');
        })
        .catch((error) => {
          console.error("Error updating address:", error);
          alert('Error updating address. Please try again.');
        });
    }
    
    function deleteAddress(addressId) {
      db.collection('users').doc(currentUser.uid).collection('addresses').doc(addressId).delete()
        .then(() => {
          // Refresh addresses
          addressesContainer.innerHTML = '';
          loadUserData(currentUser.uid);
          alert('Address deleted successfully!');
        })
        .catch((error) => {
          console.error("Error deleting address:", error);
          alert('Error deleting address. Please try again.');
        });
    }

    // Like icon functionality
    likeIcon.addEventListener('click', () => {
      likesSidebar.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Close likes sidebar
    closeLikes.addEventListener('click', () => {
      likesSidebar.classList.remove('active');
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

    // Add to likes
    function addToLikes(productId) {
      if (!likedProducts.includes(productId)) {
        likedProducts.push(productId);
        
        // Save to Firestore if user is logged in
        if (currentUser) {
          db.collection('users').doc(currentUser.uid).collection('likes').doc(productId.toString()).set({
            productId: productId,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
          })
          .catch((error) => {
            console.error("Error adding to likes:", error);
          });
        } else {
          // Save to localStorage for guest users
          localStorage.setItem('guestLikes', JSON.stringify(likedProducts));
        }
        
        updateLikeUI();
        
        const heartIcon = likeIcon.querySelector('i');
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas');
        heartIcon.style.color = '#ff4d4d';
      }
    }

    // Remove from likes
    function removeFromLikes(productId) {
      likedProducts = likedProducts.filter(id => id !== productId);
      
      // Remove from Firestore if user is logged in
      if (currentUser) {
        db.collection('users').doc(currentUser.uid).collection('likes').doc(productId.toString()).delete()
        .catch((error) => {
          console.error("Error removing from likes:", error);
        });
      } else {
        // Update localStorage for guest users
        localStorage.setItem('guestLikes', JSON.stringify(likedProducts));
      }
      
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
      cartSidebar.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Close cart sidebar
    closeCart.addEventListener('click', () => {
      cartSidebar.classList.remove('active');
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
        
        document.querySelector('.cart-subtotal span:last-child').textContent = `₹${subtotal}`;
        cartTotal.textContent = `₹${subtotal}`;
        
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

    // Enhanced Add to cart function with effects
    function addToCart(productId, quantity = 1) {
      const existingItem = cartProducts.find(item => item.id === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cartProducts.push({ id: productId, quantity });
      }
      
      // Save to Firestore if user is logged in
      if (currentUser) {
        db.collection('users').doc(currentUser.uid).collection('cart').doc(productId.toString()).set({
          productId: productId,
          quantity: existingItem ? existingItem.quantity : quantity,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .catch((error) => {
          console.error("Error adding to cart:", error);
        });
      } else {
        // Save to localStorage for guest users
        localStorage.setItem('guestCart', JSON.stringify(cartProducts));
      }
      
      updateCartUI();
      
      addCartVisualFeedback();
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
          // Update Firestore if user is logged in
          if (currentUser) {
            db.collection('users').doc(currentUser.uid).collection('cart').doc(productId.toString()).update({
              quantity: item.quantity,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .catch((error) => {
              console.error("Error updating cart:", error);
            });
          } else {
            // Update localStorage for guest users
            localStorage.setItem('guestCart', JSON.stringify(cartProducts));
          }
          
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
          
          // Update Firestore if user is logged in
          if (currentUser) {
            db.collection('users').doc(currentUser.uid).collection('cart').doc(productId.toString()).update({
              quantity: quantity,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .catch((error) => {
              console.error("Error updating cart:", error);
            });
          } else {
            // Update localStorage for guest users
            localStorage.setItem('guestCart', JSON.stringify(cartProducts));
          }
          
          updateCartUI();
        }
      }
    }

    // Remove from cart
    function removeFromCart(productId) {
      cartProducts = cartProducts.filter(item => item.id !== productId);
      
      // Remove from Firestore if user is logged in
      if (currentUser) {
        db.collection('users').doc(currentUser.uid).collection('cart').doc(productId.toString()).delete()
        .catch((error) => {
          console.error("Error removing from cart:", error);
        });
      } else {
        // Update localStorage for guest users
        localStorage.setItem('guestCart', JSON.stringify(cartProducts));
      }
      
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
      loginModal.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    });

    // Back button functionality
    backBtn.addEventListener('click', () => {
      showLoginView();
    });

    // Overlay click to close modals
    overlay.addEventListener('click', () => {
      likesSidebar.classList.remove('active');
      cartSidebar.classList.remove('active');
      loginModal.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
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
        .then((userCredential) => {
          loginModal.classList.remove('active');
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
            // Create user document in Firestore
            return db.collection('users').doc(user.uid).set({
              displayName: name,
              email: email,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          });
        })
        .then(() => {
          loginModal.classList.remove('active');
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
          loginModal.classList.remove('active');
          overlay.classList.remove('active');
          document.body.style.overflow = 'auto';
          alert('Password reset link sent to your email!');
        })
        .catch((error) => {
          console.error("Error sending reset email:", error);
          alert('Error sending reset email: ' + error.message);
        });
    });

    // Google login - Fixed to handle the environment issue
    googleLoginBtn.addEventListener('click', () => {
      // Check if we're in a supported environment
      if (window.location.protocol !== 'https:' && window.location.protocol !== 'http:' && !window.location.hostname.includes('localhost')) {
        alert('Google login is not supported in this environment. Please use email/password login instead.');
        return;
      }
      
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
          .then((result) => {
            const user = result.user;
            
            // Check if user exists in Firestore, if not create document
            return db.collection('users').doc(user.uid).get().then((doc) => {
              if (!doc.exists) {
                return db.collection('users').doc(user.uid).set({
                  displayName: user.displayName,
                  email: user.email,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
              }
            });
          })
          .then(() => {
            loginModal.classList.remove('active');
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

    // Checkout button
    checkoutBtn.addEventListener('click', () => {
      if (cartProducts.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      
      // Create order
      const order = {
        items: cartProducts,
        total: cartProducts.reduce((total, item) => {
          const product = products.find(p => p.id === item.id);
          return total + (product ? product.price * item.quantity : 0);
        }, 0),
        status: 'placed',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // If user is logged in, save to Firestore
      if (currentUser) {
        db.collection('users').doc(currentUser.uid).collection('orders').add(order)
          .then((docRef) => {
            // Clear cart
            cartProducts.forEach(item => {
              db.collection('users').doc(currentUser.uid).collection('cart').doc(item.id.toString()).delete()
              .catch((error) => {
                console.error("Error clearing cart:", error);
              });
            });
            
            cartProducts = [];
            updateCartUI();
            
            alert('Order placed successfully! Order ID: ' + docRef.id.substring(0, 8));
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Reload user data to show new order
            loadUserData(currentUser.uid);
          })
          .catch((error) => {
            console.error("Error creating order:", error);
            alert('Error placing order. Please try again.');
          });
      } else {
        // For guest users, just show success message
        cartProducts = [];
        updateCartUI();
        
        alert('Order placed successfully! Thank you for your purchase.');
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });

    // Continue shopping button
    continueShopping.addEventListener('click', () => {
      cartSidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    });

    // Browse products button
    browseProducts.addEventListener('click', () => {
      likesSidebar.classList.remove('active');
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

    // Set up layout switcher event listeners
    desktopViewBtn.addEventListener('click', setDesktopView);
    mobileViewBtn.addEventListener('click', setMobileView);
    
    // Initialize with appropriate view
    checkMobileDevice();
    
    // Initialize everything
    loadGuestData();
