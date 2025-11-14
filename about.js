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
const overlay = document.getElementById('overlay'); // Make sure this exists

// Check if elements exist before adding event listeners
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

// Function to open quick view modal
function openQuickView(productData) {
    if (!quickViewModal) return;
    
    // Populate modal with product data
    if (quickViewImage && productData.image) {
        quickViewImage.src = productData.image;
        quickViewImage.alt = productData.title || 'Product Image';
    }
    
    if (quickViewTitle && productData.title) {
        quickViewTitle.textContent = productData.title;
    }
    
    if (quickViewPrice && productData.price) {
        quickViewPrice.textContent = productData.price;
    }
    
    if (quickViewWeight && productData.weight) {
        quickViewWeight.textContent = productData.weight;
    }
    
    if (quickViewRating && productData.rating) {
        quickViewRating.innerHTML = generateStarRating(productData.rating);
    }
    
    // Show modal
    quickViewModal.style.display = 'flex';
    if (overlay) {
        overlay.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    if (!quickViewModal) return;
    
    quickViewModal.style.display = 'none';
    if (overlay) {
        overlay.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else if (hasHalfStar && i === fullStars + 1) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }
    
    return starsHTML;
}

// Quick View Add to Cart functionality
if (quickViewAddToCartBtn) {
    quickViewAddToCartBtn.addEventListener('click', function() {
        // Add visual feedback
        this.classList.add('adding');
        
        // Get product data from modal
        const productData = {
            title: quickViewTitle ? quickViewTitle.textContent : '',
            price: quickViewPrice ? quickViewPrice.textContent : '',
            image: quickViewImage ? quickViewImage.src : '',
            weight: quickViewWeight ? quickViewWeight.textContent : ''
        };
        
        // Add to cart logic (you'll need to integrate with your existing cart system)
        addToCartFromQuickView(productData);
        
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
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.className = 'fas fa-heart';
            this.style.background = '#ff4d4d';
            this.style.color = 'white';
            
            // Add to wishlist logic
            addToWishlistFromQuickView();
        } else {
            icon.className = 'far fa-heart';
            this.style.background = '#f1f1f1';
            this.style.color = '#333';
            
            // Remove from wishlist logic
            removeFromWishlistFromQuickView();
        }
    });
}

// Add to cart function for quick view
function addToCartFromQuickView(productData) {
    // This should integrate with your existing cart functionality
    console.log('Adding to cart from quick view:', productData);
    
    // Example: Update cart count
    updateCartCount();
    
    // Show success message or animation
    showAddToCartSuccess();
}

// Add to wishlist function for quick view
function addToWishlistFromQuickView() {
    // This should integrate with your existing wishlist functionality
    console.log('Adding to wishlist from quick view');
    updateWishlistCount();
}

// Remove from wishlist function for quick view
function removeFromWishlistFromQuickView() {
    // This should integrate with your existing wishlist functionality
    console.log('Removing from wishlist from quick view');
    updateWishlistCount();
}

// Update cart count (integrate with your existing cart system)
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        let currentCount = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = currentCount + 1;
        cartCount.classList.remove('hidden');
        
        // Add bounce animation to cart icon
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.classList.add('cart-icon-bounce');
            setTimeout(() => {
                cartIcon.classList.remove('cart-icon-bounce');
            }, 600);
        }
    }
}

// Update wishlist count (integrate with your existing wishlist system)
function updateWishlistCount() {
    const likeCount = document.getElementById('likeCount');
    if (likeCount) {
        let currentCount = parseInt(likeCount.textContent) || 0;
        const quickViewHeart = quickViewWishlistBtn.querySelector('i');
        
        if (quickViewHeart.classList.contains('fas')) {
            likeCount.textContent = currentCount + 1;
        } else {
            likeCount.textContent = Math.max(0, currentCount - 1);
        }
        
        if (parseInt(likeCount.textContent) > 0) {
            likeCount.classList.remove('hidden');
        } else {
            likeCount.classList.add('hidden');
        }
    }
}

// Show add to cart success message
function showAddToCartSuccess() {
    // You can implement a toast notification here
    console.log('Product added to cart successfully!');
}

// Scroll animation for content sections
function initScrollAnimations() {
    const sections = document.querySelectorAll('.content-section');
    
    if (sections.length === 0) return;
    
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

// Initialize product cards with quick view functionality
function initProductQuickView() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on action buttons
            if (e.target.closest('.add-to-cart-btn') || e.target.closest('.wishlist-btn')) {
                return;
            }
            
            // Get product data from the card
            const productData = {
                image: this.querySelector('img') ? this.querySelector('img').src : '',
                title: this.querySelector('.product-title') ? this.querySelector('.product-title').textContent : 'Product Name',
                price: this.querySelector('.product-price') ? this.querySelector('.product-price').textContent : '₹0',
                weight: this.querySelector('.product-weight') ? this.querySelector('.product-weight').textContent : '',
                rating: 4.5 // You might want to get this from data attribute
            };
            
            openQuickView(productData);
        });
    });
}

// Initialize page-specific functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initProductQuickView();
    
    // Add escape key to close quick view
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && quickViewModal && quickViewModal.style.display === 'flex') {
            closeQuickView();
        }
    });
});

// Make functions available globally if needed
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
