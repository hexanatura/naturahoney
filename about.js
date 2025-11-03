function initAboutPage() {
    initScrollAnimations();
    initProfilePage();
}

function initScrollAnimations() {
    const sections = document.querySelectorAll('.content-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

function initProfilePage() {
    // Ensure profile page elements exist
    const profilePage = document.getElementById('profilePage');
    const mainContent = document.getElementById('mainContent');
    const profileCloseBtn = document.getElementById('profileCloseBtn');
    
    if (profilePage && mainContent && profileCloseBtn) {
        // Add event listener for profile close button
        profileCloseBtn.addEventListener('click', function() {
            profilePage.classList.remove('active');
            mainContent.style.display = 'block';
        });
    }
    
    // Override the profile link click handler for About page
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        // Remove any existing event listeners
        profileLink.replaceWith(profileLink.cloneNode(true));
        
        // Get the new reference
        const newProfileLink = document.getElementById('profileLink');
        
        newProfileLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown) {
                userDropdown.classList.remove('active');
            }
            
            if (currentUser) {
                showProfilePage();
            } else {
                closeAllSidebars();
                showLoginView();
                loginModal.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Initialize profile modal functionality
    initProfileModals();
}

function initProfileModals() {
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
    
    // Initialize address functionality
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
                    // Refresh addresses display
                    const addressesContainer = document.getElementById('addresses-container');
                    if (addressesContainer) {
                        addressesContainer.innerHTML = '';
                        loadUserData(currentUser.uid);
                    }
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
    }
}

function showProfilePage() {
    const profilePage = document.getElementById('profilePage');
    const mainContent = document.getElementById('mainContent');
    
    if (profilePage && mainContent) {
        mainContent.style.display = 'none';
        profilePage.classList.add('active');
        
        // Load user data if user is logged in
        if (currentUser) {
            loadUserData(currentUser.uid);
        }
    }
}

// Make sure common.js is loaded first, then initialize about page
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure common.js is loaded
    setTimeout(() => {
        initAboutPage();
    }, 100);
});
