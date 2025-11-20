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

    // 3. GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero Text Reveal
    const heroTl = gsap.timeline();

    heroTl.from('.hero-title .line', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.5
    })
        .from('.hero-sub p', {
            y: 20,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=1');

    // Project Image Reveal on Hover
    const projectItems = document.querySelectorAll('.project-item');

    projectItems.forEach(item => {
        const img = item.querySelector('.project-img-reveal');

        item.addEventListener('mousemove', (e) => {
            const itemRect = item.getBoundingClientRect();
            // Calculate position relative to the item
            const x = e.clientX - itemRect.left;
            const y = e.clientY - itemRect.top;

            gsap.to(img, {
                x: x,
                y: y,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
    });

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
