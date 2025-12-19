// Main JavaScript for Portfolio

document.addEventListener("DOMContentLoaded", function () {
    // Initialize Particles.js
    initParticles();
    
    // Initialize Navbar scroll behavior
    initNavbarScroll();
    
    // Initialize Mobile Menu
    initMobileMenu();
    
    // Initialize Smooth Scroll
    initSmoothScroll();
    
    // Initialize Sliding Panels
    initSlidingPanels();
});

// Particles.js Configuration
function initParticles() {
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            particles: {
                number: {
                    value: 80,
                    density: { enable: true, value_area: 800 }
                },
                color: { value: "#ffffff" },
                shape: {
                    type: "circle",
                    stroke: { width: 0, color: "#000000" }
                },
                opacity: { 
                    value: 0.4, 
                    random: true,
                    anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
                },
                size: { 
                    value: 3, 
                    random: true,
                    anim: { enable: true, speed: 2, size_min: 0.5, sync: false }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.3,
                    width: 1
                },
                move: { 
                    enable: true, 
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.5 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }
}

// Navbar Scroll Behavior
function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener("scroll", function() {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            navbar.classList.add("solid");
            navbar.classList.remove("bg-transparent");
        } else {
            navbar.classList.remove("solid");
            navbar.classList.add("bg-transparent");
        }
        
        lastScroll = currentScroll;
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenuBtn.addEventListener("click", function() {
        mobileMenu.classList.toggle("hidden");
        mobileMenu.classList.toggle("open");
        
        // Toggle icon
        const icon = mobileMenuBtn.querySelector("i");
        if (mobileMenu.classList.contains("hidden")) {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
        } else {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-times");
        }
    });
    
    // Close menu when clicking a link
    mobileMenu.querySelectorAll("a, button").forEach(link => {
        link.addEventListener("click", function() {
            mobileMenu.classList.add("hidden");
            mobileMenu.classList.remove("open");
            const icon = mobileMenuBtn.querySelector("i");
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
        });
    });
}

// Smooth Scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            if (href === "#") return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const navbarHeight = document.getElementById("navbar")?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}

// Sliding Panels
function initSlidingPanels() {
    // Close panel when clicking outside
    document.addEventListener("click", function(e) {
        const panels = document.querySelectorAll('.sliding-panel');
        const isClickInsidePanel = e.target.closest('.sliding-panel');
        const isNavButton = e.target.closest('.nav-link, button[onclick^="showContent"]');
        
        if (!isClickInsidePanel && !isNavButton) {
            panels.forEach(panel => {
                panel.classList.remove('active');
            });
            document.body.classList.remove('panel-open');
        }
    });
    
    // Close on Escape key
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            document.querySelectorAll('.sliding-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            document.body.classList.remove('panel-open');
        }
    });
}

// Show content panel
function showContent(sectionId) {
    // Close all panels first
    document.querySelectorAll('.sliding-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Open the selected panel
    const panel = document.getElementById(sectionId);
    if (panel) {
        panel.classList.add('active');
        document.body.classList.add('panel-open');
    }
}

// Close specific panel
function closePanel(sectionId) {
    const panel = document.getElementById(sectionId);
    if (panel) {
        panel.classList.remove('active');
        document.body.classList.remove('panel-open');
    }
}

// Expose functions globally
window.showContent = showContent;
window.closePanel = closePanel;
