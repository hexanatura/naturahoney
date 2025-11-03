function initAboutPage() {
    initScrollAnimations();
    initProfilePage();
}

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

function initProfilePage() {
    // Ensure profile page elements exist
    const profilePage = document.getElementById('profilePage');
    const mainContent = document.getElementById('mainContent');
    const profileCloseBtn = document.getElementById('profileCloseBtn');
    
    if (profilePage && mainContent && profileCloseBtn) {
        // Add event listener for profile close button
        profileCloseBtn.addEventListener('click', function() {
            profilePage.classList.remove('active');
            mainContent.style.display = 'block';
        });
    }
    
    // Override the profile link click handler for About page
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown) {
                userDropdown.classList.remove('active');
            }
            
            if (currentUser) {
                showProfilePage();
            } else {
                closeAllSidebars();
                showLoginView();
                loginModal.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }
}

function showProfilePage() {
    const profilePage = document.getElementById('profilePage');
    const mainContent = document.getElementById('mainContent');
    
    if (profilePage && mainContent) {
        mainContent.style.display = 'none';
        profilePage.classList.add('active');
        
        // Load user data if user is logged in
        if (currentUser) {
            loadUserData(currentUser.uid);
        }
    }
}

// Make sure common.js is loaded first, then initialize about page
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure common.js is loaded
    setTimeout(() => {
        initAboutPage();
    }, 100);
});
