function initShopPage() {
    initializeProductCards();
    initializeShopEventListeners();
}

function initializeShopEventListeners() {
    const filterToggle = document.getElementById('filterToggle');
    const filterSidebar = document.getElementById('filterSidebar');
    const closeFilter = document.getElementById('closeFilter');
    const applyFilters = document.getElementById('applyFilters');
    const clearFilters = document.getElementById('clearFilters');
    const sortSelect = document.getElementById('sortSelect');

    if (filterToggle && filterSidebar) {
        filterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllSidebars();
            filterSidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeFilter) {
        closeFilter.addEventListener('click', closeFilterSidebar);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', sortProducts);
    }

    if (applyFilters) {
        applyFilters.addEventListener('click', filterProducts);
    }

    if (clearFilters) {
        clearFilters.addEventListener('click', clearAllFilters);
    }
}

function closeFilterSidebar() {
    const filterSidebar = document.getElementById('filterSidebar');
    if (filterSidebar) {
        filterSidebar.classList.remove('active');
    }
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function sortProducts() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
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
                return Math.random() - 0.5;
            default:
                return Math.random() - 0.5;
        }
    });
    
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        products.forEach(product => {
            productsGrid.appendChild(product);
        });
    }
}

function filterProducts() {
    const categoryFilters = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(input => input.value);
    const priceMax = document.getElementById('priceRange')?.value || 1000;
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
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${visibleCount} of ${products.length} products`;
    }
    closeFilterSidebar();
}

function clearAllFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = false;
    });
    
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.value = 1000;
    }
    
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        product.style.display = 'flex';
    });
    
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `Showing ${products.length} of ${products.length} products`;
    }
    closeFilterSidebar();
}

function initializeQuickView() {
    const quickViewModal = document.getElementById('quickViewModal');
    const quickViewClose = document.getElementById('quickViewClose');
    const quickViewAddToCartBtn = document.querySelector('.quick-view-add-to-cart');
    const quickViewWishlistBtn = document.querySelector('.quick-view-wishlist');

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

    if (quickViewAddToCartBtn) {
        quickViewAddToCartBtn.addEventListener('click', function() {
            if (currentQuickViewProductId) {
                this.classList.add('adding');
                addToCart(currentQuickViewProductId, 1);
                setTimeout(() => {
                    this.classList.remove('adding');
                }, 400);
            }
        });
    }

    if (quickViewWishlistBtn) {
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
    }
}

function closeQuickView() {
    const quickViewModal = document.getElementById('quickViewModal');
    if (quickViewModal) {
        quickViewModal.style.display = 'none';
    }
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    let currentQuickViewProductId = null;
    
    productCards.forEach((card, index) => {
        const productId = parseInt(card.getAttribute('data-id'));
        
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        
        if (addToCartBtn) {
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
        
        const wishlistBtn = card.querySelector('.wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (likedProducts.includes(productId)) {
                    removeFromLikes(productId);
                    wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
                    wishlistBtn.style.background = '#f1f1f1';
                    wishlistBtn.style.color = '#333';
                } else {
                    addToLikes(productId);
                    wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
                    wishlistBtn.style.background = '#ff4d4d';
                    wishlistBtn.style.color = 'white';
                }
            });
            
            if (likedProducts.includes(productId)) {
                wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
                wishlistBtn.style.background = '#ff4d4d';
                wishlistBtn.style.color = 'white';
            }
        }
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.wishlist-btn')) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    const quickViewImage = document.getElementById('quickViewImage');
                    const quickViewTitle = document.getElementById('quickViewTitle');
                    const quickViewPrice = document.getElementById('quickViewPrice');
                    const quickViewWeight = document.getElementById('quickViewWeight');
                    const quickViewRating = document.getElementById('quickViewRating');
                    const quickViewModal = document.getElementById('quickViewModal');
                    const quickViewWishlistBtn = document.querySelector('.quick-view-wishlist');
                    
                    if (quickViewImage) quickViewImage.src = product.image;
                    if (quickViewImage) quickViewImage.alt = product.name;
                    if (quickViewTitle) quickViewTitle.textContent = product.name;
                    if (quickViewPrice) quickViewPrice.textContent = `₹${product.price}`;
                    if (quickViewWeight) quickViewWeight.textContent = product.weight;
                    
                    const ratingStars = card.querySelector('.rating-stars');
                    const ratingCount = card.querySelector('.rating-count');
                    
                    if (quickViewRating && ratingStars && ratingCount) {
                        quickViewRating.innerHTML = `
                            <div class="rating-stars">
                                ${ratingStars.innerHTML}
                            </div>
                            <span class="rating-count">${ratingCount.textContent}</span>
                        `;
                    }
                    
                    currentQuickViewProductId = productId;
                    
                    if (quickViewWishlistBtn) {
                        if (likedProducts.includes(productId)) {
                            quickViewWishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
                            quickViewWishlistBtn.style.background = '#ff4d4d';
                            quickViewWishlistBtn.style.color = 'white';
                        } else {
                            quickViewWishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
                            quickViewWishlistBtn.style.background = '#f1f1f1';
                            quickViewWishlistBtn.style.color = '#333';
                        }
                    }
                    
                    if (quickViewModal) {
                        closeAllSidebars();
                        quickViewModal.style.display = 'flex';
                        overlay.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initShopPage();
    initializeQuickView();
});
