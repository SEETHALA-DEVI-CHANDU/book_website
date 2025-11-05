// ================================
// SEETHALA DEVI CHANDU - COMPLETE WORKING SCRIPT.JS
// Professional Portfolio Author Website
// All Animations Fixed & Working
// ================================

// GLOBAL VARIABLES
let welcomeAnimationId;
let currentPage = 0;
const pages = ['page1', 'page2', 'page3', 'page4'];
const bookWelcome = document.getElementById('bookWelcome');
const bookCover = document.getElementById('bookCover');

// Book Animation Variables
let bookPageLeft;
let bookBackCover;
let pageElements = [];
let totalPages = pages.length;
let isFlipping = false;

// Focus trap variables
let previousActiveElement = null;
let focusableElements = [];
let focusTrapActive = false;

// THREE.JS WELCOME ANIMATION
function initWelcomeAnimation() {
    const canvas = document.getElementById('welcome-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);
    renderer.setPixelRatio(prefersReduced ? 1 : devicePixelRatio);

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

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = ((event.clientX - window.innerWidth / 2) / (window.innerWidth / 2));
        mouseY = ((event.clientY - window.innerHeight / 2) / (window.innerHeight / 2));
    });

    const clock = new THREE.Clock();

    function animate() {
        const elapsedTime = clock.getElapsedTime();
        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = elapsedTime * 0.02;
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
        welcomeAnimationId = requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        const isMobileNow = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
        renderer.setPixelRatio(prefersReduced ? 1 : Math.min(window.devicePixelRatio || 1, isMobileNow ? 1.25 : 2));
    });
}

// BOOK WELCOME ANIMATION
document.body.classList.add('welcome-active');
initWelcomeAnimation();

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
            if (idx > currentPage) {
                let diff = idx - currentPage;
                for(let i=0; i<diff; i++) {
                    setTimeout(() => flipNextPage(), i * 200);
                }
            } else if (idx < currentPage) {
                currentPage = idx;
                updateProgressDots();
            }
        });
        container.appendChild(dot);
    });
    updateProgressDots();
}

function updateProgressDots() {
    const container = document.getElementById('welcomeProgress');
    if (!container) return;
    const dots = Array.from(container.children);
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === currentPage);
    });
}

function activateFocusTrap() {
    if (!bookWelcome || focusTrapActive) return;
    previousActiveElement = document.activeElement;
    focusableElements = Array.from(bookWelcome.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
        .filter(el => !el.hasAttribute('disabled'));
    const skip = document.getElementById('skipWelcome');
    if (skip) skip.focus();
    focusTrapActive = true;
    document.addEventListener('keydown', focusTrapKeyHandler, true);
}

function deactivateFocusTrap() {
    if (!focusTrapActive) return;
    document.removeEventListener('keydown', focusTrapKeyHandler, true);
    focusTrapActive = false;
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
    }
}

