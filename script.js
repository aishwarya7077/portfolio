/* ============================================
   PORTFOLIO - Interactive Scripts
   Dutpala Aishwarya
   AOS + GSAP ScrollTrigger + Lenis
   ============================================ */

// --- Retro Loading Screen ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('retro-loader');
    const progressBar = document.getElementById('retro-progress-bar');
    const percentageText = document.getElementById('retro-percentage');
    const statusText = document.querySelector('.retro-status');
    
    if (loader) {
        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 8 + 2; // steady increase
            if (progress > 100) progress = 100;
            
            progressBar.style.width = `${progress}%`;
            percentageText.textContent = `${Math.floor(progress)}%`;
            
            if (statusText) {
                if (progress < 30) {
                    statusText.textContent = "INITIALIZING BOOT SEQUENCE...";
                } else if (progress < 60) {
                    statusText.textContent = "MOUNTING PORTFOLIO SECTORS...";
                } else if (progress < 90) {
                    statusText.textContent = "LOADING CREATIVE ASSETS...";
                } else {
                    statusText.textContent = "SYSTEM REBOOTED SUCCESSFULLY!";
                }
            }
            
            if (progress === 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loader.classList.add('hidden');
                    document.body.style.overflow = '';
                    // We can restart lenis later if needed, but it's set up outside DOMContentLoaded anyway
                }, 800);
            }
        }, 120);
    }
});

// --- Lenis Smooth Scroll ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Connect Lenis to GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// --- AOS Init ---
AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
});

// --- Typewriter Effect ---
const typewriterTexts = [
    'Software Engineer',
    'Frontend Developer',
    'React.js Enthusiast',
    'UI/UX Designer',
    'Digital Artist'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterEl = document.getElementById('typewriter');

function typeWriter() {
    const currentText = typewriterTexts[textIndex];
    if (isDeleting) {
        typewriterEl.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterEl.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    let speed = isDeleting ? 40 : 80;
    if (!isDeleting && charIndex === currentText.length) {
        speed = 2000; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typewriterTexts.length;
        speed = 400;
    }
    setTimeout(typeWriter, speed);
}
typeWriter();

// --- Navbar Scroll ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// --- Mobile Navigation ---
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// --- Active Nav Link on Scroll ---
const sections = document.querySelectorAll('section[id]');

function setActiveNavLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
            document.querySelectorAll('.nav-link').forEach(link => {
                if (!link.classList.contains('nav-link-special')) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                }
            });
        }
    });
}
window.addEventListener('scroll', setActiveNavLink);

// --- Smooth Scroll with Lenis ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) lenis.scrollTo(target);
    });
});

// --- Particle Background ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 50;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.25 + 0.05;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(109, 40, 217, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
}

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
                const opacity = (1 - dist / 140) * 0.06;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(109, 40, 217, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// ===== CODE RAIN CANVAS (Hero Avatar) =====
function initCodeCanvas() {
    const codeCanvas = document.getElementById('codeCanvas');
    if (!codeCanvas) return;
    const cCtx = codeCanvas.getContext('2d');
    codeCanvas.width = 260;
    codeCanvas.height = 260;

    const chars = 'const let var function return if else for while => {} [] () import export class new this async await .map .filter React useState useEffect props render div span <> </> npm git push pull merge commit deploy build test'.split(' ');
    const columns = Math.floor(codeCanvas.width / 14);
    const drops = Array(columns).fill(0);

    function drawCode() {
        cCtx.fillStyle = 'rgba(15, 15, 26, 0.12)';
        cCtx.fillRect(0, 0, codeCanvas.width, codeCanvas.height);

        cCtx.font = '12px monospace';

        drops.forEach((y, i) => {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const hue = 270 + Math.random() * 40;
            const brightness = 50 + Math.random() * 30;
            cCtx.fillStyle = `hsl(${hue}, 80%, ${brightness}%)`;
            cCtx.fillText(char.charAt(Math.floor(Math.random() * char.length)), i * 14, y * 14);

            if (y * 14 > codeCanvas.height && Math.random() > 0.96) {
                drops[i] = 0;
            }
            drops[i]++;
        });
    }

    setInterval(drawCode, 80);
}
initCodeCanvas();

// ===== VINYL CD SCROLL SPIN =====
function initVinylCd() {
    const vinyl = document.getElementById('vinylCd');
    if (!vinyl) return;

    let isScrolling = false;
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            vinyl.classList.add('spinning');
            isScrolling = true;
        }
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            vinyl.classList.remove('spinning');
            isScrolling = false;
        }, 200);
    }, { passive: true });
}
initVinylCd();

// ===== GSAP ANIMATIONS =====

