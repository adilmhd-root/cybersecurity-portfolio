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
            const originalBtnContent = submitBtn.innerHTML;

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
                // Animation Step 1: Scale Down & Spinner
                submitBtn.disabled = true;
                submitBtn.classList.add('processing');
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

                // Send to Cloudflare Worker
                const response = await fetch('https://telegram-relay.adilmuhammedxp.workers.dev', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text
                    })
                });

                if (response.ok) {
                    // Animation Step 2: Morph to Checkmark
                    // Use a slight delay to ensure the spinner is seen if the request is too fast
                    setTimeout(() => {
                        submitBtn.innerHTML = '<i class="fas fa-check" style="color: #059669;"></i>'; // Emerald-600 for premium dark feeling

                        // Animation Step 3: Change Label to "Sent"
                        setTimeout(() => {
                            submitBtn.textContent = 'Sent';
                            // Optional: Keep it slightly scaled or return to normal?
                            // "Slightly scale down" was step 1. Usually we return to normal on completion.
                            submitBtn.classList.remove('processing');
                            contactForm.reset();

                            // Reset to original state after 3 seconds
                            setTimeout(() => {
                                submitBtn.innerHTML = originalBtnContent;
                                submitBtn.disabled = false;
                            }, 3000);
                        }, 1000); // Show checkmark for 1s
                    }, 500); // Minimum spinner time

                } else {
                    throw new Error('Telegram API Error');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                submitBtn.innerHTML = '<i class="fas fa-times" style="color: #ef4444;"></i>';
                submitBtn.classList.remove('processing');

                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    // --- 6. End Section Interaction (Easter Egg) ---
    const endTrigger = document.querySelector('.end-section-trigger');
    const lockIcon = document.querySelector('.lock-icon');
    const checkIcon = document.querySelector('.check-icon');
    const endCursor = document.querySelector('.end-cursor');
    let hasTriggeredEnd = false;

    if (endTrigger) {
        const endObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasTriggeredEnd) {
                    hasTriggeredEnd = true;
                    triggerEndSequence();
                }
            });
        }, { threshold: 0.6 }); // Trigger when mostly visible

        endObserver.observe(endTrigger);
    }

    function triggerEndSequence() {
        // 1. Glitch Effect (0.2s)
        document.body.classList.add('glitch-effect-active');

        setTimeout(() => {
            document.body.classList.remove('glitch-effect-active');

            // 2. Lock Appear & Flicker (0.4s)
            lockIcon.classList.add('lock-appear');

            setTimeout(() => {
                // 3. Lock Shake (0.4s)
                lockIcon.classList.add('lock-shake');

                setTimeout(() => {
                    // 4. Transform to Checkmark
                    lockIcon.style.opacity = '0';
                    checkIcon.classList.add('check-show');

                    setTimeout(() => {
                        // 5. Fade Out Checkmark
                        checkIcon.classList.add('icon-fade-out');

                        setTimeout(() => {
                            // 6. Blinking Cursor (3s)
                            endCursor.classList.add('end-cursor-blink');

                            setTimeout(() => {
                                // 7. Stop Motion (Static Cursor)
                                endCursor.classList.remove('end-cursor-blink');
                                endCursor.style.opacity = '1';
                            }, 3000);

                        }, 800); // Wait bit before cursor
                    }, 1500); // Checkmark visible time
                }, 500); // Shake time
            }, 500); // Flicker time
        }, 250); // Glitch time
    }

    // --- 7. Hero Text Scramble Effect ---
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }

        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }

        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="dud">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }

        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    // Initialize Scramble on "Researcher."
    const titleSpan = document.querySelector('.text-gradient');
    if (titleSpan) {
        const phrases = ['Researcher.', 'Analyst.', 'Operator.', 'Researcher.'];
        const fx = new TextScramble(titleSpan);

        let counter = 0;
        const next = () => {
            fx.setText(phrases[counter]).then(() => {
                setTimeout(next, 2000);
            });
            counter = (counter + 1) % phrases.length;
        };

        // Start delay
        setTimeout(next, 1000);
    }

});