function focusTrapKeyHandler(e) {
    if (!focusTrapActive) return;
    if (e.key === 'Escape') {
        e.preventDefault();
        closeWelcomeNow();
        return;
    }

    if (e.key === 'Tab') {
        focusableElements = Array.from(bookWelcome.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
            .filter(el => !el.hasAttribute('disabled'));
        if (focusableElements.length === 0) {
            e.preventDefault();
            return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first || !bookWelcome.contains(document.activeElement)) {
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

setTimeout(() => {
    buildProgressDots();
    activateFocusTrap();
    showNextPage();
}, 3000);

function initPageWrappers() {
    pageElements = pages.map(id => document.getElementById(id));
    totalPages = pageElements.filter(p => p).length;
    let zIndex = totalPages;
    pageElements.forEach(page => {
        if (page) {
            page.style.zIndex = zIndex;
            zIndex--;
            const inner = page.querySelector('.page-inner');
            if (!inner) {
                const newInner = document.createElement('div');
                newInner.className = 'page-inner';
                while (page.firstChild) {
                    newInner.appendChild(page.firstChild);
                }
                page.appendChild(newInner);
            }
        }
    });
    bookPageLeft = document.getElementById('bookPageLeft');
    bookBackCover = document.getElementById('bookBackCover');
}

function compressPageContent(page) {
    if (!page) return;
    const inner = page.querySelector('.page-inner');
    if (!inner) return;
    if (!inner.dataset.originalFontSize) {
        const cs = window.getComputedStyle(inner);
        inner.dataset.originalFontSize = cs.fontSize;
    }

    let size = parseFloat(inner.dataset.originalFontSize);
    const minSize = 10;
    let tries = 0;
    const maxHeight = Math.max(document.documentElement.clientHeight, window.innerHeight) - 100;

    while (tries < 20) {
        inner.style.fontSize = size + 'px';
        const scrollH = inner.scrollHeight;
        const clientH = Math.min(inner.clientHeight || maxHeight, maxHeight);
        if (scrollH <= clientH + 2) break;
        size = Math.max(minSize, Math.floor(size * 0.92));
        if (size === minSize) break;
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

function flipNextPage() {
    if (isFlipping || currentPage >= totalPages) {
        if (currentPage >= totalPages) {
            setTimeout(closeBook, 1500);
        }
        return;
    }

    isFlipping = true;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

    if (isMobile) {
        for (let i = 0; i < currentPage; i++) {
            if (pageElements[i]) {
                pageElements[i].style.display = 'none';
            }
        }
        const currentPageElement = pageElements[currentPage];
        if (currentPageElement) {
            currentPageElement.style.display = 'block';
            currentPageElement.style.opacity = '1';
            currentPageElement.style.visibility = 'visible';
            currentPageElement.style.transform = 'none';
            currentPageElement.classList.remove('flipping');

            const pageInner = currentPageElement.querySelector('.page-inner');
            if (pageInner) {
                pageInner.style.display = 'flex';
                pageInner.style.opacity = '1';
                pageInner.style.visibility = 'visible';
            }
            compressPageContent(currentPageElement);
        }
    } else {
        const pageToFlip = pageElements[currentPage];
        if (pageToFlip) {
            pageToFlip.classList.add('flipping');
            pageToFlip.style.zIndex = totalPages + currentPage + 1;
        }
    }

    currentPage++;
    updateProgressDots();

    setTimeout(() => {
        isFlipping = false;
        if (currentPage < totalPages) {
            setTimeout(flipNextPage, 2000);
        } else {
            setTimeout(closeBook, 2000);
        }
    }, isMobile ? 100 : 1200);
}

function closeBook() {
    if (!bookCover) {
        closeWelcomeNow();
        return;
    }

    if (bookPageLeft) bookPageLeft.style.display = 'none';
    if (bookBackCover) bookBackCover.style.display = 'none';
    pageElements.forEach(p => {
        if (p) p.style.display = 'none';
    });
    bookCover.classList.remove('opened');
    bookCover.classList.add('closing');
    setTimeout(closeWelcomeNow, 1500);
}

function showNextPage() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    initPageWrappers();
    if (currentPage === 0) {
        if (bookCover) {
            bookCover.classList.add('opened');
        }
        setTimeout(() => {
            if (isMobile) {
                if (pageElements[0]) {
                    pageElements[0].style.display = 'block';
                    pageElements[0].style.opacity = '1';
                    pageElements[0].style.visibility = 'visible';
                    const pageInner = pageElements[0].querySelector('.page-inner');
                    if (pageInner) {
                        pageInner.style.display = 'flex';
                        pageInner.style.opacity = '1';
                        pageInner.style.visibility = 'visible';
                    }
                }
                for (let i = 1; i < pageElements.length; i++) {
                    if (pageElements[i]) {
                        pageElements[i].style.display = 'none';
                    }
                }
            } else {
                if (bookPageLeft) bookPageLeft.style.display = 'flex';
                if (bookBackCover) bookBackCover.style.display = 'block';
                pageElements.forEach(p => {
                    if (p) p.style.display = 'block';
                });
            }
            pageElements.forEach(p => compressPageContent(p));
            updateProgressDots();
            setTimeout(flipNextPage, 1500);
        }, 1200);
    } else {
        flipNextPage();
    }
}

function closeWelcomeNow() {
    if (!bookWelcome || bookWelcome.classList.contains('hidden')) return;
    bookWelcome.classList.add('hidden');
    if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(welcomeAnimationId);
    }

    const canvas = document.getElementById('welcome-canvas');
    if (canvas) canvas.style.opacity = '0';
    document.body.classList.remove('welcome-active');
    restoreAllPageSizes();
    deactivateFocusTrap();

    const prog = document.getElementById('welcomeProgress');
    if (prog && prog.parentNode) {
        prog.parentNode.removeChild(prog);
    }

    if (bookCover) {
        bookCover.classList.remove('opened', 'closing');
    }

    pageElements.forEach(p => {
        if(p) {
            p.classList.remove('flipping');
        }
    });
}

const skipBtn = document.getElementById('skipWelcome');
if (skipBtn) {
    skipBtn.addEventListener('click', closeWelcomeNow);
}

function addSwipeHandlers() {
    let startX = 0;
    let startY = 0;
    let isTouch = false;
    const threshold = 50;

    window.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        isTouch = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, {passive:true});

    window.addEventListener('touchend', (e) => {
        if (!isTouch) return;
        isTouch = false;
        const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
        const dx = endX - startX;
        if (Math.abs(dx) > threshold && dx < 0) {
            flipNextPage();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            flipNextPage();
        }
        if (e.key === 'Escape') {
            closeWelcomeNow();
        }
    });
}

addSwipeHandlers();

// ================================
// THEME TOGGLE
// ================================
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

// ================================
// MOBILE MENU
// ================================
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const menuBtn = document.getElementById('navMenuBtn');
    const isActive = navMenu.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', isActive);
}

document.addEventListener('click', (e) => {
    const nav = document.querySelector('nav');
    const navMenu = document.getElementById('navMenu');
    const menuBtn = document.getElementById('navMenuBtn');
    if (navMenu && navMenu.classList.contains('active') && !nav.contains(e.target)) {
        navMenu.classList.remove('active');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', false);
    }
});

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        const navMenu = document.getElementById('navMenu');
        const menuBtn = document.getElementById('navMenuBtn');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (menuBtn) menuBtn.setAttribute('aria-expanded', false);
        }
    });
});

