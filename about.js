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
  // Add visual feedback
  this.classList.add('adding');
  
  // Remove adding class after animation
  setTimeout(() => {
    this.classList.remove('adding');
  }, 400);
});

// Quick View Wishlist functionality
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

// Initialize page-specific functionality
initScrollAnimations();