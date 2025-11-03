let currentCarouselIndex = 0;
let approvedReviews = [];
let currentQuickViewProductId = null;

function closeQuickView() {
    const quickViewModal = document.getElementById('quickViewModal');
    if (quickViewModal) {
        quickViewModal.style.display = 'none';
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
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

function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach((card, index) => {
        let productId;
        const category = card.getAttribute('data-category');
        
        if (category === 'crystal') {
            productId = index + 1;
        } else {
            productId = index + 1;
        }
        
        card.setAttribute('data-id', productId);
        
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
        }
        
        if (likedProducts.includes(productId)) {
            if (wishlistBtn) {
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
                        quickViewModal.style.display = 'flex';
                        overlay.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                }
            }
        });
    });
}

function centerProducts(category) {
    const productRow = document.getElementById("productRow");
    if (!productRow) return;
    
    const visibleProducts = document.querySelectorAll(`.product-card[data-category="${category}"]`);
    if (visibleProducts.length <= 2) {
        productRow.classList.add('centered');
    } else {
        productRow.classList.remove('centered');
    }
}

function initializeCategoryFilter() {
    const productRow = document.getElementById("productRow");
    if (!productRow) return;
    
    document.querySelectorAll('.product-card').forEach(card => {
        if (card.dataset.category === "premium") {
            card.style.display = "none";
        }
    });
    centerProducts("crystal");

    const categoryBtns = document.querySelectorAll(".category-btn");
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

function loadApprovedReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (!reviewsContainer) return;
    
    db.collection('reviews')
        .where('status', '==', 'approved')
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            approvedReviews = [];
            reviewsContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                reviewsContainer.innerHTML = '<p style="text-align: center; color: #777; padding: 40px;">No reviews yet. Be the first to review our products!</p>';
                const carouselDots = document.getElementById('carouselDots');
                if (carouselDots) carouselDots.innerHTML = '';
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
            showSampleReviews();
        });
}

function showSampleReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (!reviewsContainer) return;
    
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

function displayReview(review) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (!reviewsContainer) return;
    
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
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

function initializeCarousel() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    const carouselDots = document.getElementById('carouselDots');
    if (!reviewsContainer || !carouselDots) return;
    
    const reviewCards = document.querySelectorAll('.review-card');
    
    if (reviewCards.length === 0) {
        carouselDots.innerHTML = '';
        return;
    }
    
    let cardsPerView;
    if (window.innerWidth <= 767) {
        cardsPerView = 1;
    } else if (window.innerWidth <= 1023) {
        cardsPerView = 2;
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
    const reviewsContainer = document.getElementById('reviewsContainer');
    const carouselDots = document.getElementById('carouselDots');
    if (!reviewsContainer || !carouselDots) return;
    
    const reviewCards = document.querySelectorAll('.review-card');
    
    if (reviewCards.length === 0) return;
    
    let cardsPerView, cardWidth;
    if (window.innerWidth <= 767) {
        cardsPerView = 1;
        cardWidth = 280 + 16;
    } else if (window.innerWidth <= 1023) {
        cardsPerView = 2;
        cardWidth = 320 + 24;
    } else {
        cardsPerView = Math.floor(reviewsContainer.offsetWidth / (300 + 30));
        cardWidth = 300 + 30;
    }
    
    const offset = -currentCarouselIndex * cardWidth * cardsPerView;
    reviewsContainer.style.transform = `translateX(${offset}px)`;
    
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCarouselIndex);
    });
}

function goToSlide(index) {
    const reviewCards = document.querySelectorAll('.review-card');
    const cardsPerView = Math.floor(window.innerWidth <= 767 ? 1 : window.innerWidth <= 1023 ? 2 : Math.floor((document.getElementById('reviewsContainer')?.offsetWidth || 1200) / (300 + 30)));
    const maxIndex = Math.ceil(reviewCards.length / cardsPerView) - 1;
    currentCarouselIndex = Math.max(0, Math.min(index, maxIndex));
    updateCarousel();
}

function initializeReviewCarouselControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const reviewsContainer = document.getElementById('reviewsContainer');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentCarouselIndex - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentCarouselIndex + 1);
        });
    }
    
    if (reviewsContainer) {
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
                goToSlide(currentCarouselIndex + 1);
            }
            
            if (touchEndX > touchStartX + swipeThreshold) {
                goToSlide(currentCarouselIndex - 1);
            }
        }
    }
}

function initializeReviewModal() {
    const addReviewBtn = document.getElementById('addReviewBtn');
    const reviewModal = document.getElementById('reviewModal');
    const cancelReview = document.getElementById('cancelReview');
    const submitReview = document.getElementById('submitReview');
    
    if (addReviewBtn) {
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
            
            if (reviewModal) {
                reviewModal.style.display = 'flex';
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    if (cancelReview && reviewModal) {
        cancelReview.addEventListener('click', () => {
            reviewModal.style.display = 'none';
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    if (submitReview) {
        submitReview.addEventListener('click', () => {
            const reviewProduct = document.getElementById('reviewProduct');
            const rating = document.querySelector('input[name="rating"]:checked');
            const reviewText = document.getElementById('userReview').value;
            
            if (!reviewProduct || !reviewProduct.value) {
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
            
            const productId = parseInt(reviewProduct.value);
            const review = {
                productId: productId,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Customer',
                rating: parseInt(rating.value),
                reviewText: reviewText.trim(),
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            db.collection('reviews').add(review)
                .then(() => {
                    alert('Thank you for your review! It will be published after moderation.');
                    if (reviewModal) {
                        reviewModal.style.display = 'none';
                        overlay.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                    
                    if (reviewProduct) reviewProduct.value = '';
                    document.querySelectorAll('input[name="rating"]').forEach(input => {
                        input.checked = false;
                    });
                    const userReview = document.getElementById('userReview');
                    if (userReview) userReview.value = '';
                })
                .catch((error) => {
                    console.error("Error submitting review:", error);
                    alert('Error submitting review. Please try again.');
                });
        });
    }
    
    if (reviewModal) {
        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                reviewModal.style.display = 'none';
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

function updateReviewProductDropdown() {
    const reviewProduct = document.getElementById('reviewProduct');
    if (!reviewProduct) return;
    
    reviewProduct.innerHTML = '<option value="">Select a product you\'ve purchased</option>';
    
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

function initIndexPage() {
    initializeQuickView();
    initializeProductCards();
    initializeCategoryFilter();
    initializeBannerImages();
    loadApprovedReviews();
    initializeReviewCarouselControls();
    initializeReviewModal();
    
    const originalLoadUserData = window.loadUserData;
    window.loadUserData = function(userId) {
        if (originalLoadUserData) {
            originalLoadUserData(userId);
        }
        setTimeout(updateReviewProductDropdown, 500);
    };
    
    window.addEventListener('resize', () => {
        initializeCarousel();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initIndexPage();
});