// ================================
// SMOOTH SCROLLING
// ================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ================================
// 3D BUTTERFLIES - WORKING WITH CDN TEXTURES
// ================================
function initBookCardButterflies() {
    if (typeof THREE === 'undefined') {
        console.error('❌ Three.js is not loaded!');
        return;
    }
    
    if (typeof TWEEN === 'undefined') {
        console.error('❌ TWEEN.js is not loaded!');
        return;
    }
    
    console.log('✅ Three.js and TWEEN.js loaded successfully!');
    
    const bookCards = document.querySelectorAll('.book-card');
    console.log(`📚 Found ${bookCards.length} book cards`);
    
    bookCards.forEach((card, cardIndex) => {
        if (cardIndex !== 1) return;
        
        console.log('🦋 Initializing butterflies for Butterfly Effect book...');
        
        let scene, camera, renderer, butterflies = [];
        let isInitialized = false;
        let animationId = null;
        let isHovering = false;
        
        const getResponsiveButterflyCount = () => {
            const width = window.innerWidth;
            if (width < 480) return 25;
            if (width < 768) return 40;
            if (width < 1024) return 50;
            return 60;
        };
        
        let nbButterflies = getResponsiveButterflyCount();
        let bodyTexture, wingTexture1, wingTexture2, wingTexture3, bodyTexture4, wingTexture4;
        let conf = {
            attraction: 0.03,
            velocityLimit: 1.2,
            move: true,
            followMouse: true
        };
        let mouse = new THREE.Vector2();
        let mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        let mousePosition = new THREE.Vector3();
        let raycaster = new THREE.Raycaster();
        
        card.addEventListener('mouseenter', function() {
            console.log('🖱️ Mouse entered butterfly card!');
            isHovering = true;
            if (!isInitialized) {
                console.log('Initializing butterflies for the first time...');
                initButterflies();
                isInitialized = true;
            } else {
                console.log('Showing existing butterflies...');
                if (renderer && renderer.domElement) {
                    renderer.domElement.style.opacity = '1';
                    renderer.domElement.style.pointerEvents = 'auto';
                }
            }
        });
        
        card.addEventListener('mouseleave', function() {
            console.log('🖱️ Mouse left butterfly card!');
            isHovering = false;
            if (renderer && renderer.domElement) {
                renderer.domElement.style.opacity = '0';
                renderer.domElement.style.pointerEvents = 'none';
            }
        });
        
        card.addEventListener('mousemove', function(e) {
            if (!isInitialized || !isHovering) return;
            
            const rect = card.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(mousePlane, mousePosition);
        });
        
        function limit(number, min, max) {
            return Math.min(Math.max(number, min), max);
        }
        
        function rnd(max, negative) {
            return negative ? Math.random() * 2 * max - max : Math.random() * max;
        }
        
        function Butterfly() {
            this.minWingRotation = -Math.PI / 6;
            this.maxWingRotation = Math.PI / 2 - 0.1;
            this.wingRotation = 0;
            this.velocity = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true));
            this.destination = new THREE.Vector3();
            
            const confs = [
                { bodyTexture: bodyTexture, bodyW: 10, bodyH: 15, wingTexture: wingTexture1, wingW: 10, wingH: 15, wingX: 5.5 },
                { bodyTexture: bodyTexture, bodyW: 6, bodyH: 9, wingTexture: wingTexture2, wingW: 15, wingH: 20, wingX: 7.5 },
                { bodyTexture: bodyTexture, bodyW: 8, bodyH: 12, wingTexture: wingTexture3, wingW: 10, wingH: 15, wingX: 5.5 },
                { bodyTexture: bodyTexture4, bodyW: 6, bodyH: 10, bodyY: 2, wingTexture: wingTexture4, wingW: 15, wingH: 20, wingX: 8 },
            ];
            
            this.init(confs[Math.floor(rnd(4))]);
        }
        
        Butterfly.prototype.init = function(bconf) {
            const geometry = new THREE.PlaneGeometry(bconf.wingW, bconf.wingH);
            const material = new THREE.MeshBasicMaterial({ 
                transparent: true, 
                map: bconf.wingTexture, 
                side: THREE.DoubleSide, 
                depthTest: false 
            });
            
            const lwmesh = new THREE.Mesh(geometry, material);
            lwmesh.position.x = -bconf.wingX;
            this.lwing = new THREE.Object3D();
            this.lwing.add(lwmesh);
            
            const rwmesh = new THREE.Mesh(geometry, material);
            rwmesh.rotation.y = Math.PI;
            rwmesh.position.x = bconf.wingX;
            this.rwing = new THREE.Object3D();
            this.rwing.add(rwmesh);
            
            const bodyGeometry = new THREE.PlaneGeometry(bconf.bodyW, bconf.bodyH);
            const bodyMaterial = new THREE.MeshBasicMaterial({ 
                transparent: true, 
                map: bconf.bodyTexture, 
                side: THREE.DoubleSide, 
                depthTest: false 
            });
            this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            if (bconf.bodyY) this.body.position.y = bconf.bodyY;
            
            this.group = new THREE.Object3D();
            this.group.add(this.body);
            this.group.add(this.lwing);
            this.group.add(this.rwing);
            this.group.rotation.x = Math.PI / 2;
            this.group.rotation.y = Math.PI;
            
            this.setWingRotation(this.wingRotation);
            this.initTween();
            
            this.o3d = new THREE.Object3D();
            this.o3d.add(this.group);
        };
        
        Butterfly.prototype.initTween = function() {
            const duration = limit(conf.velocityLimit - this.velocity.length(), 0.1, 1.5) * 1000;
            this.wingRotation = this.minWingRotation;
            this.tweenWingRotation = new TWEEN.Tween(this)
                .to({ wingRotation: this.maxWingRotation }, duration)
                .repeat(1)
                .yoyo(true)
                .onComplete(function(object) {
                    object.initTween();
                })
                .start();
        };
        
        Butterfly.prototype.move = function() {
            let destination;
            if (isHovering && conf.followMouse) {
                destination = mousePosition;
            } else {
                destination = this.destination;
            }
            
            const dv = destination.clone().sub(this.o3d.position).normalize();
            this.velocity.x += conf.attraction * dv.x;
            this.velocity.y += conf.attraction * dv.y;
            this.velocity.z += conf.attraction * dv.z;
            this.limitVelocity();
            
            this.setWingRotation(this.wingRotation);
            this.o3d.lookAt(this.o3d.position.clone().add(this.velocity));
            this.o3d.position.add(this.velocity);
        };
        
        Butterfly.prototype.limitVelocity = function() {
            this.velocity.x = limit(this.velocity.x, -conf.velocityLimit, conf.velocityLimit);
            this.velocity.y = limit(this.velocity.y, -conf.velocityLimit, conf.velocityLimit);
            this.velocity.z = limit(this.velocity.z, -conf.velocityLimit, conf.velocityLimit);
        };
        
        Butterfly.prototype.setWingRotation = function(y) {
            this.lwing.rotation.y = y;
            this.rwing.rotation.y = -y;
        };
        
        Butterfly.prototype.shuffle = function() {
            this.velocity = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true));
            const p = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true)).normalize().multiplyScalar(50);
            this.o3d.position.set(p.x, p.y, p.z);
            const scale = rnd(0.4) + 0.15;
            this.o3d.scale.set(scale, scale, scale);
        };
        
        function initButterflies() {
            console.log('🎬 Starting butterfly initialization...');
            
            scene = new THREE.Scene();
            const width = card.offsetWidth;
            const height = card.offsetHeight;
            
            console.log(`📐 Card dimensions: ${width}x${height}`);
            
            camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
            camera.position.z = 75;
            
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(width, height);
            renderer.setClearColor(0x000000, 0);
            
            renderer.domElement.style.opacity = '0';
            renderer.domElement.style.transition = 'opacity 0.5s ease-in-out';
            renderer.domElement.style.pointerEvents = 'none';
            renderer.domElement.style.position = 'absolute';
            renderer.domElement.style.top = '0';
            renderer.domElement.style.left = '0';
            renderer.domElement.style.zIndex = '1';
            
            card.style.position = 'relative';
            card.appendChild(renderer.domElement);
            
            console.log('✅ Renderer created and appended to card');
            console.log('📦 Loading butterfly textures from CDN...');
            
            // Load textures from CDN with proper callback
            const textureLoader = new THREE.TextureLoader();
            let loadedCount = 0;
            const totalTextures = 6;
            
            function onTextureLoad() {
                loadedCount++;
                console.log(`✅ Texture ${loadedCount}/${totalTextures} loaded`);
                
                if (loadedCount === totalTextures) {
                    console.log(`🦋 All textures loaded! Creating ${nbButterflies} butterflies...`);
                    
                    for (let i = 0; i < nbButterflies; i++) {
                        const b = new Butterfly();
                        butterflies.push(b);
                        scene.add(b.o3d);
                        b.shuffle();
                    }
                    
                    console.log(`✅ Created ${butterflies.length} butterflies!`);
                    
                    if (isHovering) {
                        renderer.domElement.style.opacity = '1';
                        renderer.domElement.style.pointerEvents = 'auto';
                        console.log('🖱️ Showing butterflies (mouse is hovering)');
                    }
                }
            }
            
            // Load all textures with CDN URLs
            bodyTexture = textureLoader.load('https://klevron.github.io/codepen/butterflies/b1.png', onTextureLoad);
            wingTexture1 = textureLoader.load('https://klevron.github.io/codepen/butterflies/b1w.png', onTextureLoad);
            wingTexture2 = textureLoader.load('https://klevron.github.io/codepen/butterflies/b2w.png', onTextureLoad);
            wingTexture3 = textureLoader.load('https://klevron.github.io/codepen/butterflies/b3w.png', onTextureLoad);
            bodyTexture4 = textureLoader.load('https://klevron.github.io/codepen/butterflies/b4.png', onTextureLoad);
            wingTexture4 = textureLoader.load('https://klevron.github.io/codepen/butterflies/b4w.png', onTextureLoad);
            
            animate();
        }
        
        function animate() {
            animationId = requestAnimationFrame(animate);
            TWEEN.update();
            
            if (conf.move) {
                for (let i = 0; i < butterflies.length; i++) {
                    butterflies[i].move();
                }
            }
            
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        }
        
        window.addEventListener('resize', () => {
            if (!renderer) return;
            const width = card.offsetWidth;
            const height = card.offsetHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
    });
}

