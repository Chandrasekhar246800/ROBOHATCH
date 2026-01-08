// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add to cart functionality
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        cartCount++;
        cartCountElement.textContent = cartCount;
        
        // Add animation feedback
        this.style.transform = 'rotate(360deg) scale(1.2)';
        setTimeout(() => {
            this.style.transform = '';
        }, 300);
        
        // Show notification (optional)
        showNotification('Product added to cart!');
    });
});

// Simple notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #F25C05;
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add slide animations to style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
    animatedElements.forEach(el => observer.observe(el));
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// Product card click handler (for demo purposes)
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.add-to-cart')) {
            const productName = this.querySelector('h3').textContent;
            console.log(`Viewing product: ${productName}`);
            // In a real application, this would navigate to the product detail page
        }
    });
});

// Category card click handler
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
        const categoryName = this.querySelector('h3').textContent;
        console.log(`Browsing category: ${categoryName}`);
        // In a real application, this would navigate to the category page
    });
});

// Newsletter form handler
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    const subscribeBtn = newsletterForm.querySelector('.subscribe-btn');
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    
    subscribeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = emailInput.value;
        
        if (email && email.includes('@')) {
            showNotification('Successfully subscribed to newsletter!');
            emailInput.value = '';
        } else {
            showNotification('Please enter a valid email address');
        }
    });
}

// CTA Button click handler
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        const productsSection = document.querySelector('#products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}
