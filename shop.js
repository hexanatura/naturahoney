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
            updateQuickViewWishlistButton(false);
        } else {
            addToLikes(currentQuickViewProductId);
            updateQuickViewWishlistButton(true);
        }
    }
});

// Update quick view wishlist button state
function updateQuickViewWishlistButton(isLiked) {
    if (isLiked) {
        quickViewWishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
        quickViewWishlistBtn.style.background = '#ff4d4d';
        quickViewWishlistBtn.style.color = 'white';
    } else {
        quickViewWishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
        quickViewWishlistBtn.style.background = '#f1f1f1';
        quickViewWishlistBtn.style.color = '#333';
    }
}

// Update product card wishlist button state
function updateProductCardWishlistButton(productId, isLiked) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        const wishlistBtn = productCard.querySelector('.wishlist-btn');
        if (wishlistBtn) {
            if (isLiked) {
                wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
                wishlistBtn.style.background = '#ff4d4d';
                wishlistBtn.style.color = 'white';
            } else {
                wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
                wishlistBtn.style.background = '#f1f1f1';
                wishlistBtn.style.color = '#333';
            }
        }
    }
}

// Simple function to toggle product stock status
function toggleProductStock(productId, isOutOfStock) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        productCard.setAttribute('data-out-of-stock', isOutOfStock.toString());
        
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (isOutOfStock) {
            addToCartBtn.textContent = 'Out of Stock';
            addToCartBtn.disabled = true;
        } else {
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.disabled = false;
        }
    }
}

function initializeProductCards() {
    productCards.forEach((card, index) => {
        const productId = parseInt(card.getAttribute('data-id'));
        const isOutOfStock = card.getAttribute('data-out-of-stock') === 'true';
        
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        
        // Only add click event if product is in stock
        if (!isOutOfStock) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                addToCartBtn.classList.add('adding');
                
                addToCart(productId, 1);
                
                setTimeout(() => {
                    addToCartBtn.classList.remove('adding');
                }, 400);
            });
        } else {
            // Disable the button and change text for out of stock products
            addToCartBtn.textContent = 'Out of Stock';
            addToCartBtn.disabled = true;
        }
        
        const wishlistBtn = card.querySelector('.wishlist-btn');
        wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (likedProducts.includes(productId)) {
                removeFromLikes(productId);
            } else {
                addToLikes(productId);
            }
        });
        
        // Update wishlist button state based on current likes
        updateProductCardWishlistButton(productId, likedProducts.includes(productId));
        
        // Quick view functionality
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.wishlist-btn')) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    quickViewImage.src = product.image;
                    quickViewImage.alt = product.name;
                    quickViewTitle.textContent = product.name;
                    quickViewPrice.textContent = `₹${product.price.toFixed(2)}`;
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
                    
                    // Update quick view add to cart button based on stock status
                    if (isOutOfStock) {
                        quickViewAddToCartBtn.textContent = 'Out of Stock';
                        quickViewAddToCartBtn.classList.add('out-of-stock-btn');
                        quickViewAddToCartBtn.disabled = true;
                    } else {
                        quickViewAddToCartBtn.textContent = 'Add to Cart';
                        quickViewAddToCartBtn.classList.remove('out-of-stock-btn');
                        quickViewAddToCartBtn.disabled = false;
                    }
                    
                    // Set current product ID for quick view
                    currentQuickViewProductId = productId;
                    
                    // Update quick view wishlist button state
                    updateQuickViewWishlistButton(likedProducts.includes(productId));
                    
                    closeAllSidebars();
                    quickViewModal.style.display = 'flex';
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });
}

// Update favorites sidebar to handle out-of-stock products
function updateFavoritesSidebar() {
    const likesItems = document.getElementById('likesItems');
    likesItems.innerHTML = '';
    
    // Show empty message if no favorites
    if (likedProducts.length === 0) {
        document.getElementById('emptyLikes').style.display = 'flex';
        return;
    }
    
    document.getElementById('emptyLikes').style.display = 'none';
    
    // Loop through liked products
    likedProducts.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const isOutOfStock = document.querySelector(`.product-card[data-id="${productId}"]`)?.getAttribute('data-out-of-stock') === 'true';
        
        const likeItem = document.createElement('div');
        likeItem.className = 'like-item';
        likeItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="like-item-details">
                <h3 class="like-item-title">${product.name}</h3>
                <div class="like-item-price">₹${product.price.toFixed(2)}</div>
                <div class="like-item-actions">
                    <button class="add-to-cart-btn ${isOutOfStock ? 'out-of-stock-fav' : ''}" 
                            data-id="${productId}" 
                            ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button class="remove-like" data-id="${productId}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        likesItems.appendChild(likeItem);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.like-item .add-to-cart-btn').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId, 1);
                
                // Add visual feedback
                this.classList.add('adding');
                setTimeout(() => {
                    this.classList.remove('adding');
                }, 400);
            });
        }
    });
    
    document.querySelectorAll('.remove-like').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromLikes(productId);
        });
    });
}

// Function to mark product as out of stock
function setProductOutOfStock(productId, isOutOfStock) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (productCard) {
        productCard.setAttribute('data-out-of-stock', isOutOfStock.toString());
        
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (isOutOfStock) {
            addToCartBtn.textContent = 'Out of Stock';
            addToCartBtn.disabled = true;
            addToCartBtn.style.background = '#ccc';
            addToCartBtn.style.color = '#666';
            addToCartBtn.style.cursor = 'not-allowed';
            addToCartBtn.onclick = null;
        } else {
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.disabled = false;
            addToCartBtn.style.background = '';
            addToCartBtn.style.color = '';
            addToCartBtn.style.cursor = '';
            
            // Reattach click event
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                addToCartBtn.classList.add('adding');
                addToCart(productId, 1);
                
                setTimeout(() => {
                    addToCartBtn.classList.remove('adding');
                }, 400);
            });
        }
    }
}

// Update the addToLikes function
const originalAddToLikes = window.addToLikes;
window.addToLikes = function(productId) {
    originalAddToLikes(productId);
    
    // Update product card wishlist button
    updateProductCardWishlistButton(productId, true);
    
    // Update quick view wishlist button if this product is currently being viewed
    if (currentQuickViewProductId === productId) {
        updateQuickViewWishlistButton(true);
    }
    
    // Refresh favorites sidebar if it's open
    if (document.getElementById('likesSidebar').classList.contains('active')) {
        updateFavoritesSidebar();
    }
};

// Update the removeFromLikes function
const originalRemoveFromLikes = window.removeFromLikes;
window.removeFromLikes = function(productId) {
    originalRemoveFromLikes(productId);
    
    // Update product card wishlist button
    updateProductCardWishlistButton(productId, false);
    
    // Update quick view wishlist button if this product is currently being viewed
    if (currentQuickViewProductId === productId) {
        updateQuickViewWishlistButton(false);
    }
    
    // Refresh favorites sidebar if it's open
    if (document.getElementById('likesSidebar').classList.contains('active')) {
        updateFavoritesSidebar();
    }
};

// Initialize shop page functionality
function initShopPage() {
    initializeProductCards();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initShopPage();
});