// ================================
// FIREWORKS FOR BOOK CARDS
// ================================
function initBookCardFireworks() {
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach((card, cardIndex) => {
        if (cardIndex !== 0) return;
        
        const FireworksSystem = function() {
            const self = this;
            
            const rand = function(rMi, rMa) {
                return ~~(Math.random() * (rMa - rMi + 1) + rMi);
            };
            
            const hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2) {
                return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
            };
            
            const getResponsiveParticleCount = () => {
                const width = window.innerWidth;
                if (width < 480) return 50;
                if (width < 768) return 75;
                if (width < 1024) return 100;
                return 120;
            };
            
            self.init = function() {
                self.canvas = document.createElement("canvas");
                self.canvas.style.position = 'absolute';
                self.canvas.style.top = '0';
                self.canvas.style.left = '0';
                self.canvas.style.pointerEvents = 'none';
                self.canvas.style.zIndex = '5';
                self.canvas.style.opacity = '0';
                self.canvas.style.transition = 'opacity 0.5s ease-in-out';
                
                self.canvas.width = self.cw = card.offsetWidth;
                self.canvas.height = self.ch = card.offsetHeight;
                self.particles = [];
                self.partCount = getResponsiveParticleCount();
                self.fireworks = [];
                self.mx = self.cw / 2;
                self.my = self.ch / 2;
                self.currentHue = 30;
                self.partSpeed = 5;
                self.partSpeedVariance = 10;
                self.partWind = 50;
                self.partFriction = 5;
                self.partGravity = 1;
                self.hueMin = 0;
                self.hueMax = 60;
                self.fworkSpeed = 3;
                self.fworkAccel = 8;
                self.hueVariance = 30;
                self.flickerDensity = 25;
                self.showShockwave = true;
                self.showTarget = false;
                self.clearAlpha = 25;
                
                card.appendChild(self.canvas);
                self.ctx = self.canvas.getContext("2d");
                self.ctx.lineCap = "round";
                self.ctx.lineJoin = "round";
                self.lineWidth = 1;
                self.bindEvents();
                self.canvasLoop();
                
                self.canvas.onselectstart = function() {
                    return false;
                };
            };
            
            self.createParticles = function(x, y, hue) {
                let countdown = self.partCount;
                while (countdown--) {
                    const newParticle = {
                        x: x,
                        y: y,
                        coordLast: [
                            { x: x, y: y },
                            { x: x, y: y },
                            { x: x, y: y },
                        ],
                        angle: rand(0, 360),
                        speed: rand(
                            self.partSpeed - self.partSpeedVariance <= 0 ? 1 : self.partSpeed - self.partSpeedVariance,
                            self.partSpeed + self.partSpeedVariance
                        ),
                        friction: 1 - self.partFriction / 100,
                        gravity: self.partGravity / 2,
                        hue: rand(hue - self.hueVariance, hue + self.hueVariance),
                        brightness: rand(50, 80),
                        alpha: rand(40, 100) / 100,
                        decay: rand(10, 50) / 1000,
                        wind: (rand(0, self.partWind) - self.partWind / 2) / 25,
                        lineWidth: self.lineWidth,
                    };
                    self.particles.push(newParticle);
                }
            };
            
            self.updateParticles = function() {
                let i = self.particles.length;
                while (i--) {
                    const p = self.particles[i];
                    const radians = (p.angle * Math.PI) / 180;
                    const vx = Math.cos(radians) * p.speed;
                    const vy = Math.sin(radians) * p.speed;
                    p.speed *= p.friction;
                    
                    p.coordLast[2].x = p.coordLast[1].x;
                    p.coordLast[2].y = p.coordLast[1].y;
                    p.coordLast[1].x = p.coordLast[0].x;
                    p.coordLast[1].y = p.coordLast[0].y;
                    p.coordLast[0].x = p.x;
                    p.coordLast[0].y = p.y;
                    
                    p.x += vx;
                    p.y += vy;
                    p.y += p.gravity;
                    p.angle += p.wind;
                    p.alpha -= p.decay;
                    
                    if (!hitTest(0, 0, self.cw, self.ch, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2) || p.alpha < 0.05) {
                        self.particles.splice(i, 1);
                    }
                }
            };
            
            self.drawParticles = function() {
                let i = self.particles.length;
                while (i--) {
                    const p = self.particles[i];
                    const coordRand = rand(1, 3) - 1;
                    self.ctx.beginPath();
                    self.ctx.moveTo(Math.round(p.coordLast[coordRand].x), Math.round(p.coordLast[coordRand].y));
                    self.ctx.lineTo(Math.round(p.x), Math.round(p.y));
                    self.ctx.closePath();
                    self.ctx.strokeStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${p.alpha})`;
                    self.ctx.stroke();
                    
                    if (self.flickerDensity > 0) {
                        const inverseDensity = 50 - self.flickerDensity;
                        if (rand(0, inverseDensity) === inverseDensity) {
                            self.ctx.beginPath();
                            self.ctx.arc(Math.round(p.x), Math.round(p.y), rand(p.lineWidth, p.lineWidth + 3) / 2, 0, Math.PI * 2, false);
                            self.ctx.closePath();
                            const randAlpha = rand(50, 100) / 100;
                            self.ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${randAlpha})`;
                            self.ctx.fill();
                        }
                    }
                }
            };
            
            self.createFireworks = function(startX, startY, targetX, targetY) {
                const newFirework = {
                    x: startX,
                    y: startY,
                    startX: startX,
                    startY: startY,
                    hitX: false,
                    hitY: false,
                    coordLast: [
                        { x: startX, y: startY },
                        { x: startX, y: startY },
                        { x: startX, y: startY },
                    ],
                    targetX: targetX,
                    targetY: targetY,
                    speed: self.fworkSpeed,
                    angle: Math.atan2(targetY - startY, targetX - startX),
                    shockwaveAngle: Math.atan2(targetY - startY, targetX - startX) + 90 * (Math.PI / 180),
                    acceleration: self.fworkAccel / 100,
                    hue: self.currentHue,
                    brightness: rand(50, 80),
                    alpha: rand(50, 100) / 100,
                    lineWidth: self.lineWidth,
                };
                self.fireworks.push(newFirework);
            };
            
            self.updateFireworks = function() {
                let i = self.fireworks.length;
                while (i--) {
                    const f = self.fireworks[i];
                    self.ctx.lineWidth = f.lineWidth;
                    
                    const vx = Math.cos(f.angle) * f.speed;
                    const vy = Math.sin(f.angle) * f.speed;
                    f.speed *= 1 + f.acceleration;
                    f.coordLast[2].x = f.coordLast[1].x;
                    f.coordLast[2].y = f.coordLast[1].y;
                    f.coordLast[1].x = f.coordLast[0].x;
                    f.coordLast[1].y = f.coordLast[0].y;
                    f.coordLast[0].x = f.x;
                    f.coordLast[0].y = f.y;
                    
                    if (f.startX >= f.targetX) {
                        if (f.x + vx <= f.targetX) {
                            f.x = f.targetX;
                            f.hitX = true;
                        } else {
                            f.x += vx;
                        }
                    } else {
                        if (f.x + vx >= f.targetX) {
                            f.x = f.targetX;
                            f.hitX = true;
                        } else {
                            f.x += vx;
                        }
                    }
                    
                    if (f.startY >= f.targetY) {
                        if (f.y + vy <= f.targetY) {
                            f.y = f.targetY;
                            f.hitY = true;
                        } else {
                            f.y += vy;
                        }
                    } else {
                        if (f.y + vy >= f.targetY) {
                            f.y = f.targetY;
                            f.hitY = true;
                        } else {
                            f.y += vy;
                        }
                    }
                    
                    if (f.hitX && f.hitY) {
                        self.createParticles(f.targetX, f.targetY, f.hue);
                        self.fireworks.splice(i, 1);
                    }
                }
            };
            
            self.drawFireworks = function() {
                let i = self.fireworks.length;
                self.ctx.globalCompositeOperation = "lighter";
                while (i--) {
                    const f = self.fireworks[i];
                    self.ctx.lineWidth = f.lineWidth;
                    
                    const coordRand = rand(1, 3) - 1;
                    self.ctx.beginPath();
                    self.ctx.moveTo(Math.round(f.coordLast[coordRand].x), Math.round(f.coordLast[coordRand].y));
                    self.ctx.lineTo(Math.round(f.x), Math.round(f.y));
                    self.ctx.closePath();
                    self.ctx.strokeStyle = `hsla(${f.hue}, 100%, ${f.brightness}%, ${f.alpha})`;
                    self.ctx.stroke();
                    
                    if (self.showShockwave) {
                        self.ctx.save();
                        self.ctx.translate(Math.round(f.x), Math.round(f.y));
                        self.ctx.rotate(f.shockwaveAngle);
                        self.ctx.beginPath();
                        self.ctx.arc(0, 0, 1 * (f.speed / 5), 0, Math.PI, true);
                        self.ctx.strokeStyle = `hsla(${f.hue}, 100%, ${f.brightness}%, ${rand(25, 60) / 100})`;
                        self.ctx.lineWidth = f.lineWidth;
                        self.ctx.stroke();
                        self.ctx.restore();
                    }
                }
            };
            
            self.bindEvents = function() {
                card.addEventListener("mouseenter", function() {
                    self.canvas.style.opacity = '1';
                });
                
                card.addEventListener("mouseleave", function() {
                    self.canvas.style.opacity = '0';
                });
                
                card.addEventListener("mousemove", function(e) {
                    const rect = card.getBoundingClientRect();
                    self.mx = e.clientX - rect.left;
                    self.my = e.clientY - rect.top;
                    self.currentHue = rand(self.hueMin, self.hueMax);
                    
                    if (Math.random() > 0.85) {
                        self.createFireworks(self.cw / 2, self.ch, self.mx, self.my);
                    }
                });
            };
            
            self.canvasLoop = function() {
                requestAnimationFrame(self.canvasLoop);
                self.ctx.globalCompositeOperation = "destination-out";
                self.ctx.fillStyle = `rgba(0,0,0,${self.clearAlpha / 100})`;
                self.ctx.fillRect(0, 0, self.cw, self.ch);
                self.updateFireworks();
                self.updateParticles();
                self.drawFireworks();
                self.drawParticles();
            };
            
            window.addEventListener('resize', () => {
                const newWidth = card.offsetWidth;
                const newHeight = card.offsetHeight;
                if (self.canvas.width !== newWidth || self.canvas.height !== newHeight) {
                    self.canvas.width = self.cw = newWidth;
                    self.canvas.height = self.ch = newHeight;
                    self.partCount = getResponsiveParticleCount();
                }
            });
            
            self.init();
        };
        
        new FireworksSystem();
    });
}