// --- Hero Parallax ---
gsap.to('.hero-visual', {
    y: 100,
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
    }
});

// --- Orb Parallax ---
document.querySelectorAll('.orb').forEach((orb, i) => {
    gsap.to(orb, {
        y: 60 + i * 25,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
        }
    });
});

// --- Cinematic Words Parallax ---
document.querySelectorAll('.cine-word').forEach((word, i) => {
    const direction = i % 2 === 0 ? 1 : -1;
    gsap.to(word, {
        y: (30 + (i % 5) * 15) * direction,
        rotation: 5 * direction,
        opacity: 0,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: '70% top',
            scrub: true,
        }
    });
});

// --- GSAP Skill Bars ---
document.querySelectorAll('.skill-fill').forEach(fill => {
    gsap.to(fill, {
        width: fill.getAttribute('data-width') + '%',
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: fill,
            start: 'top 85%',
            once: true,
        }
    });
});

// --- GSAP Count Up ---
document.querySelectorAll('.count-up').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    const obj = { val: 0 };
    gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power1.out',
        onUpdate: () => { el.textContent = Math.floor(obj.val); },
        scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
        }
    });
});

// --- GSAP Project Logo Reveal ---
document.querySelectorAll('.project-logo').forEach(logo => {
    gsap.fromTo(logo,
        { opacity: 0, scale: 0.6, y: 30 },
        {
            opacity: 1, scale: 1, y: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: logo,
                start: 'top 80%',
                once: true,
            },
            onComplete: () => logo.classList.add('logo-visible'),
        }
    );
});

// --- GSAP Section Headers Reveal ---
gsap.utils.toArray('.section-header').forEach(header => {
    gsap.from(header, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            once: true,
        }
    });
});

// --- GSAP Timeline Pulse ---
gsap.utils.toArray('.timeline-card').forEach(card => {
    gsap.from(card, {
        x: -60,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            once: true,
        }
    });
});

// --- GSAP Navbar Reveal ---
gsap.from('.navbar', {
    y: -80,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.5,
});

// --- GSAP Hero Stagger ---
gsap.from('.floating-badge', {
    scale: 0,
    opacity: 0,
    duration: 0.6,
    ease: 'back.out(2)',
    stagger: 0.2,
    delay: 1.5,
});

// --- GSAP Sidebar Reveal ---
gsap.from('.sidebar', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.2,
    delay: 2,
});

// ===== INTERACTION EFFECTS =====

// --- Tilt on Project Cards ---
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rx = (y - rect.height / 2) / 25;
        const ry = (rect.width / 2 - x) / 25;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-12px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// --- Magnetic Buttons ---
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translateY(-3px) translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// --- Card Hover Glow ---
document.querySelectorAll('.skill-category, .interest-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.background = `radial-gradient(circle 200px at ${x}px ${y}px, rgba(109,40,217,0.05), transparent), white`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
});

// --- Lightbox ---
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('.gallery-frame').forEach(frame => {
        frame.addEventListener('click', () => {
            const img = frame.querySelector('.gallery-img');
            if (img) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                lenis.stop();
            }
        });
    });

    function close() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lenis.start();
    }

    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
initLightbox();

// --- Contact Form ---
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        contactForm.reset();
    }, 3000);
});

// ===== EYE ANIMATION =====
function initEyes() {
    const eyes = document.querySelectorAll('.eye');
    if (!eyes.length) return;
    
    document.addEventListener('mousemove', (e) => {
        eyes.forEach(eye => {
            const pupil = eye.querySelector('.pupil');
            if (!pupil) return;
            
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;
            
            // Calculate angle and distance
            const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
            const maxDistance = (rect.width / 2) - (pupil.offsetWidth / 2) - 1; // 1px padding
            const distance = Math.min(
                Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 15,
                maxDistance
            );
            
            const pupilX = Math.cos(angle) * distance;
            const pupilY = Math.sin(angle) * distance;
            
            pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        });
    });
    
    // Random blink animation occasionally
    setInterval(() => {
        eyes.forEach(eye => {
            eye.classList.add('blink');
            setTimeout(() => {
                eye.classList.remove('blink');
            }, 200); // matches the css animation duration
        });
    }, 4500);
}
initEyes();

// ===== RESUME MODAL =====
function initResumeModal() {
    const modal = document.getElementById('resumeModal');
    const backdrop = document.getElementById('resumeModalBackdrop');
    const closeBtn = document.getElementById('resumeModalClose');
    const heroAvatar = document.querySelector('.hero-avatar-wrapper');

    if (!modal || !heroAvatar || !closeBtn || !backdrop) return;

    const open = (event) => {
        event.preventDefault();
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const close = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    heroAvatar.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            close();
        }
    });
}

initResumeModal();

