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

// Particles.js Configuration - Tuned for Gold/Green Constellation
function initParticles() {
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            particles: {
                number: {
                    value: 60,
                    density: { enable: true, value_area: 800 }
                },
                color: { value: "#fbbf24" }, // Amber/Gold color
                shape: {
                    type: "circle",
                    stroke: { width: 0, color: "#000000" }
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: { enable: false }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#fbbf24", // Amber connecting lines
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
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
                    grab: { distance: 180, line_linked: { opacity: 0.4 } },
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

    window.addEventListener("scroll", function () {
        if (window.scrollY > 50) {
            navbar.classList.add("bg-dark-950/90", "backdrop-blur-md", "shadow-sm");
            navbar.classList.remove("bg-transparent");
        } else {
            navbar.classList.remove("bg-dark-950/90", "backdrop-blur-md", "shadow-sm");
            navbar.classList.add("bg-transparent");
        }
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener("click", function () {
        mobileMenu.classList.toggle("hidden");
        // Icon toggle logic here if needed
    });

    // Close menu when clicking a link
    mobileMenu.querySelectorAll("a, button").forEach(link => {
        link.addEventListener("click", function () {
            mobileMenu.classList.add("hidden");
        });
    });
}

// Smooth Scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (href === "#") return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const navbarHeight = document.getElementById("navbar")?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

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
    document.addEventListener("click", function (e) {
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
    document.addEventListener("keydown", function (e) {
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
