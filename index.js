// DOM Elements specific to index.html
const mainContent = document.getElementById('mainContent');
const profilePage = document.getElementById('profilePage');
const profileCloseBtn = document.getElementById('profileCloseBtn');

// Review Elements
const reviewsContainer = document.getElementById('reviewsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const carouselDots = document.getElementById('carouselDots');
const addReviewBtn = document.getElementById('addReviewBtn');
const reviewModal = document.getElementById('reviewModal');
const cancelReview = document.getElementById('cancelReview');
const submitReview = document.getElementById('submitReview');
const reviewProduct = document.getElementById('reviewProduct');

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

// State variables specific to index.html
let currentCarouselIndex = 0;
let approvedReviews = [];
let currentQuickViewProductId = null;

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
        
        // Add to cart (this will now auto-open the cart sidebar)
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
            addToLikes(currentQuickViewProductId); // This will now auto-open the likes sidebar
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

// Initialize product cards with data-id attributes and event listeners
function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach((card, index) => {
        // Get the product based on category and position
        let productId;
        const category = card.getAttribute('data-category');
        
        if (category === 'crystal') {
            // Crystal products are first 4 cards (index 0-3)
            productId = index + 1;
        } else {
            // Premium products are last 2 cards (index 4-5)
            productId = index + 1; // This will give IDs 5 and 6
        }
        
        card.setAttribute('data-id', productId);
        
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        
        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            addToCartBtn.classList.add('adding');
            
            // Add to cart (this will now auto-open the cart sidebar)
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
                // Add to likes (this will now auto-open the likes sidebar)
                addToLikes(productId);
            }
        });
        
        // Initialize wishlist button state
        updateProductCardWishlistButton(productId, likedProducts.includes(productId));
        
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
                    updateQuickViewWishlistButton(likedProducts.includes(productId));
                    
                    quickViewModal.style.display = 'flex';
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });
}

// Category Filter Functionality
const categoryBtns = document.querySelectorAll(".category-btn");
const productRow = document.getElementById("productRow");

function centerProducts(category) {
    const visibleProducts = document.querySelectorAll(`.product-card[data-category="${category}"]`);
    if (visibleProducts.length <= 2) {
        productRow.classList.add('centered');
    } else {
        productRow.classList.remove('centered');
    }
}

// Initialize category filtering
function initializeCategoryFilter() {
    document.querySelectorAll('.product-card').forEach(card => {
        if (card.dataset.category === "premium") {
            card.style.display = "none";
        }
    });
    centerProducts("crystal");

    categoryBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            categoryBtns.forEach((b) => {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
            const category = btn.dataset.category;
            document.querySelectorAll('.product-card').forEach((card) => {
                card.style.display = card.dataset.category === category ? "flex" : "none";
            });
            centerProducts(category);
        });
        btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

// Banner rotating images functionality
function initializeBannerImages() {
    const bannerWrapper = document.querySelector(".banner-wrapper");
    if (!bannerWrapper) return;
    
    const rotatingImage = document.createElement("img");
    rotatingImage.className = "banner-overlay-outside";
    bannerWrapper.appendChild(rotatingImage);

    const imagesConfig = [
        {
            src: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(9)%20(1).png?updatedAt=1756992468273",
            top: "10px",
            alt: "Artistic honey jar with honeycomb pattern and golden glow"
        },
        {
            src: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(2).png?updatedAt=1756995663739",
            top: "-15px",
            alt: "Honey dipper dripping golden honey with honeycomb background"
        },
        {
            src: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(4).png?updatedAt=1756995663681",
            top: "-15px",
            alt: "Close-up of honeycomb cells filled with golden honey"
        },
        {
            src: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(3).png?updatedAt=1756995663635",
            top: "-18px",
            alt: "Honey jar with honeycomb and floral decoration"
        }
    ];

    let index = 0;
    function showImage(i) {
        const config = imagesConfig[i];
        rotatingImage.style.opacity = 0;
        setTimeout(() => {
            rotatingImage.src = config.src;
            rotatingImage.alt = config.alt;
            rotatingImage.style.top = config.top;
            rotatingImage.style.opacity = 1;
        }, 800);
    }
    showImage(index);
    setInterval(() => {
        index = (index + 1) % imagesConfig.length;
        showImage(index);
    }, 4000);
}

// Load approved reviews from Firebase
function loadApprovedReviews() {
    // First, try to load from the 'reviews' collection
    db.collection('reviews')
        .where('status', '==', 'approved')
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            approvedReviews = [];
            reviewsContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                // If no reviews found, show a message
                reviewsContainer.innerHTML = '<p style="text-align: center; color: #777; padding: 40px;">No reviews yet. Be the first to review our products!</p>';
                carouselDots.innerHTML = '';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const review = doc.data();
                review.id = doc.id;
                approvedReviews.push(review);
                displayReview(review);
            });
            
            initializeCarousel();
        })
        .catch((error) => {
            console.error("Error loading reviews:", error);
            // If there's an error, show sample reviews as fallback
            showSampleReviews();
        });
}

