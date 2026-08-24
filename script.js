/* ============================================
   PORTFOLIO - Interactive Scripts
   Dutpala Aishwarya
   AOS + GSAP ScrollTrigger + Lenis
   ============================================ */

// scrollRestoration handled in <head> inline script

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
                    if (window.location.hash !== '#skyIntro') {
                        history.replaceState(null, '', '#skyIntro');
                    }
                    window.scrollTo(0, 0);
                    if (typeof lenis !== 'undefined') {
                        lenis.scrollTo(0, { immediate: true });
                    }
                    document.body.style.overflow = '';
                    // We can restart lenis later if needed, but it's set up outside DOMContentLoaded anyway
                    document.dispatchEvent(new CustomEvent('portfolio:loaderDone'));
                }, 800);
            }
        }, 120);
    } else {
        document.dispatchEvent(new CustomEvent('portfolio:loaderDone'));
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

// --- Navbar Scroll ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// --- Mobile Navigation ---
function initMobileNav() {
    const toggle = document.getElementById('navMenuToggle');
    const panel = document.getElementById('mobileNav');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (!toggle || !panel || !backdrop) return;

    const open = () => {
        panel.classList.add('active');
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (typeof lenis !== 'undefined') lenis.stop();
    };
    const close = () => {
        panel.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (typeof lenis !== 'undefined') lenis.start();
    };

    toggle.addEventListener('click', () => {
        panel.classList.contains('active') ? close() : open();
    });
    backdrop.addEventListener('click', close);
    panel.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.addEventListener('click', close);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('active')) close();
    });
}
initMobileNav();

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
            document.querySelectorAll('.side-nav-link, .mobile-nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
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
        card.style.background = `radial-gradient(circle 220px at ${x}px ${y}px, rgba(217,155,184,0.18), transparent 70%)`;
        card.style.boxShadow = `0 0 30px rgba(217,155,184,0.25), 0 18px 40px rgba(0,0,0,0.4)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.background = '';
        card.style.boxShadow = '';
    });
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

// ===== PROFILE MODAL (Floating top-left button) =====
function initProfileModal() {
    const modal = document.getElementById('profileModal');
    const fab = document.getElementById('profileFab');
    const closeBtn = document.getElementById('profileModalClose');
    const backdrop = document.getElementById('profileModalBackdrop');
    if (!modal || !fab) return;

    const open = () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (typeof lenis !== 'undefined') lenis.stop();
    };
    const close = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (typeof lenis !== 'undefined') lenis.start();
    };

    fab.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) close();
    });
}
initProfileModal();

// ===== SKY INTRO SCROLL FADE =====
function initSkyIntro() {
    const sky = document.getElementById('skyIntro');
    if (!sky) return;
    const content = sky.querySelector('.sky-content');
    const birds = sky.querySelectorAll('.sky-bird');
    const hint = sky.querySelector('.sky-scroll-hint');

    function update() {
        const h = sky.offsetHeight;
        const y = Math.min(window.scrollY, h);
        const p = y / h; // 0 -> 1
        const fade = Math.max(0, 1 - p * 1.4);
        const blur = p * 14;
        if (content) {
            content.style.opacity = fade;
            content.style.filter = `blur(${blur}px)`;
            content.style.transform = `translateY(${p * -40}px)`;
        }
        birds.forEach(b => {
            b.style.opacity = Math.max(0, 0.85 - p * 1.2);
        });
        if (hint) hint.style.opacity = Math.max(0, 0.6 - p * 1.5);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
}
initSkyIntro();


// ===== CUSTOM ANIMATED CURSOR =====
function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    // Hide on touch devices
    if ('ontouchstart' in window) {
        dot.style.display = 'none';
        ring.style.display = 'none';
        return;
    }

    document.body.style.cursor = 'none';

    let dotX = 0, dotY = 0, ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        dotX = e.clientX;
        dotY = e.clientY;
    });

    function animateCursor() {
        ringX += (dotX - ringX) * 0.15;
        ringY += (dotY - ringY) * 0.15;

        dot.style.left = dotX + 'px';
        dot.style.top = dotY + 'px';
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-category, .interest-card, .btn, input, textarea, .gallery-frame');
    hoverTargets.forEach(el => {
        el.style.cursor = 'none';
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });

    // Click effect
    document.addEventListener('mousedown', () => dot.classList.add('click'));
    document.addEventListener('mouseup', () => dot.classList.remove('click'));
}
initCustomCursor();

// ===== 3D TEXT SPLIT ANIMATION =====
function initTextSplitAnimations() {
    const titles = document.querySelectorAll('.section-title');

    titles.forEach(title => {
        // Wrap each character in a span
        const text = title.innerHTML;
        // We need to handle the HTML (highlight spans) carefully
        const wrapper = document.createElement('div');
        wrapper.innerHTML = text;

        function splitNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                node.textContent.split('').forEach((char, i) => {
                    const span = document.createElement('span');
                    span.className = 'char';
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    span.style.transitionDelay = (i * 0.03) + 's';
                    frag.appendChild(span);
                });
                return frag;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const clone = node.cloneNode(false);
                node.childNodes.forEach(child => {
                    clone.appendChild(splitNode(child));
                });
                return clone;
            }
            return node.cloneNode(true);
        }

        const newContent = document.createDocumentFragment();
        wrapper.childNodes.forEach(child => {
            newContent.appendChild(splitNode(child));
        });

        title.innerHTML = '';
        title.appendChild(newContent);
        title.classList.add('split-text');

        // Observe for scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    title.classList.add('animate');
                    observer.unobserve(title);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(title);
    });
}
initTextSplitAnimations();

// ===== 3D PERSPECTIVE SECTION REVEALS (GSAP) =====
function init3DSectionReveals() {
    gsap.utils.toArray('.section').forEach(section => {
        gsap.fromTo(section.querySelector('.container'), {
            opacity: 0,
            rotateX: 6,
            y: 80,
            transformPerspective: 1200,
            transformOrigin: 'center top'
        }, {
            opacity: 1,
            rotateX: 0,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                once: true,
            }
        });
    });
}
init3DSectionReveals();

// ===== SCROLL PROGRESS BAR =====
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + '%';
    }, { passive: true });
}
initScrollProgress();

// ===== 3D TILT ON SKILL CARDS (mouse-tracking glow) =====
function initSkillCardTilt() {
    document.querySelectorAll('.skill-category').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            card.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
            card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}
initSkillCardTilt();

// ===== FLOATING 3D SKILL ORBS PARALLAX =====
function initSkillOrbs() {
    const container = document.getElementById('skillOrbs');
    if (!container) return;

    const orbs = container.querySelectorAll('.skill-orb');

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        orbs.forEach((orb, i) => {
            const depth = 1 + (i % 3) * 0.4;
            const moveX = x * 15 * depth;
            const moveY = y * 10 * depth;
            orb.style.transform = `translate(${moveX}px, ${moveY}px) rotateY(${x * 8}deg)`;
        });
    });

    container.addEventListener('mouseleave', () => {
        orbs.forEach(orb => { orb.style.transform = ''; });
    });
}
initSkillOrbs();


// ===== 3D INTEREST CARDS TILT =====
document.querySelectorAll('.interest-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rx = (y - rect.height / 2) / 15;
        const ry = (rect.width / 2 - x) / 15;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ===== PARTICLE TEXT (vanilla port of Originkit Pixel Drift) =====
function initParticleText() {
    const nodes = document.querySelectorAll('[data-particle-text]');
    if (!nodes.length) return;

    function cubicBezier(x1, y1, x2, y2) {
        const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
        const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
        const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
        const sampleY = (t) => ((ay * t + by) * t + cy) * t;
        return (x) => {
            if (x <= 0) return 0;
            if (x >= 1) return 1;
            let lo = 0, hi = 1, t = x;
            for (let i = 0; i < 12; i++) {
                const mid = (lo + hi) / 2;
                const sx = sampleX(mid);
                if (Math.abs(sx - x) < 1e-6) { t = mid; break; }
                if (sx < x) lo = mid; else hi = mid;
                t = mid;
            }
            return sampleY(t);
        };
    }

    function resolveEasingFn(trans) {
        const linear = (t) => t;
        if (!trans || trans.type === 'spring') return linear;
        const ease = trans.ease;
        if (Array.isArray(ease) && ease.length === 4 && ease.every((v) => typeof v === 'number')) {
            const [x1, y1, x2, y2] = ease;
            return cubicBezier(x1, y1, x2, y2);
        }
        if (typeof ease === 'string') {
            switch (ease) {
                case 'easeIn': case 'circIn': return (t) => t * t;
                case 'easeOut': case 'circOut': return (t) => 1 - (1 - t) * (1 - t);
                case 'easeInOut': case 'circInOut':
                    return (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                case 'linear': default: return linear;
            }
        }
        return linear;
    }

    function resolveDuration(trans) {
        if (!trans || trans.type === 'spring') return 1;
        const d = trans.duration;
        return typeof d === 'number' && d > 0 ? d : 1;
    }

    function fitFontSize(measureCtx, label, family, maxW, maxH, cap) {
        if (!label) return cap;
        let lo = 8, hi = cap, best = lo;
        for (let iter = 0; iter < 12; iter++) {
            const mid = (lo + hi) / 2;
            measureCtx.font = `700 ${mid}px ${family}`;
            const m = measureCtx.measureText(label);
            const w = m.width;
            const h = (m.actualBoundingBoxAscent || mid * 0.8) + (m.actualBoundingBoxDescent || mid * 0.2);
            if (w <= maxW && h <= maxH) { best = mid; lo = mid; } else { hi = mid; }
        }
        return Math.max(8, Math.floor(best));
    }

    function createParticleText(container, opts) {
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return null;

        const palette = Array.isArray(opts.colors) && opts.colors.length ? opts.colors : ['#2b2622'];
        const text = opts.text || '';
        const mode = opts.mode || 'onEnter';
        const replay = !!opts.replay;
        const position = opts.position || 'above';
        const particleSize = opts.particleSize || 10;
        const particleCount = opts.particleCount || 40;
        const mcEnabled = opts.mouseEnabled !== false;
        const mcRadius = typeof opts.mouseRadius === 'number' ? opts.mouseRadius : 60;
        const mcForce = typeof opts.mouseForce === 'number' ? opts.mouseForce : 6;
        const fontSize = opts.fontSize || 80;
        const autoFit = opts.autoFit !== false;
        const transition = opts.transition || { type: 'tween', duration: 0.6, ease: 'easeOut' };

        let count = 0;
        let ox = new Float32Array(0), oy = new Float32Array(0);
        let sx = new Float32Array(0), sy = new Float32Array(0);
        let px = new Float32Array(0), py = new Float32Array(0);
        let repX = new Float32Array(0), repY = new Float32Array(0);
        let cIdx = new Uint8Array(0);

        let prevMx = -99999, prevMy = -99999, mouseSpeed = 0;
        let smoothX = -99999, smoothY = -99999;

        let cssW = 0, cssH = 0, dpr = 1;

        const formValRef = { current: 0 };
        const lastFrameRef = { current: null };
        const hiddenRef = { current: true };
        const reverseRef = { current: false };
        const pointerRef = { x: -99999, y: -99999, active: false };

        function sampleText() {
            const W = cssW, H = cssH;
            if (W <= 0 || H <= 0) return;

            const off = document.createElement('canvas');
            off.width = Math.max(1, Math.floor(W * dpr));
            off.height = Math.max(1, Math.floor(H * dpr));
            const offCtx = off.getContext('2d', { willReadFrequently: true });
            if (!offCtx) return;
            offCtx.scale(dpr, dpr);

            const fontFamily = '"Source Serif 4", "Source Sans 3", Georgia, serif';

            const maxW = W * 0.92;
            const maxH = H * 0.92;
            let effectiveSize = Math.max(8, fontSize);
            if (autoFit) {
                effectiveSize = fitFontSize(offCtx, text, fontFamily, maxW, maxH, Math.max(8, fontSize));
            }

            offCtx.font = `700 ${effectiveSize}px ${fontFamily}`;
            const gm = offCtx.measureText(text);
            const gW = gm.width || 1;
            const gH = (gm.actualBoundingBoxAscent || effectiveSize * 0.8) + (gm.actualBoundingBoxDescent || effectiveSize * 0.2);
            const fitScale = Math.min(1, maxW / gW, maxH / gH);
            if (fitScale < 1) effectiveSize = Math.max(8, effectiveSize * fitScale);

            offCtx.clearRect(0, 0, W, H);
            offCtx.fillStyle = '#fff';
            offCtx.font = `700 ${effectiveSize}px ${fontFamily}`;
            offCtx.textAlign = 'center';
            offCtx.textBaseline = 'middle';
            offCtx.fillText(text, W / 2, H / 2);

            const img = offCtx.getImageData(0, 0, Math.floor(W * dpr), Math.floor(H * dpr));
            const data = img.data;

            const pCount = Math.max(1, Math.min(50, particleCount));
            const stride = Math.max(2, Math.round(150 / pCount));

            let candidates = 0;
            for (let y = 0; y < H; y += stride) {
                for (let x = 0; x < W; x += stride) {
                    const ix = Math.floor(x * dpr), iy = Math.floor(y * dpr);
                    const idx = (iy * img.width + ix) * 4 + 3;
                    if (data[idx] > 128) candidates++;
                }
            }

            const downsample = candidates > 30000 ? Math.ceil(candidates / 30000) : 1;
            const allocCount = Math.min(candidates, 30000);

            const newOx = new Float32Array(allocCount);
            const newOy = new Float32Array(allocCount);
            const newSx = new Float32Array(allocCount);
            const newSy = new Float32Array(allocCount);
            const newPx = new Float32Array(allocCount);
            const newPy = new Float32Array(allocCount);
            const newC = new Uint8Array(allocCount);

            let i = 0, seen = 0;
            for (let y = 0; y < H && i < allocCount; y += stride) {
                for (let x = 0; x < W && i < allocCount; x += stride) {
                    const ix = Math.floor(x * dpr), iy = Math.floor(y * dpr);
                    const idx = (iy * img.width + ix) * 4 + 3;
                    if (data[idx] > 128) {
                        if (seen % downsample === 0) {
                            newOx[i] = x; newOy[i] = y;
                            const ang = Math.random() * Math.PI * 2;
                            const rad = Math.max(W, H) * (0.6 + Math.random() * 0.5);
                            const rx = W / 2 + Math.cos(ang) * rad;
                            const ry = H / 2 + Math.sin(ang) * rad;
                            newSx[i] = rx; newSy[i] = ry;
                            newPx[i] = rx; newPy[i] = ry;
                            newC[i] = Math.floor(Math.random() * palette.length);
                            i++;
                        }
                        seen++;
                    }
                }
            }

            count = i;
            ox = newOx; oy = newOy; sx = newSx; sy = newSy; px = newPx; py = newPy;
            repX = new Float32Array(allocCount);
            repY = new Float32Array(allocCount);
            cIdx = newC;
            formValRef.current = 0;
            lastFrameRef.current = null;
        }

        function resize() {
            const rect = container.getBoundingClientRect();
            const w = Math.floor(rect.width);
            const h = Math.floor(rect.height);
            if (w <= 0 || h <= 0) return;
            dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
            cssW = w; cssH = h;
            canvas.width = Math.floor(cssW * dpr);
            canvas.height = Math.floor(cssH * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            sampleText();
        }

        resize();

        reverseRef.current = false;
        hiddenRef.current = true;
        formValRef.current = 0;

        function formIn() { reverseRef.current = false; hiddenRef.current = false; }
        function formOut() { reverseRef.current = true; }

        let tryEnter = null;
        const enterTimers = [];

        const ro = new ResizeObserver(() => { resize(); tryEnter && tryEnter(); });
        ro.observe(container);

        function onMove(e) {
            if (!mcEnabled) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width > 0 ? cssW / rect.width : 1;
            const scaleY = rect.height > 0 ? cssH / rect.height : 1;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;
            if (prevMx > -9000) {
                const ddx = mx - prevMx, ddy = my - prevMy;
                mouseSpeed = Math.sqrt(ddx * ddx + ddy * ddy);
            }
            prevMx = mx; prevMy = my;
            pointerRef.x = mx; pointerRef.y = my; pointerRef.active = true;
        }
        function onLeave() {
            pointerRef.x = -99999; pointerRef.y = -99999; pointerRef.active = false;
            prevMx = -99999; prevMy = -99999;
        }
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerleave', onLeave);
        canvas.addEventListener('pointercancel', onLeave);

        let io = null, sentinel = null;
        if (mode === 'onHover') {
            container.addEventListener('pointerenter', formIn);
            container.addEventListener('pointerleave', formOut);
        } else {
            sentinel = document.createElement('div');
            sentinel.style.position = 'absolute';
            sentinel.style.left = '0';
            sentinel.style.width = '1px';
            sentinel.style.height = '1px';
            sentinel.style.pointerEvents = 'none';
            if (position === 'middle') sentinel.style.top = '50%';
            else if (position === 'below') sentinel.style.bottom = '0';
            else sentinel.style.top = '0';
            container.appendChild(sentinel);

            let entered = false;
            const enter = () => {
                if (entered) return;
                entered = true;
                formIn();
                if (!replay && io) io.disconnect();
            };
            tryEnter = () => {
                if (entered) return;
                const r = container.getBoundingClientRect();
                if (r.width === 0 && r.height === 0) return;
                const vh = window.innerHeight || 0;
                const vw = window.innerWidth || 0;
                const y = position === 'middle' ? r.top + r.height / 2 : position === 'below' ? r.bottom : r.top;
                const onScreen = r.right >= 0 && r.left <= vw && r.bottom >= 0 && y <= vh;
                if (onScreen) enter();
            };
            io = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    enter();
                } else if (replay) {
                    entered = false;
                    hiddenRef.current = true;
                    reverseRef.current = false;
                    formValRef.current = 0;
                }
            }, { threshold: 0 });
            io.observe(sentinel);
            tryEnter();
            enterTimers.push(
                setTimeout(() => tryEnter && tryEnter(), 60),
                setTimeout(() => tryEnter && tryEnter(), 250),
                setTimeout(() => tryEnter && tryEnter(), 600)
            );
        }

        const buckets = palette.map(() => []);
        const easeFn = resolveEasingFn(transition);
        const formMs = Math.max(0, resolveDuration(transition) * 1000);

        function drawFrame() {
            ctx.clearRect(0, 0, cssW, cssH);

            const pr = pointerRef;
            const drawSize = Math.max(1, particleSize / 4);
            const half = drawSize / 2;

            const now = performance.now();
            const last = lastFrameRef.current == null ? now : lastFrameRef.current;
            const dt = Math.min(64, Math.max(0, now - last));
            lastFrameRef.current = now;
            const reverse = reverseRef.current;
            const target = reverse ? 0 : 1;
            let v = formValRef.current;
            if (formMs <= 0) {
                v = target;
            } else {
                const stepv = dt / formMs;
                if (v < target) v = Math.min(target, v + stepv);
                else if (v > target) v = Math.max(target, v - stepv);
            }
            formValRef.current = v;
            if (reverse && v <= 0) hiddenRef.current = true;
            if (hiddenRef.current) return;
            const forming = v < 1;
            const factor = easeFn(v);

            const hitSpeed = mouseSpeed;
            mouseSpeed *= 0.88;
            const active = !forming && mcEnabled && pr.active;
            if (active) {
                const lerpFactor = Math.max(0.08, 0.3 - hitSpeed * 0.006);
                if (smoothX < -9000) { smoothX = pr.x; smoothY = pr.y; }
                else { smoothX += (pr.x - smoothX) * lerpFactor; smoothY += (pr.y - smoothY) * lerpFactor; }
            } else {
                smoothX = -99999; smoothY = -99999;
            }
            const mx = smoothX, my = smoothY;
            const repCutoff = Math.max(1, mcRadius);
            const repCutoffSq = repCutoff * repCutoff;
            const rF = mcForce;

            for (let b = 0; b < buckets.length; b++) buckets[b].length = 0;

            for (let i = 0; i < count; i++) {
                const oxi = ox[i], oyi = oy[i];

                if (forming) {
                    px[i] = sx[i] + (oxi - sx[i]) * factor;
                    py[i] = sy[i] + (oyi - sy[i]) * factor;
                    buckets[cIdx[i]].push(i);
                    continue;
                }

                let inZone = false;
                if (active) {
                    const dx = oxi - mx, dy = oyi - my;
                    const distSq = dx * dx + dy * dy;
                    if (distSq > 0 && distSq < repCutoffSq) {
                        const dist = Math.sqrt(distSq);
                        const nx = dx / dist, ny = dy / dist;
                        const falloff = 1 - dist / repCutoff;
                        const push = falloff * hitSpeed * rF * 0.05;
                        repX[i] += nx * push;
                        repY[i] += ny * push;
                        const targetRepX = nx * (repCutoff - dist);
                        const targetRepY = ny * (repCutoff - dist);
                        repX[i] += (targetRepX - repX[i]) * 0.06;
                        repY[i] += (targetRepY - repY[i]) * 0.06;
                        inZone = true;
                    }
                }
                if (!inZone) { repX[i] *= 0.97; repY[i] *= 0.97; }

                px[i] = oxi + repX[i];
                py[i] = oyi + repY[i];

                buckets[cIdx[i]].push(i);
            }

            ctx.globalAlpha = forming ? Math.min(1, Math.max(0, factor)) : 1;
            for (let b = 0; b < buckets.length; b++) {
                const bucket = buckets[b];
                if (bucket.length === 0) continue;
                ctx.fillStyle = palette[b];
                for (let k = 0; k < bucket.length; k++) {
                    const i = bucket[k];
                    ctx.fillRect(px[i] - half, py[i] - half, drawSize, drawSize);
                }
            }
            ctx.globalAlpha = 1;
        }

        let rafId = null;
        function loop() {
            drawFrame();
            rafId = requestAnimationFrame(loop);
        }
        rafId = requestAnimationFrame(loop);

        return {
            dispose() {
                if (rafId != null) cancelAnimationFrame(rafId);
                canvas.removeEventListener('pointermove', onMove);
                canvas.removeEventListener('pointerleave', onLeave);
                canvas.removeEventListener('pointercancel', onLeave);
                container.removeEventListener('pointerenter', formIn);
                container.removeEventListener('pointerleave', formOut);
                if (io) io.disconnect();
                if (sentinel) sentinel.remove();
                enterTimers.forEach(clearTimeout);
                ro.disconnect();
                if (canvas.parentNode === container) container.removeChild(canvas);
            },
        };
    }

    const VARIANTS = {
        name: {
            colors: ['#ffffff', '#e8b8d0', '#ffffff'],
            particleCount: 48,
            particleSize: 6,
            fontSize: 54,
            mouseRadius: 55,
            mouseForce: 7,
            transition: { type: 'tween', duration: 2.2, ease: 'easeOut' },
        },
        tagline: {
            colors: ['#ffffff', '#e8b8d0', '#ffffff'],
            particleCount: 50,
            particleSize: 4,
            fontSize: 34,
            mouseRadius: 30,
            mouseForce: 5,
            transition: { type: 'tween', duration: 1.8, ease: 'easeOut' },
        },
    };

    nodes.forEach((el) => {
        const variant = VARIANTS[el.getAttribute('data-particle-variant')] || VARIANTS.tagline;
        createParticleText(el, {
            text: el.getAttribute('data-particle-text') || '',
            mode: 'onEnter',
            replay: false,
            position: 'above',
            mouseEnabled: true,
            autoFit: true,
            ...variant,
        });
    });
}
// Wait for the retro loader to finish so the assembly animation is actually
// visible — running it during the loader means it's already settled by the
// time the page is revealed.
if (document.getElementById('retro-loader')) {
    document.addEventListener('portfolio:loaderDone', initParticleText, { once: true });
} else {
    initParticleText();
}


// ===== RIBBON TRAILS (vanilla port of Originkit Line Cursor) =====
function initRibbonTrails() {
    const canvas = document.getElementById('ribbonTrailsCanvas');
    if (!canvas) return;
    const frame = canvas.closest('.sky-intro');
    if (!frame) return;
    if (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cfg = {
        colors: ['#d99bb8', '#c8a8e0', '#b06a9c', '#f3e9f1'],
        colorShift: 1.4,
        opacity: 45,
        thickness: 2,
        trails: 46,
        trailLength: 26,
    };

    const DAMPENING = 0.1;
    const TENSION = 0.95;
    const FRICTION = 0.5;
    const REFERENCE_TRAILS = 20;
    const MAX_STROKE_L = 0.7;
    const MAX_COLORS = 5;

    function parseColor(color) {
        const value = (color || '').trim();
        if (value.startsWith('#')) {
            let hex = value.slice(1);
            if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
            if (hex.length >= 6) {
                return [
                    parseInt(hex.slice(0, 2), 16) / 255,
                    parseInt(hex.slice(2, 4), 16) / 255,
                    parseInt(hex.slice(4, 6), 16) / 255,
                    hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
                ];
            }
            return [1, 1, 1, 1];
        }
        const m = value.match(/rgba?\(([^)]+)\)/i);
        if (m) {
            const p = m[1].split(',').map((s) => parseFloat(s));
            return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255, p[3] === undefined ? 1 : p[3]];
        }
        return [1, 1, 1, 1];
    }

    const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

    function srgbToOklab(r, g, b) {
        const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
        const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
        const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
        const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
        return [
            0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
        ];
    }

    function oklabToSrgb(L, A, B) {
        const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
        const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
        const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
        return [
            toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
            toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
            toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
        ];
    }

    const inGamut = (rgb) => rgb.every((c) => c >= -0.001 && c <= 1.001);

    function strokeFor(color, maxL, alpha) {
        const [r, g, b] = parseColor(color);
        const [L, A, B] = srgbToOklab(r, g, b);
        if (L <= maxL) {
            const rgb = [r, g, b].map((c) => Math.round(c * 255));
            return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
        }
        const C = Math.hypot(A, B);
        const hue = Math.atan2(B, A);
        const cos = Math.cos(hue), sin = Math.sin(hue);
        let fitted = C;
        if (!inGamut(oklabToSrgb(maxL, cos * C, sin * C))) {
            let lo = 0, hi = C;
            for (let i = 0; i < 16; i++) {
                const mid = (lo + hi) / 2;
                if (inGamut(oklabToSrgb(maxL, cos * mid, sin * mid))) lo = mid;
                else hi = mid;
            }
            fitted = lo;
        }
        const rgb = oklabToSrgb(maxL, cos * fitted, sin * fitted).map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255));
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }

    class TrailNode {
        constructor() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; }
    }

    class Line {
        constructor(lineCfg) {
            this.cfg = lineCfg;
            this.spring = lineCfg.spring + 0.1 * Math.random() - 0.02;
            this.friction = lineCfg.friction + 0.01 * Math.random() - 0.002;
            this.nodes = [];
            for (let i = 0; i < lineCfg.size; i++) {
                const node = new TrailNode();
                node.x = lineCfg.target.x;
                node.y = lineCfg.target.y;
                this.nodes.push(node);
            }
        }
        update() {
            let spring = this.spring;
            const { target, dampening, tension } = this.cfg;
            let node = this.nodes[0];
            node.vx += (target.x - node.x) * spring;
            node.vy += (target.y - node.y) * spring;
            for (let i = 0, len = this.nodes.length; i < len; i++) {
                node = this.nodes[i];
                if (i > 0) {
                    const prev = this.nodes[i - 1];
                    node.vx += (prev.x - node.x) * spring;
                    node.vy += (prev.y - node.y) * spring;
                    node.vx += prev.vx * dampening;
                    node.vy += prev.vy * dampening;
                }
                node.vx *= this.friction;
                node.vy *= this.friction;
                node.x += node.vx;
                node.y += node.vy;
                spring *= tension;
            }
        }
        draw(drawCtx) {
            let a, b;
            let x = this.nodes[0].x;
            let y = this.nodes[0].y;
            drawCtx.beginPath();
            drawCtx.moveTo(x, y);
            for (let i = 1, len = this.nodes.length - 2; i < len; i++) {
                a = this.nodes[i];
                b = this.nodes[i + 1];
                x = 0.5 * (a.x + b.x);
                y = 0.5 * (a.y + b.y);
                drawCtx.quadraticCurveTo(a.x, a.y, x, y);
            }
            a = this.nodes[this.nodes.length - 2];
            b = this.nodes[this.nodes.length - 1];
            drawCtx.quadraticCurveTo(a.x, a.y, b.x, b.y);
            drawCtx.stroke();
            drawCtx.closePath();
        }
    }

    const count = Math.max(1, Math.round(cfg.trails));
    const picked = cfg.colors.filter(Boolean).slice(0, MAX_COLORS);
    const palette = picked.length ? picked : cfg.colors;
    const weight = Math.min(100, Math.max(0, cfg.opacity)) / 100;
    const fade = Math.min(1, REFERENCE_TRAILS / count);
    const strokes = palette.map((entry) => strokeFor(entry, MAX_STROKE_L, weight * parseColor(entry)[3] * fade));

    let running = true;
    let rafId = 0;
    let started = false;
    const target = { x: 0, y: 0 };
    let bornAt = 0;
    const holdMs = Math.max(0.1, cfg.colorShift) * 1000;

    const lineCfg = {
        spring: 0.4,
        friction: FRICTION,
        dampening: DAMPENING,
        tension: TENSION,
        size: Math.max(2, Math.round(cfg.trailLength)),
        target,
    };
    let lines = [];

    function buildLines() {
        lines = [];
        for (let i = 0; i < count; i++) {
            lines.push(new Line(Object.assign({}, lineCfg, { spring: 0.4 + (i / count) * 0.025 })));
        }
    }

    function resize() {
        canvas.width = Math.max(1, Math.round(frame.clientWidth));
        canvas.height = Math.max(1, Math.round(frame.clientHeight));
    }

    function updatePosition(e) {
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        const rect = frame.getBoundingClientRect();
        target.x = clientX - rect.left;
        target.y = clientY - rect.top;
    }

    function onFirstMove(e) {
        frame.removeEventListener('mousemove', onFirstMove);
        frame.removeEventListener('touchstart', onFirstMove);
        frame.addEventListener('mousemove', updatePosition);
        updatePosition(e);
        buildLines();
        started = true;
        loop();
    }

    function loop() {
        if (!running) return;
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        if (bornAt === 0) bornAt = performance.now();
        const held = Math.floor((performance.now() - bornAt) / holdMs);
        ctx.strokeStyle = strokes[held % strokes.length];
        ctx.lineWidth = Math.max(0.1, cfg.thickness);
        for (let i = 0; i < count; i++) {
            const line = lines[i];
            if (!line) continue;
            line.update();
            line.draw(ctx);
        }
        rafId = requestAnimationFrame(loop);
    }

    function handleFocus() {
        if (!running) {
            running = true;
            if (started) loop();
        }
    }
    function handleBlur() { running = false; }

    frame.addEventListener('mousemove', onFirstMove);
    frame.addEventListener('touchstart', onFirstMove, { passive: true });
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(resize);
        ro.observe(frame);
    } else {
        window.addEventListener('resize', resize);
    }
    resize();
}
initRibbonTrails();

// ===== CLICK EFFECTS — SNIPER MODE (vanilla port of Originkit MouseEffects) =====
function initClickEffects() {
    const layer = document.getElementById('clickEffectsLayer');
    if (!layer || typeof gsap === 'undefined') return;

    const cfg = {
        color: '#d99bb8',
        duration: 0.3,
        strokeWidth: 2,
        effectSize: 90,
        rotation: 0,
    };

    const EXCLUDED_SECTIONS = ['.sky-intro', '.hero'];
    const SVG_NS = 'http://www.w3.org/2000/svg';

    function inExcludedSection(target) {
        return EXCLUDED_SECTIONS.some((sel) => target.closest(sel));
    }

    function spawnSniper(x, y) {
        const half = cfg.effectSize / 2;

        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('width', cfg.effectSize);
        svg.setAttribute('height', cfg.effectSize);
        svg.classList.add('click-effect-svg');
        svg.style.left = (x - half) + 'px';
        svg.style.top = (y - half) + 'px';
        svg.style.transform = `rotate(${cfg.rotation}deg)`;
        layer.appendChild(svg);

        const centerX = half, centerY = half;
        const lineLength = cfg.effectSize * 0.2;
        const angles = [0, 90, 180, 270].map((d) => d * (Math.PI / 180));

        const lines = angles.map((angle) => {
            const line = document.createElementNS(SVG_NS, 'line');
            const startX = centerX + 5 * Math.cos(angle);
            const startY = centerY - 5 * Math.sin(angle);
            const endX = centerX + (5 + lineLength) * Math.cos(angle);
            const endY = centerY - (5 + lineLength) * Math.sin(angle);
            line.setAttribute('x1', startX);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', endY);
            line.setAttribute('stroke', cfg.color);
            line.setAttribute('stroke-width', cfg.strokeWidth);
            line.setAttribute('stroke-linecap', 'square');
            svg.appendChild(line);
            return { el: line, angle, endX, endY, lineLength };
        });

        lines.forEach(({ el, angle, endX, endY, lineLength }) => {
            gsap.timeline()
                .to(el, {
                    attr: { x1: endX, y1: endY, x2: endX, y2: endY },
                    x: (5 + lineLength) * Math.cos(angle),
                    y: -(5 + lineLength) * Math.sin(angle),
                    duration: cfg.duration,
                    ease: 'power2.out',
                })
                .to(el, {
                    attr: { 'stroke-width': 0 },
                    duration: cfg.duration * 0.4,
                    ease: 'linear',
                }, cfg.duration * 0.6);
        });

        const dotAngles = [
            Math.PI / 3, (2 * Math.PI) / 3, (4 * Math.PI) / 3, (5 * Math.PI) / 3,
            Math.PI / 6, (5 * Math.PI) / 6, (7 * Math.PI) / 6, (11 * Math.PI) / 6,
        ];
        const dots = dotAngles.map((angle) => {
            const dot = document.createElement('div');
            dot.className = 'click-effect-dot';
            dot.style.left = (x - cfg.strokeWidth / 2) + 'px';
            dot.style.top = (y - cfg.strokeWidth / 2) + 'px';
            dot.style.width = cfg.strokeWidth + 'px';
            dot.style.height = cfg.strokeWidth + 'px';
            dot.style.backgroundColor = cfg.color;
            dot.style.transform = `rotate(${cfg.rotation}deg)`;
            layer.appendChild(dot);
            return { el: dot, angle };
        });

        let remaining = dots.length;
        dots.forEach(({ el, angle }) => {
            gsap.timeline()
                .to(el, {
                    x: Math.cos(angle) * (cfg.effectSize * 0.4),
                    y: Math.sin(angle) * (cfg.effectSize * 0.4),
                    duration: cfg.duration,
                    ease: 'power2.out',
                })
                .to(el, {
                    width: 0,
                    height: 0,
                    duration: cfg.duration * 0.4,
                    ease: 'linear',
                    onComplete: () => {
                        el.remove();
                        remaining--;
                        if (remaining === 0) svg.remove();
                    },
                }, cfg.duration * 0.6);
        });
    }

    document.addEventListener('click', (e) => {
        if (inExcludedSection(e.target)) return;
        spawnSniper(e.clientX, e.clientY);
    });
}
initClickEffects();

// ===== SVG PARTICLE IMAGE (vanilla port of Originkit ParticleImage) =====
function createParticleImage(container, cfgOverrides) {
    const imageUrl = container.getAttribute('data-particle-image');
    if (!imageUrl) return null;

    const cfg = Object.assign({
        particleCount: 50,
        particleSize: 5,
        particleShape: 'circle',
        hoverEnabled: true,
        hoverType: 'roam',
        transition: { duration: 2.5, ease: 'easeInOut' },
        roamOpacity: 0.5,
        roamShape: 'circle',
        repulsionEnabled: true,
        repulsionForce: 8,
        repulsionRadius: 60,
        scale: 10,
        viewportTrigger: false,
    }, cfgOverrides || {});

    function containRect(iW, iH, cW, cH) {
        const a = iW / iH, b = cW / cH;
        return a > b
            ? { x: 0, y: Math.round((cH - cW / a) / 2), w: cW, h: Math.round(cW / a) }
            : { x: Math.round((cW - cH * a) / 2), y: 0, w: Math.round(cH * a), h: cH };
    }

    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }

    function randomInShape(shape, bx, by, bw, bh) {
        const cx = bx + bw / 2, cy = by + bh / 2;
        if (shape === 'circle') {
            const r = bw / 2;
            const a = Math.random() * Math.PI * 2;
            const d = Math.sqrt(Math.random()) * r;
            return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
        }
        if (shape === 'oval') {
            const rx = bw / 2, ry = bh / 2;
            const a = Math.random() * Math.PI * 2;
            const d = Math.sqrt(Math.random());
            return [cx + d * rx * Math.cos(a), cy + d * ry * Math.sin(a)];
        }
        return [bx + Math.random() * bw, by + Math.random() * bh];
    }

    const EASE = {
        easeOut: (t) => 1 - (1 - t) * (1 - t),
        easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
        easeIn: (t) => t * t,
        linear: (t) => t,
    };
    function getTransitionParams(tr) {
        if (!tr) return { easeFn: EASE.easeOut, durMs: 800 };
        return { easeFn: EASE[tr.ease] || EASE.easeOut, durMs: (tr.duration ?? 0.8) * 1000 };
    }

    function mkParticle(src, x, y, idleX, idleY) {
        return {
            x, y, vx: 0, vy: 0,
            startX: x, startY: y,
            repX: 0, repY: 0,
            homeX: src.homeX, homeY: src.homeY,
            idleX, idleY,
            r: src.r, g: src.g, b: src.b, a: src.a,
            inZone: false,
            roamTargetX: 0, roamTargetY: 0,
            repTargetX: 0, repTargetY: 0,
        };
    }

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const mouse = { x: -99999, y: -99999, active: false };
    const prevMouse = { x: -99999, y: -99999 };
    let mouseSpeed = 0;
    const smoothMouse = { x: -99999, y: -99999 };

    let scene = { particles: [] };
    let dims = { W: 0, H: 0 };
    let animState = 'idle';
    let animFrame = null;
    let animStartTime = 0;

    const startAnim = (newState) => {
        const { particles } = scene;
        const { W, H } = dims;
        const rs = cfg.roamShape;
        const bw = Math.max(80, W), bh = Math.max(80, H);
        const bx = (W - bw) / 2, by = (H - bh) / 2;
        particles.forEach((p) => {
            p.startX = p.x;
            p.startY = p.y;
            if (newState === 'scattering') {
                const [tx, ty] = randomInShape(rs, bx, by, bw, bh);
                p.roamTargetX = tx;
                p.roamTargetY = ty;
                p.idleX = tx;
                p.idleY = ty;
            }
        });
        if (newState === 'scattering') {
            animState = 'idle';
            return;
        }
        animStartTime = Date.now();
        animState = newState;
        const { durMs } = getTransitionParams(cfg.transition);
        clearTimeout(startAnim._timer);
        const next = newState === 'assembling' ? 'active' : 'idle';
        startAnim._timer = setTimeout(() => {
            if (animState === newState) animState = next;
        }, durMs);
    };

    function initParticles() {
        const { W, H } = dims;
        if (!W || !H) return;
        const gap = Math.max(2, Math.round(150 / Math.max(1, cfg.particleCount)));
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        mouse.x = -99999; mouse.y = -99999; mouse.active = false;
        scene = { particles: [] };

        const img = new Image();
        img.onload = () => {
            const base = containRect(img.naturalWidth || img.width, img.naturalHeight || img.height, W, H);
            const f = Math.max(1, Math.min(20, cfg.scale)) / 10;
            const w = base.w * f, h = base.h * f;
            const rect = { x: (W - w) / 2, y: (H - h) / 2, w, h };

            const off = document.createElement('canvas');
            off.width = W; off.height = H;
            const oc = off.getContext('2d');
            oc.drawImage(img, rect.x, rect.y, rect.w, rect.h);
            let px;
            try {
                px = oc.getImageData(0, 0, W, H).data;
            } catch (e) {
                return;
            }
            const src = [];
            for (let y = 0; y < H; y += gap) {
                for (let x = 0; x < W; x += gap) {
                    const i = (y * W + x) * 4;
                    if (px[i + 3] >= 20) {
                        src.push({ homeX: x, homeY: y, r: px[i], g: px[i + 1], b: px[i + 2], a: px[i + 3] });
                    }
                }
            }
            shuffle(src);

            const bw = Math.max(80, W), bh = Math.max(80, H);
            const bx = (W - bw) / 2, by = (H - bh) / 2;
            const particles = src.map((p) => {
                const [rx, ry] = randomInShape(cfg.roamShape, bx, by, bw, bh);
                const pt = mkParticle(p, rx, ry, rx, ry);
                const [tx, ty] = randomInShape(cfg.roamShape, bx, by, bw, bh);
                pt.roamTargetX = tx;
                pt.roamTargetY = ty;
                pt.vx = (Math.random() - 0.5) * 1.2;
                pt.vy = (Math.random() - 0.5) * 1.2;
                return pt;
            });
            animState = 'idle';
            scene = { particles };
        };
        img.src = imageUrl;
    }

    const ro = new ResizeObserver((entries) => {
        const r = entries[0] && entries[0].contentRect;
        if (!r) return;
        const W = Math.round(r.width), H = Math.round(r.height);
        if (!W || !H) return;
        dims = { W, H };
        initParticles();
    });
    ro.observe(container);

    function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const { W, H } = dims;
        const scaleX = rect.width > 0 ? W / rect.width : 1;
        const scaleY = rect.height > 0 ? H / rect.height : 1;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        if (prevMouse.x > -9999) {
            const ddx = mx - prevMouse.x, ddy = my - prevMouse.y;
            mouseSpeed = Math.sqrt(ddx * ddx + ddy * ddy);
        }
        prevMouse.x = mx; prevMouse.y = my;
        mouse.x = mx; mouse.y = my; mouse.active = true;
        if (!cfg.viewportTrigger && cfg.hoverEnabled && (animState === 'idle' || animState === 'scattering')) {
            startAnim('assembling');
        }
    }
    function onMouseLeave() {
        mouse.x = -99999; mouse.y = -99999; mouse.active = false;
        if (!cfg.viewportTrigger && cfg.hoverEnabled && (animState === 'assembling' || animState === 'active')) {
            startAnim('scattering');
        }
    }
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    let viewportObserver = null;
    if (cfg.viewportTrigger) {
        viewportObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (animState === 'idle' || animState === 'scattering') startAnim('assembling');
                } else {
                    if (animState === 'assembling' || animState === 'active') startAnim('scattering');
                }
            });
        }, { threshold: 0.35 });
        viewportObserver.observe(container);
    }

    let idata = null, bW = 0, bH = 0;
    let roamFadeStart = 0, roamFadeFrom = 1, roamFadeTo = 1;

    function draw() {
        animFrame = requestAnimationFrame(draw);
        const PW = canvas.width, PH = canvas.height;
        if (!PW || !PH) return;
        const dpr = window.devicePixelRatio || 1;
        const { particles } = scene;
        if (!particles.length) return;
        if (!idata || PW !== bW || PH !== bH) {
            idata = ctx.createImageData(PW, PH);
            bW = PW; bH = PH;
        }
        idata.data.fill(0);
        const buf = idata.data;

        const hitSpeed = mouseSpeed;
        mouseSpeed *= 0.88;
        const sm = smoothMouse;
        if (mouse.active) {
            const lerpFactor = Math.max(0.08, 0.3 - hitSpeed * 0.006);
            if (sm.x < -9000) { sm.x = mouse.x; sm.y = mouse.y; }
            else { sm.x += (mouse.x - sm.x) * lerpFactor; sm.y += (mouse.y - sm.y) * lerpFactor; }
        } else {
            sm.x = -99999; sm.y = -99999;
        }
        const mx = sm.x, my = sm.y;
        const ps = Math.max(1, Math.ceil((cfg.particleSize / 4) * dpr));
        const half = ps / 2;
        const { easeFn, durMs } = getTransitionParams(cfg.transition);
        const elapsed = Date.now() - animStartTime;
        const animT = easeFn(Math.min(1, elapsed / durMs));
        const { W: DW, H: DH } = dims;
        const bw = Math.max(80, DW), bh = Math.max(80, DH);
        const bx = (DW - bw) / 2, by = (DH - bh) / 2;

        function drawParticle(cx, cy, r, g, b, a, isCircle) {
            const px0 = Math.round(cx) - (ps >> 1);
            const py0 = Math.round(cy) - (ps >> 1);
            for (let dy = 0; dy < ps; dy++) {
                const iy = py0 + dy;
                if (iy < 0 || iy >= PH) continue;
                const row = iy * PW;
                for (let dx = 0; dx < ps; dx++) {
                    if (isCircle) {
                        const ddx = dx - half + 0.5, ddy = dy - half + 0.5;
                        if (ddx * ddx + ddy * ddy > half * half) continue;
                    }
                    const ix = px0 + dx;
                    if (ix < 0 || ix >= PW) continue;
                    const i = (row + ix) * 4;
                    buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
                }
            }
        }

        const repCutoff = Math.max(1, cfg.repulsionRadius);
        const repCutoffSq = repCutoff * repCutoff;
        const isCircle = cfg.particleShape === 'circle';

        for (const p of particles) {
            let baseX = p.x, baseY = p.y;
            if (animState === 'assembling') {
                baseX = p.startX + (p.homeX - p.startX) * animT;
                baseY = p.startY + (p.homeY - p.startY) * animT;
            } else if (animState === 'active') {
                baseX = p.homeX; baseY = p.homeY;
            } else if (animState === 'idle') {
                const dtx = p.roamTargetX - p.x, dty = p.roamTargetY - p.y;
                if (Math.sqrt(dtx * dtx + dty * dty) < 3) {
                    const [tx, ty] = randomInShape(cfg.roamShape, bx, by, bw, bh);
                    p.roamTargetX = tx; p.roamTargetY = ty;
                }
                p.vx = (p.vx || 0) * 0.98 + (p.roamTargetX - p.x) * 0.003;
                p.vy = (p.vy || 0) * 0.98 + (p.roamTargetY - p.y) * 0.003;
                const sp2 = Math.sqrt(p.vx ** 2 + p.vy ** 2);
                if (sp2 > 1.5) { p.vx = (p.vx / sp2) * 1.5; p.vy = (p.vy / sp2) * 1.5; }
                p.x += p.vx; p.y += p.vy;
                baseX = p.x; baseY = p.y;
            }

            if (cfg.repulsionEnabled && mouse.active) {
                const dx = baseX - mx, dy = baseY - my;
                const distSq = dx * dx + dy * dy;
                if (distSq > 0 && distSq < repCutoffSq) {
                    const dist = Math.sqrt(distSq);
                    const nx = dx / dist, ny = dy / dist;
                    const falloff = 1 - dist / repCutoff;
                    const push = falloff * hitSpeed * cfg.repulsionForce * 0.05;
                    p.repX += nx * push;
                    p.repY += ny * push;
                    const targetRepX = nx * (repCutoff - dist);
                    const targetRepY = ny * (repCutoff - dist);
                    p.repX += (targetRepX - p.repX) * 0.06;
                    p.repY += (targetRepY - p.repY) * 0.06;
                    p.inZone = true;
                } else {
                    p.inZone = false;
                }
            } else {
                p.inZone = false;
            }
            if (!p.inZone) { p.repX *= 0.97; p.repY *= 0.97; }

            p.x = baseX + p.repX;
            p.y = baseY + p.repY;

            let da;
            if (animState === 'active') {
                da = p.a;
            } else {
                let alphaMul;
                if (roamFadeStart === 0) {
                    alphaMul = cfg.roamOpacity;
                } else {
                    const fadeElapsed = Date.now() - roamFadeStart;
                    const fadeT = Math.min(1, Math.max(0, fadeElapsed / durMs));
                    const easedFadeT = easeFn(fadeT);
                    alphaMul = roamFadeFrom + (roamFadeTo - roamFadeFrom) * easedFadeT;
                }
                da = Math.round(p.a * alphaMul);
            }
            if (da < 1) continue;

            drawParticle(p.x * dpr, p.y * dpr, p.r, p.g, p.b, da, isCircle);
        }
        ctx.putImageData(idata, 0, 0);
    }

    animFrame = requestAnimationFrame(draw);

    return {
        dispose() {
            if (animFrame) cancelAnimationFrame(animFrame);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseleave', onMouseLeave);
            if (viewportObserver) viewportObserver.disconnect();
            ro.disconnect();
            if (canvas.parentNode === container) container.removeChild(canvas);
        },
    };
}

function initParticleImage() {
    document.querySelectorAll('[data-particle-image]').forEach((el) => {
        const overrides = el.hasAttribute('data-particle-static')
            ? { hoverEnabled: false, roamOpacity: 1 }
            : null;
        if (el.id === 'particleImageWrap') {
            createParticleImage(el, Object.assign({ particleCount: 35, particleSize: 3 }, overrides));
        } else if (el.classList.contains('gallery-particle-wrap')) {
            createParticleImage(el, Object.assign({ viewportTrigger: true }, overrides));
        } else {
            createParticleImage(el, overrides);
        }
    });
}
if (document.getElementById('retro-loader')) {
    document.addEventListener('portfolio:loaderDone', initParticleImage, { once: true });
} else {
    initParticleImage();
}

// ===== BACK TO TOP =====
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', () => {
        if (typeof lenis !== 'undefined') lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
initBackToTop();

// ===== COPY TO CLIPBOARD (contact card) =====
function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        const tooltip = btn.querySelector('.copy-btn-tooltip');
        const defaultLabel = tooltip ? tooltip.textContent : 'Copy';
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const text = btn.getAttribute('data-copy');
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const temp = document.createElement('textarea');
                temp.value = text;
                document.body.appendChild(temp);
                temp.select();
                document.execCommand('copy');
                document.body.removeChild(temp);
            }
            btn.classList.add('copied');
            btn.querySelector('i').className = 'fas fa-check';
            if (tooltip) tooltip.textContent = 'Copied!';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.querySelector('i').className = 'fas fa-copy';
                if (tooltip) tooltip.textContent = defaultLabel;
            }, 2000);
        });
    });
}
initCopyButtons();

// ===== PROJECT FILTER TABS =====
function initProjectFilters() {
    const tabs = document.querySelectorAll('.filter-tab');
    const indicator = document.querySelector('.filter-tab-indicator');
    const professionalGrid = document.getElementById('professionalProjects');
    const academicGrid = document.getElementById('academicProjects');
    const academicHeading = document.getElementById('academicHeading');
    if (!tabs.length || !indicator) return;

    function moveIndicator(tab) {
        indicator.style.width = tab.offsetWidth + 'px';
        indicator.style.transform = `translateX(${tab.offsetLeft - 6}px)`;
    }

    function applyFilter(filter) {
        const cards = document.querySelectorAll('.project-card[data-category]');
        cards.forEach(card => {
            const matches = filter === 'all' || card.getAttribute('data-category') === filter;
            if (matches) {
                card.classList.remove('filtered-out');
                card.classList.add('filter-in');
            } else {
                card.classList.remove('filter-in');
                card.classList.add('filtered-out');
            }
        });
        if (professionalGrid) professionalGrid.classList.toggle('filter-hidden', filter === 'academic');
        if (academicGrid) academicGrid.classList.toggle('filter-hidden', filter === 'professional');
        if (academicHeading) academicHeading.classList.toggle('filter-hidden', filter === 'professional');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            moveIndicator(tab);
            applyFilter(tab.getAttribute('data-filter'));
        });
    });

    const activeTab = document.querySelector('.filter-tab.active') || tabs[0];
    requestAnimationFrame(() => moveIndicator(activeTab));
    window.addEventListener('resize', () => {
        const current = document.querySelector('.filter-tab.active');
        if (current) moveIndicator(current);
    });
}
initProjectFilters();

// ===== GSAP STAGGERED STAT COUNTERS WITH 3D =====
gsap.utils.toArray('.stat-item').forEach((item, i) => {
    gsap.from(item, {
        opacity: 0,
        rotateY: 20,
        x: -30,
        transformPerspective: 800,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            once: true,
        }
    });
});


