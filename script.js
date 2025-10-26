/* ========================================
   SEETHALA DEVI CHANDU - SCRIPT.JS
   Professional Portfolio & Author Website
   ======================================== */

// === GLOBAL VARIABLES ===
let welcomeAnimationId;
let currentPage = 0;
const pages = ['page1', 'page2', 'page3', 'page4'];
const bookWelcome = document.getElementById('bookWelcome');
const bookCover = document.getElementById('bookCover');

// Focus trap variables
let _previousActiveElement = null;
let _focusableElements = [];
let _focusTrapActive = false;

// === THREE.JS WELCOME ANIMATION ===
function initWelcomeAnimation() {
    const canvas = document.getElementById('welcome-canvas');
    if (!canvas) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Performance optimization
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);
    renderer.setPixelRatio(prefersReduced ? 1 : devicePixelRatio);

    // Particles
    const particleCount = prefersReduced ? 800 : (isMobile ? 2500 : 7000);
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 15;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffd700,
        size: 0.02,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        mouseY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });

    // Clock for animation
    const clock = new THREE.Clock();

    // Animation Loop
    function animate() {
        const elapsedTime = clock.getElapsedTime();

        // Slow particle drift
        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = elapsedTime * 0.02;

        // Camera movement based on mouse
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        welcomeAnimationId = requestAnimationFrame(animate);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        const isMobileNow = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
        renderer.setPixelRatio(prefersReduced ? 1 : Math.min(window.devicePixelRatio || 1, isMobileNow ? 1.25 : 2));
    });
}

// === BOOK WELCOME ANIMATION ===
document.body.classList.add('welcome-active');
initWelcomeAnimation();

// Build progress dots
function buildProgressDots() {
    let container = document.getElementById('welcomeProgress');
    if (!container) {
        container = document.createElement('div');
        container.id = 'welcomeProgress';
        container.setAttribute('aria-label', 'Welcome page progress');
        container.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:28px;z-index:100000;display:flex;gap:10px;';
        document.body.appendChild(container);
    } else {
        container.innerHTML = '';
        container.style.display = 'flex';
    }

    pages.forEach((id, idx) => {
        const dot = document.createElement('button');
        dot.className = 'dot';
        dot.setAttribute('aria-label', `Welcome page ${idx + 1} of ${pages.length}`);
        dot.type = 'button';
        dot.dataset.index = idx;
        dot.addEventListener('click', () => {
            currentPage = idx;
            showNextPage();
        });
        container.appendChild(dot);
    });

    updateProgressDots();
}

function updateProgressDots() {
    const container = document.getElementById('welcomeProgress');
    if (!container) return;
    const dots = Array.from(container.children);
    dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));
}

