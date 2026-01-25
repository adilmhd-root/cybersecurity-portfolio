document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Custom Cursor Logic ---
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    // Check if device supports hover (desktop)
    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with slight lag (handled by CSS transition usually, but let's encourage smoothness)
            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
        });

        // Hover Effect on interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .bento-card, .flow-stage');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovering');
            });
        });
    } else {
        // Hide custom cursor on touch devices
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorOutline) cursorOutline.style.display = 'none';
    }


    // --- 2. Scroll Reveal Animation (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(el => observer.observe(el));

    // Staggered animation for framework and deployment cards
    const cardObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                cardObserver.unobserve(entry.target);
            }
        });
    }, cardObserverOptions);

    const frameworkCards = document.querySelectorAll('.framework-card');
    const deploymentCards = document.querySelectorAll('.deployment-card');
    
    frameworkCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        cardObserver.observe(card);
    });

    deploymentCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        cardObserver.observe(card);
    });


    // --- 3. Attack-Defense Flow Animation ---
    const flowStages = document.querySelectorAll('.flow-stage');
    const flowConnectors = document.querySelectorAll('.flow-connector');
    const flowSection = document.querySelector('.attack-defense-flow');

    if (flowSection) {
        const flowObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startFlowAnimation();
                    flowObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 }); // Trigger when 20% visible

        flowObserver.observe(flowSection);
    }

    function startFlowAnimation() {
        // Activate stages sequentially
        flowStages.forEach((stage, index) => {
            setTimeout(() => {
                stage.classList.add('active');
            }, index * 800); // 800ms delay per stage
        });

        // Activate connectors sequentially (offset by 400ms to happen between stages)
        flowConnectors.forEach((connector, index) => {
            setTimeout(() => {
                connector.classList.add('active');
            }, (index * 800) + 400);
        });
    }


    // --- 4. Mobile Navigation Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('is-active');
        });
    }

    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu) navMenu.classList.remove('active');
            });
        });
    }

// --- 5. Telegram Contact Form Integration ---
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        // Get form values
        const name = contactForm.querySelector('input[name="name"]').value;
        const email = contactForm.querySelector('input[name="email"]').value;
        const subject = contactForm.querySelector('input[name="subject"]').value;
        const message = contactForm.querySelector('textarea[name="message"]').value;

        // Format Message
        const text = `
📩 *New Portfolio Contact*

👤 *Name:* ${name}
📧 *Email:* ${email}
📝 *Subject:* ${subject}

💬 *Message:*
${message}
        `;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Send to Cloudflare Worker (SAFE)
            const response = await fetch(
                "https://telegram-relay.adilmuhammedxp.workers.dev",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: text
                    })
                }
            );

            if (response.ok) {
                // Success
                submitBtn.style.backgroundColor = '#10B981'; // Green
                submitBtn.textContent = 'Message Sent! 🚀';
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.style.backgroundColor = '';
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Worker API Error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            submitBtn.style.backgroundColor = '#EF4444'; // Red
            submitBtn.textContent = 'Failed to Send';

            setTimeout(() => {
                submitBtn.style.backgroundColor = '';
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}
