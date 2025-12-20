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
