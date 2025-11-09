// About Page JavaScript
console.log('About page loaded');

// Quick View Modal Elements
const quickViewModal = document.getElementById('quickViewModal');
const quickViewClose = document.getElementById('quickViewClose');

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

// Initialize about page
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
});
