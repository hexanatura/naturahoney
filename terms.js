    // Scroll behavior for notification bar and navbar
    let lastScrollTop = 0;
    const notificationBar = document.getElementById('notificationBar');
    const navBar = document.getElementById('navBar');
    
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Hide notification bar and move navbar up when scrolled down
      if (scrollTop > 50) {
        notificationBar.classList.add('hidden');
        navBar.classList.add('scrolled-up');
        document.querySelector('.content-wrapper').style.marginTop = '130px';
      } else {
        notificationBar.classList.remove('hidden');
        navBar.classList.remove('scrolled-up');
        document.querySelector('.content-wrapper').style.marginTop = '165px';
      }
      
      lastScrollTop = scrollTop;
    }, { passive: true });

// terms.js - Standalone version for Terms of Service page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Terms page loaded');
    
    // Load footer
    loadFooter();
    
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('overlay');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
            
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            if (mobileMenuBtn) {
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
    
    // Overlay click to close menu
    if (overlay) {
        overlay.addEventListener('click', () => {
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            if (mobileMenuBtn) {
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Scroll behavior for notification bar
    let lastScrollTop = 0;
    const notificationBar = document.getElementById('notificationBar');
    const navBar = document.getElementById('navBar');
    const contentWrapper = document.querySelector('.content-wrapper');
    
    if (notificationBar && navBar && contentWrapper) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 5) {
                if (!notificationBar.classList.contains('hidden')) {
                    notificationBar.classList.add('hidden');
                    navBar.style.top = '0';
                    contentWrapper.style.marginTop = '120px';
                }
            } else {
                if (notificationBar.classList.contains('hidden')) {
                    notificationBar.classList.remove('hidden');
                    navBar.style.top = '43px';
                    contentWrapper.style.marginTop = '165px';
                }
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, { passive: true });
    }
});

function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch("footer.html")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.text();
            })
            .then(html => {
                footerPlaceholder.innerHTML = html;
                console.log('Footer loaded successfully');
            })
            .catch(err => {
                console.error("Footer load failed", err);
                // Create a simple fallback footer
                footerPlaceholder.innerHTML = `
                    <footer style="background: #556b2f; color: white; padding: 40px 5%; text-align: center;">
                        <div style="max-width: 1200px; margin: 0 auto;">
                            <p style="font-family: 'Akira Expanded', sans-serif; font-size: 24px; margin-bottom: 20px;">
                                Natura Honey
                            </p>
                            <p style="margin-bottom: 10px; font-family: 'Unbounded', sans-serif;">&copy; ${new Date().getFullYear()} Natura Honey. All rights reserved.</p>
                            <p style="margin-bottom: 20px; font-family: 'Unbounded', sans-serif;">Contact: hexanatura.info@gmail.com | +91 6282 904614</p>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                                <p style="font-size: 14px; opacity: 0.8;">Thalassery, Kannur, Kerala, India</p>
                            </div>
                        </div>
                    </footer>
                `;
            });
    }
}