// Show sample reviews as fallback
function showSampleReviews() {
    reviewsContainer.innerHTML = '';
    approvedReviews = [];
    
    const sampleReviews = [
        {
            userName: "Sarah Johnson",
            userLocation: "New York, USA",
            rating: 5,
            reviewText: "This is the purest honey I've ever tasted! I use it in my tea every morning and it's completely transformed my daily routine.",
            createdAt: { toDate: () => new Date('2023-01-15') }
        },
        {
            userName: "Michael Chen",
            userLocation: "Toronto, Canada",
            rating: 4.5,
            reviewText: "I've been using Natura Honey for my skin care routine and the results are amazing! My skin feels so much softer.",
            createdAt: { toDate: () => new Date('2023-02-03') }
        },
        {
            userName: "Priya Sharma",
            userLocation: "Mumbai, India",
            rating: 5,
            reviewText: "The Crystal Pack honey is exceptional! It has the perfect texture and sweetness. I've recommended it to all my friends.",
            createdAt: { toDate: () => new Date('2023-03-22') }
        },
        {
            userName: "Emma Wilson",
            userLocation: "London, UK",
            rating: 5,
            reviewText: "My whole family loves Natura Honey. We use it as a natural sweetener in everything from tea to baking.",
            createdAt: { toDate: () => new Date('2023-04-05') }
        }
    ];
    
    sampleReviews.forEach((review, index) => {
        approvedReviews.push(review);
        displayReview(review);
    });
    
    initializeCarousel();
}

// Display a review in the carousel
function displayReview(review) {
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    // Format date
    const reviewDate = review.createdAt ? review.createdAt.toDate().toLocaleDateString() : 'Recent';
    
    reviewCard.innerHTML = `
        <div class="customer-info">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=5f2b27&color=fff" alt="Customer photo" class="customer-avatar">
            <div>
                <div class="customer-name">${review.userName}</div>
                <div class="customer-location">${review.userLocation || 'Happy Customer'}</div>
            </div>
        </div>
        <div class="rating">
            ${generateStarRating(review.rating)}
        </div>
        <p class="review-text">${review.reviewText}</p>
        <div class="review-date">${reviewDate}</div>
    `;
    
    reviewsContainer.appendChild(reviewCard);
}

// Generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 === rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Reviews Carousel Functionality
function initializeCarousel() {
    const reviewCards = document.querySelectorAll('.review-card');
    
    // Handle case when no reviews exist
    if (reviewCards.length === 0) {
        carouselDots.innerHTML = '';
        return;
    }
    
    // Calculate cards per view based on screen size
    let cardsPerView;
    if (window.innerWidth <= 767) {
        cardsPerView = 1; // Show one card at a time on mobile
    } else if (window.innerWidth <= 1023) {
        cardsPerView = 2; // Show two cards on tablet
    } else {
        cardsPerView = Math.floor(reviewsContainer.offsetWidth / (300 + 30));
    }
    
    const totalSlides = Math.ceil(reviewCards.length / cardsPerView);
    
    carouselDots.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToSlide(i);
        });
        carouselDots.appendChild(dot);
    }
    
    updateCarousel();
}

function updateCarousel() {
    const reviewCards = document.querySelectorAll('.review-card');
    
    if (reviewCards.length === 0) return;
    
    let cardsPerView, cardWidth;
    if (window.innerWidth <= 767) {
        cardsPerView = 1;
        cardWidth = 280 + 16; // card width + margin
    } else if (window.innerWidth <= 1023) {
        cardsPerView = 2;
        cardWidth = 320 + 24; // card width + margin
    } else {
        cardsPerView = Math.floor(reviewsContainer.offsetWidth / (300 + 30));
        cardWidth = 300 + 30; // card width + margin
    }
    
    const offset = -currentCarouselIndex * cardWidth * cardsPerView;
    reviewsContainer.style.transform = `translateX(${offset}px)`;
    
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCarouselIndex);
    });
}

