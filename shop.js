// shop.js - Shop Page Specific Functionality

// DOM Elements for Shop Page
const filterToggle = document.getElementById('filterToggle');
const filterSidebar = document.getElementById('filterSidebar');
const closeFilter = document.getElementById('closeFilter');
const applyFilters = document.getElementById('applyFilters');
const clearFilters = document.getElementById('clearFilters');
const sortSelect = document.getElementById('sortSelect');
const resultsCount = document.getElementById('resultsCount');
const productsGrid = document.getElementById('productsGrid');
const productCards = document.querySelectorAll('.product-card');

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

// State variables for shop page
let currentQuickViewProductId = null;

// Filter sidebar functionality
filterToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllSidebars();
    filterSidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeFilter.addEventListener('click', closeFilterSidebar);

function closeFilterSidebar() {
    closeAllSidebars();
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Sort functionality
sortSelect.addEventListener('change', sortProducts);

function sortProducts() {
    const sortValue = sortSelect.value;
    const products = Array.from(document.querySelectorAll('.product-card'));
    
    products.sort((a, b) => {
        switch(sortValue) {
            case 'price-low':
                return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
            case 'price-high':
                return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
            case 'rating':
                return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
            case 'newest':
                // For demonstration, we'll sort by an arbitrary "newness" value
                return Math.random() - 0.5;
            default: // featured
                return Math.random() - 0.5;
        }
    });
    
    // Reappend sorted products to grid
    const productsGrid = document.getElementById('productsGrid');
    products.forEach(product => {
        productsGrid.appendChild(product);
    });
}

// Filter functionality
applyFilters.addEventListener('click', filterProducts);
clearFilters.addEventListener('click', clearAllFilters);

function filterProducts() {
    const categoryFilters = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(input => input.value);
    const priceMax = document.getElementById('priceRange').value;
    const weightFilters = Array.from(document.querySelectorAll('input[name="weight"]:checked')).map(input => input.value);
    const ratingFilters = Array.from(document.querySelectorAll('input[name="rating"]:checked')).map(input => parseInt(input.value));
    
    const products = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    products.forEach(product => {
        const productCategory = product.dataset.category;
        const productPrice = parseFloat(product.dataset.price);
        const productWeight = product.dataset.weight;
        const productRating = parseFloat(product.dataset.rating);
        
        const categoryMatch = categoryFilters.length === 0 || categoryFilters.includes(productCategory);
        const priceMatch = productPrice <= priceMax;
        const weightMatch = weightFilters.length === 0 || weightFilters.includes(productWeight);
        const ratingMatch = ratingFilters.length === 0 || ratingFilters.some(r => productRating >= r);
        
        if (categoryMatch && priceMatch && weightMatch && ratingMatch) {
            product.style.display = 'flex';
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    
    document.getElementById('resultsCount').textContent = `Showing ${visibleCount} of ${products.length} products`;
    closeFilterSidebar();
}

function clearAllFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = false;
    });
    
    document.getElementById('priceRange').value = 1000;
    
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        product.style.display = 'flex';
    });
    
    document.getElementById('resultsCount').textContent = `Showing ${products.length} of ${products.length} products`;
    closeFilterSidebar();
}

// Quick View Modal Functionality
quickViewClose.addEventListener('click', closeQuickView);
quickViewModal.addEventListener('click', (e) => {
    if (e.target === quickViewModal) {
        closeQuickView();
    }
});

function closeQuickView() {
    quickViewModal.style.display = 'none';
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Quick View Add to Cart functionality
quickViewAddToCartBtn.addEventListener('click', function() {
    if (currentQuickViewProductId) {
        // Add visual feedback
        this.classList.add('adding');
        
        // Add to cart
        addToCart(currentQuickViewProductId, 1);
        
        // Remove adding class after animation
        setTimeout(() => {
            this.classList.remove('adding');
        }, 400);
    }
});

// Quick View Wishlist functionality
quickViewWishlistBtn.addEventListener('click', function() {
    if (currentQuickViewProductId) {
        if (likedProducts.includes(currentQuickViewProductId)) {
            removeFromLikes(currentQuickViewProductId);
            this.innerHTML = '<i class="far fa-heart"></i>';
            this.style.background = '#f1f1f1';
            this.style.color = '#333';
        } else {
            addToLikes(currentQuickViewProductId);
            this.innerHTML = '<i class="fas fa-heart"></i>';
            this.style.background = '#ff4d4d';
            this.style.color = 'white';
        }
    }
});

// Initialize product cards with data-id attributes and event listeners
function initializeProductCards() {
    productCards.forEach((card, index) => {
        const productId = parseInt(card.getAttribute('data-id'));
        
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        
        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            addToCartBtn.classList.add('adding');
            
            addToCart(productId, 1);
            
            setTimeout(() => {
                addToCartBtn.classList.remove('adding');
            }, 400);
        });
        
        const wishlistBtn = card.querySelector('.wishlist-btn');
        wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (likedProducts.includes(productId)) {
                removeFromLikes(productId);
            } else {
                addToLikes(productId);
                wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
                wishlistBtn.style.background = '#ff4d4d';
                wishlistBtn.style.color = 'white';
            }
        });
        
        // Update wishlist button state based on current likes
        if (likedProducts.includes(productId)) {
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
            wishlistBtn.style.background = '#ff4d4d';
            wishlistBtn.style.color = 'white';
        }
        
        // Quick view functionality
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.wishlist-btn')) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    quickViewImage.src = product.image;
                    quickViewImage.alt = product.name;
                    quickViewTitle.textContent = product.name;
                    quickViewPrice.textContent = `₹${product.price}`;
                    quickViewWeight.textContent = product.weight;
                    
                    // Get rating from the product card
                    const ratingStars = card.querySelector('.rating-stars').innerHTML;
                    const ratingCount = card.querySelector('.rating-count').textContent;
                    
                    quickViewRating.innerHTML = `
                        <div class="rating-stars">
                            ${ratingStars}
                        </div>
                        <span class="rating-count">${ratingCount}</span>
                    `;
                    
                    // Set current product ID for quick view
                    currentQuickViewProductId = productId;
                    
                    // Update quick view wishlist button state
                    if (likedProducts.includes(productId)) {
                        quickViewWishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
                        quickViewWishlistBtn.style.background = '#ff4d4d';
                        quickViewWishlistBtn.style.color = 'white';
                    } else {
                        quickViewWishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
                        quickViewWishlistBtn.style.background = '#f1f1f1';
                        quickViewWishlistBtn.style.color = '#333';
                    }
                    
                    closeAllSidebars();
                    quickViewModal.style.display = 'flex';
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });
}

// Initialize shop page functionality
function initShopPage() {
    initializeProductCards();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initShopPage();
});