// Focus trap
function activateFocusTrap() {
    if (!bookWelcome || _focusTrapActive) return;
    _previousActiveElement = document.activeElement;
    _focusableElements = Array.from(bookWelcome.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
                                 .filter(el => !el.hasAttribute('disabled'));
    const skip = document.getElementById('skipWelcome');
    if (skip) skip.focus();
    _focusTrapActive = true;
    document.addEventListener('keydown', _focusTrapKeyHandler, true);
}

function deactivateFocusTrap() {
    if (!_focusTrapActive) return;
    document.removeEventListener('keydown', _focusTrapKeyHandler, true);
    _focusTrapActive = false;
    if (_previousActiveElement && typeof _previousActiveElement.focus === 'function') {
        _previousActiveElement.focus();
    }
}

function _focusTrapKeyHandler(e) {
    if (!_focusTrapActive) return;
    if (e.key === 'Escape') {
        e.preventDefault();
        closeWelcomeNow();
        return;
    }
    if (e.key === 'Tab') {
        _focusableElements = Array.from(bookWelcome.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
                                     .filter(el => !el.hasAttribute('disabled'));
        if (_focusableElements.length === 0) {
            e.preventDefault();
            return;
        }

        const first = _focusableElements[0];
        const last = _focusableElements[_focusableElements.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first || bookWelcome === document.activeElement) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
}

// Start animation sequence
setTimeout(() => {
    buildProgressDots();
    activateFocusTrap();
    showNextPage();
}, 3000);

// Initialize page wrappers
function initPageWrappers() {
    pages.forEach(id => {
        const page = document.getElementById(id);
        if (!page || page.querySelector('.page-inner')) return;

        const inner = document.createElement('div');
        inner.className = 'page-inner';

        while (page.firstChild) {
            inner.appendChild(page.firstChild);
        }

        page.appendChild(inner);
    });
}

// Compress page content to fit
function compressPageContent(page) {
    if (!page) return;
    const inner = page.querySelector('.page-inner');
    if (!inner) return;

    // Save original
    if (!inner.dataset.originalFontSize) {
        const cs = window.getComputedStyle(inner);
        inner.dataset.originalFontSize = cs.fontSize;
    }

    let size = parseFloat(inner.dataset.originalFontSize);
    const minSize = 12;
    let tries = 0;
    const maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight) - 100;

    while (tries < 15) {
        inner.style.fontSize = size + 'px';
        const scrollH = inner.scrollHeight;
        const clientH = Math.min(inner.clientHeight || maxHeight, maxHeight);

        if (scrollH <= clientH + 2) break;

        size = Math.max(minSize, Math.floor(size * 0.94));
        if (size <= minSize) break;
        tries++;
    }
}

function restoreAllPageSizes() {
    pages.forEach(id => {
        const page = document.getElementById(id);
        if (!page) return;
        const inner = page.querySelector('.page-inner');
        if (inner && inner.dataset.originalFontSize) {
            inner.style.fontSize = inner.dataset.originalFontSize;
        }
    });
}

// Show next page with smooth flip
function showNextPage() {
    initPageWrappers();
    updateProgressDots();

    if (currentPage > 0) {
        const prevId = pages[currentPage - 1];
        const prevPage = document.getElementById(prevId);
        if (prevPage) {
            prevPage.classList.remove('active', 'flipping', 'forward');
            prevPage.style.display = 'none';
        }
    }

    if (currentPage < pages.length) {
        const page = document.getElementById(pages[currentPage]);
        if (!page) {
            currentPage++;
            setTimeout(showNextPage, 500);
            return;
        }

        compressPageContent(page);
        page.style.display = 'block';
        page.classList.add('active', 'flipping');

        requestAnimationFrame(() => {
            page.classList.add('forward');

            setTimeout(() => {
                page.classList.remove('flipping');
                const back = page.querySelector('.page-inner.back');
                const front = page.querySelector('.page-inner.front');
                if (back && front) {
                    back.innerHTML = front.innerHTML;
                }

                currentPage++;
                updateProgressDots();
                setTimeout(showNextPage, 450);
            }, 800);
        });
    } else {
        setTimeout(() => {
            closeWelcomeNow();
        }, 1000);
    }
}

// Unified close function
function closeWelcomeNow() {
    if (!bookWelcome || bookWelcome.classList.contains('hidden')) return;
    bookWelcome.classList.add('hidden');
    
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(welcomeAnimationId);
    const canvas = document.getElementById('welcome-canvas');
    if (canvas) canvas.style.opacity = '0';
    
    document.body.classList.remove('welcome-active');
    restoreAllPageSizes();
    deactivateFocusTrap();
    
    const prog = document.getElementById('welcomeProgress');
    if (prog && prog.parentNode) prog.parentNode.removeChild(prog);
}

// Skip button
const skipBtn = document.getElementById('skipWelcome');
if (skipBtn) {
    skipBtn.addEventListener('click', closeWelcomeNow);
}

// Touch/swipe handling
(function addSwipeHandlers(){
    let startX = 0;
    let startY = 0;
    let isTouch = false;
    const threshold = 50;

    window.addEventListener('touchstart', e => {
        if (!e.touches || e.touches.length !== 1) return;
        isTouch = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, {passive:true});

    window.addEventListener('touchend', e => {
        if (!isTouch) return;
        isTouch = false;
        const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
        const dx = endX - startX;
        if (Math.abs(dx) > threshold && dx < 0) {
            showNextPage();
        }
    });

    window.addEventListener('keydown', (e)=>{
        if (e.key === 'ArrowRight' || e.key === 'PageDown') showNextPage();
        if (e.key === 'Escape') closeWelcomeNow();
    });
})();

// === THEME TOGGLE ===
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (newTheme === 'light') {
        themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Light';
    } else {
        themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Dark';
    }
    
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (savedTheme === 'light') {
        themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Light';
    } else {
        themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Dark';
    }
});

// === MOBILE MENU ===
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const menuBtn = document.getElementById('navMenuBtn');
    const isActive = navMenu.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', isActive);
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.querySelector('nav');
    const navMenu = document.getElementById('navMenu');
    const menuBtn = document.getElementById('navMenuBtn');
    
    if (navMenu && navMenu.classList.contains('active') && 
        !nav.contains(e.target)) {
        navMenu.classList.remove('active');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }
});