function goToSlide(index) {
    const reviewCards = document.querySelectorAll('.review-card');
    const cardsPerView = Math.floor(reviewsContainer.offsetWidth / (300 + 30));
    const maxIndex = Math.ceil(reviewCards.length / cardsPerView) - 1;
    currentCarouselIndex = Math.max(0, Math.min(index, maxIndex));
    updateCarousel();
}

prevBtn.addEventListener('click', () => {
    goToSlide(currentCarouselIndex - 1);
});

nextBtn.addEventListener('click', () => {
    goToSlide(currentCarouselIndex + 1);
});

// Add touch swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

reviewsContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

reviewsContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe left - next slide
        goToSlide(currentCarouselIndex + 1);
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe right - previous slide
        goToSlide(currentCarouselIndex - 1);
    }
}

// Update the window resize event listener
window.addEventListener('resize', () => {
    initializeCarousel();
});

// Review modal functionality
addReviewBtn.addEventListener('click', () => {
    if (!currentUser) {
        alert('Please login to add a review');
        showLoginView();
        loginModal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        return;
    }
    
    if (userOrders.length === 0) {
        alert('You need to make a purchase before you can review our products');
        return;
    }
    
    reviewModal.style.display = 'flex';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

cancelReview.addEventListener('click', () => {
    reviewModal.style.display = 'none';
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

submitReview.addEventListener('click', () => {
    const productId = parseInt(reviewProduct.value);
    const rating = document.querySelector('input[name="rating"]:checked');
    const reviewText = document.getElementById('userReview').value;
    
    if (!productId) {
        alert('Please select a product');
        return;
    }
    
    if (!rating) {
        alert('Please provide a rating');
        return;
    }
    
    if (!reviewText.trim()) {
        alert('Please write a review');
        return;
    }
    
    const review = {
        productId: productId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Customer',
        rating: parseInt(rating.value),
        reviewText: reviewText.trim(),
        status: 'pending', // All reviews start as pending
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('reviews').add(review)
        .then(() => {
            alert('Thank you for your review! It will be published after moderation.');
            reviewModal.style.display = 'none';
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Reset form
            reviewProduct.value = '';
            document.querySelectorAll('input[name="rating"]').forEach(input => {
                input.checked = false;
            });
            document.getElementById('userReview').value = '';
        })
        .catch((error) => {
            console.error("Error submitting review:", error);
            alert('Error submitting review. Please try again.');
        });
});

reviewModal.addEventListener('click', (e) => {
    if (e.target === reviewModal) {
        reviewModal.style.display = 'none';
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Update review product dropdown
function updateReviewProductDropdown() {
    if (!reviewProduct) return;
    
    reviewProduct.innerHTML = '<option value="">Select a product you\'ve purchased</option>';
    
    // Get unique product IDs from orders
    const orderedProductIds = [...new Set(userOrders.flatMap(order => 
        order.items.map(item => item.productId)
    ))];
    
    orderedProductIds.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const option = document.createElement('option');
            option.value = productId;
            option.textContent = `${product.name} - ${product.weight}`;
            reviewProduct.appendChild(option);
        }
    });
}

// Override the removeFromLikes function to update UI
const originalRemoveFromLikes = window.removeFromLikes;
window.removeFromLikes = function(productId) {
    originalRemoveFromLikes(productId);
    
    // Update product card wishlist button
    updateProductCardWishlistButton(productId, false);
    
    // Update quick view wishlist button if this product is currently being viewed
    if (currentQuickViewProductId === productId) {
        updateQuickViewWishlistButton(false);
    }
};

// Override the addToLikes function to update UI
const originalAddToLikes = window.addToLikes;
window.addToLikes = function(productId) {
    originalAddToLikes(productId);
    
    // Update product card wishlist button
    updateProductCardWishlistButton(productId, true);
    
    // Update quick view wishlist button if this product is currently being viewed
    if (currentQuickViewProductId === productId) {
        updateQuickViewWishlistButton(true);
    }
};

// Initialize everything for index page
function initIndexPage() {
    initializeProductCards();
    initializeCategoryFilter();
    initializeBannerImages();
    loadApprovedReviews();
    
    // Update review product dropdown when user data is loaded
    const originalLoadUserData = window.loadUserData;
    window.loadUserData = function(userId) {
        if (originalLoadUserData) {
            originalLoadUserData(userId);
        }
        // Update review dropdown after a short delay to ensure orders are loaded
        setTimeout(updateReviewProductDropdown, 500);
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initIndexPage();
});
