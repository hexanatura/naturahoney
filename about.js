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

// Initialize about page
document.addEventListener('DOMContentLoaded', function() {
    console.log('About page initialized');
});
