console.log('Minimalist Portfolio Loaded');

const roles = [
    "Data Scientist",
    "Data Engineer",
    "Data Storyteller"
];

const el = document.getElementById('typewriter');
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function type() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
        el.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
    } else {
        el.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500; // Pause before typing next
    }

    setTimeout(type, typeSpeed);
}

// Start typing
document.addEventListener('DOMContentLoaded', type);