// ================================
// INITIALIZE ANIMATIONS
// ================================
window.addEventListener('load', function() {
    const tweenScript = document.createElement('script');
    tweenScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/16.7.0/Tween.js';
    tweenScript.onload = function() {
        setTimeout(() => {
            if (typeof THREE !== 'undefined' && typeof TWEEN !== 'undefined') {
                initBookCardButterflies();
            }
        }, 1000);
    };
    document.head.appendChild(tweenScript);
    
    setTimeout(() => {
        initBookCardFireworks();
    }, 1500);
});

// ================================
// SCROLL ANIMATIONS
// ================================
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

// ================================
// FLOATING BOOKS IN HERO
// ================================
function initFloatingBooks() {
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

        book.addEventListener('click', () => {
            window.location.hash = '#books';
        });

        hero.appendChild(book);

        setTimeout(() => {
            if (book && book.parentNode) {
                book.parentNode.removeChild(book);
            }
        }, duration + 1400);
    }

    for(let i=0;i<3;i++){
        setTimeout(spawnBook, i * 700);
    }
    setInterval(spawnBook, 5000);
}

window.addEventListener('load', () => {
    setTimeout(initFloatingBooks, 500);
});

// ================================
// FORM SUBMISSION
// ================================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('form[name="contact"]');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/success.html';
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error submitting your form. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

console.log('✨ Seethala Devi Chandu Portfolio Loaded Successfully!');
