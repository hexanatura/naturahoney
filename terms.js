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
