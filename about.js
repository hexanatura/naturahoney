// About Page Specific Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('About page loaded');
    
    // Initialize any About page specific animations or interactions
    initAboutPageAnimations();
    
    // Add any About page specific event listeners
    initAboutPageInteractions();
});

// Initialize About page animations
function initAboutPageAnimations() {
    // Add scroll-triggered animations for About page sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add specific animations for different sections
                if (entry.target.id === 'story-section') {
                    animateStorySection(entry.target);
                } else if (entry.target.id === 'values-section') {
                    animateValuesSection(entry.target);
                } else if (entry.target.id === 'team-section') {
                    animateTeamSection(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe main content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Enhanced banner animation
    enhanceBannerAnimation();
}

// Modify the enhanceBannerAnimation function
function enhanceBannerAnimation() {
    const banner = document.querySelector('.rectangle-banner');
    if (!banner) return;

    // Remove any transform that might be applied
    banner.style.transform = 'none';
    
    // Optional: Add a subtle effect that doesn't affect scrolling
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        // Very subtle opacity change instead of movement
        const opacity = Math.max(0.9, 1 - scrolled * 0.001);
        banner.style.opacity = opacity;
    });
}

// Animate story section elements
function animateStorySection(section) {
    const storyImage = section.querySelector('.story-image');
    const storyContent = section.querySelector('.story-content');
    
    if (storyImage) {
        storyImage.style.animation = 'fadeInLeft 0.8s ease-out';
    }
    
    if (storyContent) {
        storyContent.style.animation = 'fadeInRight 0.8s ease-out';
    }
}

// Animate values section cards with stagger effect
function animateValuesSection(section) {
    const valueCards = section.querySelectorAll('.value-card');
    
    valueCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.style.animation = 'fadeInUp 0.6s ease-out forwards';
    });
}

// Animate team section with individual delays
function animateTeamSection(section) {
    const teamMembers = section.querySelectorAll('.team-member');
    
    teamMembers.forEach((member, index) => {
        member.style.animationDelay = `${index * 0.3}s`;
        member.style.animation = 'fadeInUp 0.8s ease-out forwards';
    });
}

// Initialize About page specific interactions
function initAboutPageInteractions() {
    // Add hover effects for team members
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
        });
        
        member.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
        });
    });

    // Add click handlers for team social links
    const socialLinks = document.querySelectorAll('.team-social a');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className.split('-')[1];
            showSocialTooltip(platform);
        });
    });

    // Add smooth scrolling for internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add loading animation for images
    const images = document.querySelectorAll('.story-image img, .team-member-img img');
    
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        });
        
        // Set initial state
        img.style.opacity = '0';
        img.style.transform = 'scale(1.1)';
        img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
}

// Show tooltip for social media links
function showSocialTooltip(platform) {
    const platformNames = {
        'linkedin-in': 'LinkedIn',
        'twitter': 'Twitter',
        'instagram': 'Instagram',
        'facebook-f': 'Facebook'
    };
    
    const platformName = platformNames[platform] || platform;
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.textContent = `Visit our ${platformName}`;
    tooltip.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(95, 43, 39, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-family: 'Unbounded', sans-serif;
        font-size: 14px;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    // Animate in
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 300);
    }, 2000);
}

// Add CSS animations for About page
function addAboutPageStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes fadeInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .value-card, .team-member {
            opacity: 0;
        }
        
        /* Enhanced hover effects for About page */
        .value-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 15px 30px rgba(95, 43, 39, 0.15);
        }
        
        .team-member:hover .team-member-info {
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
        }
        
        .story-image:hover img {
            transform: scale(1.08);
        }
        
        /* Loading states */
        .content-section {
            min-height: 50vh;
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything when page loads
window.addEventListener('load', function() {
    addAboutPageStyles();
    
    // Add loading state
    document.body.classList.add('about-page-loaded');
    
    console.log('About page fully loaded and initialized');
});

// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAboutPageAnimations,
        initAboutPageInteractions,
        enhanceBannerAnimation
    };
}

