// Quick View Modal Elements
const quickViewModal = document.getElementById('quickViewModal');
const quickViewClose = document.getElementById('quickViewClose');
const quickViewImage = document.getElementById('quickViewImage');
const quickViewTitle = document.getElementById('quickViewTitle');
const quickViewPrice = document.getElementById('quickViewPrice');
const quickViewRating = document.getElementById('quickViewRating');
const quickViewWeight = document.getElementById('quickViewWeight');
const quickViewAddToCartBtn = document.querySelector('.quick-view-add-to-cart');
const quickViewWishlistBtn = document.querySelector('.quick-view-wishlist');

// Quick View Modal Functionality
if (quickViewClose) {
    quickViewClose.addEventListener('click', closeQuickView);
}

if (quickViewModal) {
    quickViewModal.addEventListener('click', (e) => {
        if (e.target === quickViewModal) {
            closeQuickView();
        }
    });
}

function closeQuickView() {
    if (quickViewModal) {
        quickViewModal.style.display = 'none';
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
}

// Quick View Add to Cart functionality
if (quickViewAddToCartBtn) {
    quickViewAddToCartBtn.addEventListener('click', function() {
        // Add visual feedback
        this.classList.add('adding');
        
        // Remove adding class after animation
        setTimeout(() => {
            this.classList.remove('adding');
        }, 400);
    });
}

// Quick View Wishlist functionality
if (quickViewWishlistBtn) {
    quickViewWishlistBtn.addEventListener('click', function() {
        // Toggle wishlist state
        if (this.innerHTML.includes('far')) {
            this.innerHTML = '<i class="fas fa-heart"></i>';
            this.style.background = '#ff4d4d';
            this.style.color = 'white';
        } else {
            this.innerHTML = '<i class="far fa-heart"></i>';
            this.style.background = '#f1f1f1';
            this.style.color = '#333';
        }
    });
}

// Scroll animation for content sections
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

// Profile page specific initialization
function initProfilePage() {
    console.log('Initializing profile page functionality...');
    
    // Check if we're on a page that has profile elements
    const profilePage = document.getElementById('profilePage');
    if (profilePage) {
        console.log('Profile page detected, initializing profile features');
        
        // Initialize profile close button
        const profileCloseBtn = document.getElementById('profileCloseBtn');
        if (profileCloseBtn) {
            profileCloseBtn.addEventListener('click', () => {
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    profilePage.classList.remove('active');
                    mainContent.style.display = 'block';
                }
            });
        }
        
        // Initialize address form
        const addAddressBtn = document.getElementById('add-address-btn');
        const addAddressForm = document.getElementById('add-address-form');
        const cancelNewAddress = document.getElementById('cancel-new-address');
        const saveNewAddress = document.getElementById('save-new-address');
        
        if (addAddressBtn && addAddressForm) {
            addAddressBtn.addEventListener('click', () => {
                addAddressForm.style.display = 'block';
            });
        }
        
        if (cancelNewAddress && addAddressForm) {
            cancelNewAddress.addEventListener('click', () => {
                addAddressForm.style.display = 'none';
                // Clear form fields
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
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('About page DOM loaded');
    initScrollAnimations();
    initProfilePage();
});