// Close menu on navigation link click
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        const navMenu = document.getElementById('navMenu');
        const menuBtn = document.getElementById('navMenuBtn');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
});

// === SMOOTH SCROLLING ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// === SCROLL ANIMATIONS ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.book-card, .publication-card, .about-content, .about-image, .contact-form').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
});

// === FLOATING BOOKS IN HERO ===
(function initFloatingBooks(){
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (prefersReduced || isMobile) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    function spawnBook() {
        const book = document.createElement('div');
        book.className = 'floating-book';
        book.setAttribute('role','button');
        book.setAttribute('aria-label','Explore books');
        book.textContent = '📚';

        const left = Math.random() * 80 + 5;
        book.style.left = left + '%';
        book.style.bottom = '-10%';
        book.style.position = 'absolute';

        const scale = 0.85 + Math.random() * 0.6;
        book.style.width = Math.round(80 * scale) + 'px';
        book.style.height = Math.round(100 * scale) + 'px';
        book.style.background = 'linear-gradient(180deg, #ffb300, #0b3d91)';
        book.style.borderRadius = '8px';
        book.style.boxShadow = '0 10px 30px rgba(2,6,23,0.6)';
        book.style.display = 'flex';
        book.style.alignItems = 'center';
        book.style.justifyContent = 'center';
        book.style.cursor = 'pointer';
        book.style.fontSize = '2rem';
        book.style.zIndex = '0';

        const duration = 7000 + Math.random() * 9000;
        book.style.animation = `floatUp ${duration}ms ease-in-out forwards`;

        book.addEventListener('click', () => { window.location.hash = '#books'; });

        hero.appendChild(book);

        setTimeout(() => {
            if (book && book.parentNode) book.parentNode.removeChild(book);
        }, duration + 1400);
    }

    // Spawn initial books
    for (let i=0;i<3;i++) setTimeout(spawnBook, i * 700);
    setInterval(spawnBook, 5000);
})();

// Add floating animation keyframes
const style = document.createElement('style');
style.textContent = `
@keyframes floatUp {
    0% { transform: translateY(0px) rotateZ(0deg); opacity: 0; }
    10% { opacity: 1; }
    40% { transform: translateY(-18vh) rotateZ(6deg) translateX(6px); }
    70% { transform: translateY(-30vh) rotateZ(-6deg) translateX(-6px); }
    100% { transform: translateY(-45vh) rotateZ(-12deg) translateX(0px); opacity: 0; }
}

.floating-book {
    transition: transform 200ms ease, box-shadow 200ms ease;
}

.floating-book:hover {
    transform: scale(1.08) translateZ(0);
    box-shadow: 0 18px 40px rgba(2,6,23,0.6);
}
`;
document.head.appendChild(style);

// === PERFORMANCE MONITORING ===
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Performance:', {
                domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart)
            });
        }, 0);
    });
}

console.log('✨ Seethala Devi Chandu Portfolio Loaded Successfully!');