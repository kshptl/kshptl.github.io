class DigitalWorld {
    constructor() {
        this.canvas = document.getElementById('digital-world');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // World dimensions (approximate, will update on resize)
        this.docHeight = document.documentElement.scrollHeight;

        this.particles = [];
        this.domNodes = [];

        this.mouseX = 0;
        this.mouseY = 0;
        this.scrollY = window.scrollY;

        // Configuration
        this.particleCount = Math.min(window.innerWidth / 10, 150); // More particles for full page
        this.connectionDistance = 150;
        this.mouseDistance = 250;
        this.elementDistance = 200;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });

        // Update DOM node positions periodically
        this.updateDomNodes();
        // Update nodes on scroll to handle dynamic layout changes if any
        window.addEventListener('scroll', () => this.updateDomNodes());

        // Create initial particles distributed across the document height
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Node(this.width, this.docHeight));
        }

        this.animate();
    }

    updateDomNodes() {
        this.domNodes = [];

        // Select elements to connect to
        const elements = document.querySelectorAll('.scramble-text, .impact-card, .hero-subtitle, .nav-link, .footer-title');

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Store in WORLD coordinates (add scrollY)
            this.domNodes.push({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2 + window.scrollY,
                isElement: true
            });
        });
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.docHeight = document.documentElement.scrollHeight;

        this.updateDomNodes();

        // Adjust particle count based on screen size
        this.particleCount = Math.min(this.width / 10, 150);

        // Add more particles if needed, but don't remove existing ones to avoid flickering
        if (this.particles.length < this.particleCount) {
            for (let i = this.particles.length; i < this.particleCount; i++) {
                this.particles.push(new Node(this.width, this.docHeight));
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Current scroll position for rendering
        const currentScrollY = this.scrollY;

        // Mouse position in WORLD coordinates
        const worldMouseY = this.mouseY + currentScrollY;

        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(this.width, this.docHeight, this.mouseX, worldMouseY, this.mouseDistance);

            // Render relative to viewport
            // Only draw if visible in viewport
            const screenY = particle.y - currentScrollY;

            if (screenY > -50 && screenY < this.height + 50) {
                particle.draw(this.ctx, screenY);
            }
        });

        // Draw connections
        this.drawConnections(currentScrollY, worldMouseY);

        requestAnimationFrame(() => this.animate());
    }

    drawConnections(scrollY, worldMouseY) {
        this.ctx.lineWidth = 1;

        // 1. Connect particles to each other
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            // Optimization: Only check particles that are close vertically
            if (Math.abs(p1.y - scrollY - this.height / 2) > this.height) continue;

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const opacity = 1 - (distance / this.connectionDistance);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y - scrollY);
                    this.ctx.lineTo(p2.x, p2.y - scrollY);
                    this.ctx.stroke();
                }
            }
        }

        // 2. Connect particles to Mouse
        this.particles.forEach(particle => {
            const dx = particle.x - this.mouseX;
            const dy = particle.y - worldMouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.mouseDistance) {
                const opacity = 1 - (distance / this.mouseDistance);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y - scrollY);
                this.ctx.lineTo(this.mouseX, this.mouseY); // Mouse is already screen relative
                this.ctx.stroke();
            }
        });

        // 3. Connect particles to DOM Elements
        this.particles.forEach(particle => {
            // Optimization: Only check visible particles
            if (particle.y - scrollY < -50 || particle.y - scrollY > this.height + 50) return;

            this.domNodes.forEach(node => {
                const dx = particle.x - node.x;
                const dy = particle.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.elementDistance) {
                    const opacity = 1 - (distance / this.elementDistance);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y - scrollY);
                    this.ctx.lineTo(node.x, node.y - scrollY);
                    this.ctx.stroke();
                }
            });
        });
    }
}

class Node {
    constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5 + 0.5;
    }

    update(w, h, mouseX, worldMouseY, mouseDist) {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges (World boundaries)
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // Mouse Interaction: GENTLE ATTRACTION
        const dx = this.x - mouseX;
        const dy = this.y - worldMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseDist) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseDist - distance) / mouseDist;

            this.x -= forceDirectionX * force * 0.2;
            this.y -= forceDirectionY * force * 0.2;
        }
    }

    draw(ctx, screenY) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, screenY, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for layout to settle
    setTimeout(() => {
        new DigitalWorld();
    }, 100);
});
