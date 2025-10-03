   // Load common components
    async function loadCommonComponents() {
      try {
        // Load common head
        const headResponse = await fetch('common-head.html');
        const headData = await headResponse.text();
        document.getElementById('common-head').innerHTML = headData;
        
        // Load common header
        const headerResponse = await fetch('common-header.html');
        const headerData = await headerResponse.text();
        document.getElementById('common-header').innerHTML = headerData;
        
        // Load common footer
        const footerResponse = await fetch('common-footer.html');
        const footerData = await footerResponse.text();
        document.getElementById('common-footer').innerHTML = footerData;
        
        // Wait a bit for the DOM to be ready, then initialize
        setTimeout(() => {
          // Initialize index-specific functionality
          initializeIndexPage();
        }, 100);
        
      } catch (error) {
        console.error('Error loading common components:', error);
      }
    }

    // Initialize index-specific functionality
    function initializeIndexPage() {
      console.log("Initializing index page functionality...");
      
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

      // Product Elements
      const productCards = document.querySelectorAll('.product-card');

      // Reviews Elements
      const reviewsContainer = document.getElementById('reviewsContainer');
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const carouselDots = document.getElementById('carouselDots');
      const addReviewBtn = document.getElementById('addReviewBtn');
      const reviewModal = document.getElementById('reviewModal');
      const cancelReview = document.getElementById('cancelReview');
      const submitReview = document.getElementById('submitReview');
      const reviewProduct = document.getElementById('reviewProduct');

      // State variables for index page
      let currentCarouselIndex = 0;
      let approvedReviews = [];
      let currentQuickViewProductId = null;

      // Product data for index page
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

      // Banner rotating images functionality
      const bannerWrapper = document.querySelector(".banner-wrapper");
      if (bannerWrapper) {
        const rotatingImage = document.createElement("img");
        rotatingImage.className = "banner-overlay-outside";
        bannerWrapper.appendChild(rotatingImage);

        const imagesConfig = [
          {
            src: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(9)%20(1).png?updatedAt=1756992468273",
            top: "-15px",
            width: "260px",
            alt: "Artistic honey jar with honeycomb pattern and golden glow"
          },
          {
            src: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(2).png?updatedAt=1756995663739",
            top: "-50px",
            width: "390px",
            alt: "Honey dipper dripping golden honey with honeycomb background"
          },
          {
            src: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(4).png?updatedAt=1756995663681",
            top: "-60px",
            width: "490px",
            alt: "Close-up of honeycomb cells filled with golden honey"
          },
          {
            src: "https://ik.imagekit.io/hexaanatura/Adobe%20Express%20-%20file%20(3).png?updatedAt=1756995663635",
            top: "-40px",
            width: "400px",
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
            rotatingImage.style.width = config.width;
            rotatingImage.style.opacity = 1;
          }, 800);
        }
        showImage(index);
        setInterval(() => {
          index = (index + 1) % imagesConfig.length;
          showImage(index);
        }, 4000);
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
      
      // Initialize product display
      productCards.forEach(card => {
        if (card.dataset.category === "premium") {
          card.style.display = "none";
        }
      });
      centerProducts("crystal");
      
      // Add event listeners to category buttons
      categoryBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          categoryBtns.forEach((b) => {
            b.classList.remove("active");
            b.setAttribute("aria-pressed", "false");
          });
          btn.classList.add("active");
          btn.setAttribute("aria-pressed", "true");
          const category = btn.dataset.category;
          productCards.forEach((card) => {
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

      // Initialize product cards with data-id attributes and event listeners
      function initializeProductCards() {
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
          
          if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              addToCartBtn.classList.add('adding');
              
              // This function should be available from common functionality
              if (typeof addToCart === 'function') {
                addToCart(productId, 1);
              }
              
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
              
              // These functions should be available from common functionality
              if (typeof likedProducts !== 'undefined' && typeof addToLikes === 'function' && typeof removeFromLikes === 'function') {
                if (likedProducts.includes(productId)) {
                  removeFromLikes(productId);
                } else {
                  addToLikes(productId);
                  wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
                  wishlistBtn.style.background = '#ff4d4d';
                  wishlistBtn.style.color = 'white';
                }
              }
            });
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
                if (typeof likedProducts !== 'undefined') {
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
                
                if (quickViewModal) quickViewModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
              }
            }
          });
        });
      }

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
        if (quickViewModal) quickViewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }

      // Quick View Add to Cart functionality
      if (quickViewAddToCartBtn) {
        quickViewAddToCartBtn.addEventListener('click', function() {
          if (currentQuickViewProductId) {
            // Add visual feedback
            this.classList.add('adding');
            
            // Add to cart - this function should be available from common functionality
            if (typeof addToCart === 'function') {
              addToCart(currentQuickViewProductId, 1);
            }
            
            // Remove adding class after animation
            setTimeout(() => {
              this.classList.remove('adding');
            }, 400);
          }
        });
      }

      // Quick View Wishlist functionality
      if (quickViewWishlistBtn) {
        quickViewWishlistBtn.addEventListener('click', function() {
          if (currentQuickViewProductId && typeof likedProducts !== 'undefined' && typeof addToLikes === 'function' && typeof removeFromLikes === 'function') {
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

      // Reviews Carousel Functionality
      function loadApprovedReviews() {
        // For now, show sample reviews
        // In a real implementation, you would fetch from Firebase
        showSampleReviews();
      }

      // Show sample reviews as fallback
      function showSampleReviews() {
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
          },
          {
            userName: "David Brown",
            userLocation: "Sydney, Australia",
            rating: 4,
            reviewText: "Great quality honey at an affordable price. The packaging is beautiful and makes for a perfect gift.",
            createdAt: { toDate: () => new Date('2023-05-12') }
          },
          {
            userName: "Maria Garcia",
            userLocation: "Madrid, Spain",
            rating: 5,
            reviewText: "I'm impressed with the purity of this honey. No additives, just pure natural goodness. Will definitely order again!",
            createdAt: { toDate: () => new Date('2023-06-08') }
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
        
        if (reviewsContainer) {
          reviewsContainer.appendChild(reviewCard);
        }
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

      // Initialize carousel
      function initializeCarousel() {
        const reviewCards = document.querySelectorAll('.review-card');
        if (reviewCards.length === 0) return;
        
        const cardsPerView = Math.floor(reviewsContainer.offsetWidth / (300 + 30));
        const totalSlides = Math.ceil(reviewCards.length / cardsPerView);
        
        if (carouselDots) {
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
        }
        
        updateCarousel();
      }

      function updateCarousel() {
        const reviewCards = document.querySelectorAll('.review-card');
        if (reviewCards.length === 0) return;
        
        const cardsPerView = Math.floor(reviewsContainer.offsetWidth / (300 + 30));
        const offset = -currentCarouselIndex * (300 + 30) * cardsPerView;
        if (reviewsContainer) {
          reviewsContainer.style.transform = `translateX(${offset}px)`;
        }
        
        if (carouselDots) {
          document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentCarouselIndex);
          });
        }
      }

      function goToSlide(index) {
        const reviewCards = document.querySelectorAll('.review-card');
        if (reviewCards.length === 0) return;
        
        const cardsPerView = Math.floor(reviewsContainer.offsetWidth / (300 + 30));
        const maxIndex = Math.ceil(reviewCards.length / cardsPerView) - 1;
        currentCarouselIndex = Math.max(0, Math.min(index, maxIndex));
        updateCarousel();
      }

      // Carousel navigation
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

      // Update on window resize
      window.addEventListener('resize', () => {
        const reviewCards = document.querySelectorAll('.review-card');
        if (reviewCards.length === 0) return;
        
        const cardsPerView = Math.floor(reviewsContainer.offsetWidth / (300 + 30));
        const totalSlides = Math.ceil(reviewCards.length / cardsPerView);
        
        if (carouselDots) {
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
        }
        
        currentCarouselIndex = 0;
        updateCarousel();
      });

      // Review modal functionality
      if (addReviewBtn) {
        addReviewBtn.addEventListener('click', () => {
          // Check if user is logged in - this should be available from common functionality
          if (typeof currentUser === 'undefined' || !currentUser) {
            alert('Please login to add a review');
            return;
          }
          
          // For demo purposes, we'll show the modal
          // In a real implementation, you would check if user has orders
          if (reviewModal) {
            reviewModal.style.display = 'flex';
          }
        });
      }

      if (cancelReview) {
        cancelReview.addEventListener('click', () => {
          if (reviewModal) reviewModal.style.display = 'none';
        });
      }

      if (submitReview) {
        submitReview.addEventListener('click', () => {
          const rating = document.querySelector('input[name="rating"]:checked');
          const reviewText = document.getElementById('userReview').value;
          
          if (!rating) {
            alert('Please provide a rating');
            return;
          }
          
          if (!reviewText.trim()) {
            alert('Please write a review');
            return;
          }
          
          // For demo purposes, we'll just show a success message
          // In a real implementation, you would save to Firebase
          alert('Thank you for your review! It will be published after moderation.');
          if (reviewModal) reviewModal.style.display = 'none';
          
          // Reset form
          document.querySelectorAll('input[name="rating"]').forEach(input => {
            input.checked = false;
          });
          document.getElementById('userReview').value = '';
        });
      }

      if (reviewModal) {
        reviewModal.addEventListener('click', (e) => {
          if (e.target === reviewModal) {
            reviewModal.style.display = 'none';
          }
        });
      }

      // Initialize everything for index page
      initializeProductCards();
      loadApprovedReviews();
    }

    // Start loading everything when the page loads
    document.addEventListener('DOMContentLoaded', function() {
      loadCommonComponents();
    });
