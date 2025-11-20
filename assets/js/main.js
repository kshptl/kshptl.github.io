document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Lenis (Smooth Scrolling)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // 2. Custom Cursor Logic
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Immediate update for the small dot
        gsap.to(cursor, {
            x: mouseX,
            y: mouseY,
            duration: 0
        });
    });

    // Smooth follower update
    gsap.ticker.add(() => {
        const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
        cursorX += (mouseX - cursorX) * dt;
        cursorY += (mouseY - cursorY) * dt;

        gsap.set(cursorFollower, {
            x: cursorX,
            y: cursorY
        });
    });

    // Hover effects for cursor
    const links = document.querySelectorAll('a, button, .project-item');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursorFollower.classList.add('active');
        });
        link.addEventListener('mouseleave', () => {
            cursorFollower.classList.remove('active');
        });
    });

    // 3. Text Scramble Effect
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

    // Apply Scramble to Hero Title
    const phrases = ['DATA', 'SCIENCE'];
    const el = document.querySelectorAll('.scramble-text');

    el.forEach((element) => {
        const fx = new TextScramble(element);
        // Delay start slightly
        setTimeout(() => {
            fx.setText(element.innerText);
        }, 500);
    });


    // 4. Fixed Project Preview Logic
    const projectItems = document.querySelectorAll('.project-item');
    const previewWrapper = document.querySelector('.project-preview-wrapper');
    const previewImage = document.querySelector('.project-preview');

    projectItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const imageUrl = item.getAttribute('data-image');
            previewImage.style.backgroundImage = `url(${imageUrl})`;

            // Reveal wrapper
            gsap.to(previewWrapper, {
                opacity: 1,
                duration: 0.3,
                scale: 1,
                ease: 'power2.out'
            });

            // Slight zoom effect on image
            gsap.fromTo(previewImage,
                { scale: 1.1 },
                { scale: 1, duration: 0.5, ease: 'power2.out' }
            );
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(previewWrapper, {
                opacity: 0,
                duration: 0.3,
                scale: 0.95,
                ease: 'power2.out'
            });
        });
    });

    // 5. GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Footer Parallax/Reveal
    gsap.from('.footer-title', {
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 80%',
            end: 'bottom bottom',
            scrub: 1
        },
        y: 100,
        opacity: 0
    });

});
