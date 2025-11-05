// === 3D REALISTIC BUTTERFLY SPLASH SCREEN ===
const nbButterfliesSplash = 40;
var splashScene, splashCamera, splashRenderer;
var splashButterflies;
var bodyTexture, wingTexture1, wingTexture2, wingTexture3, bodyTexture4, wingTexture4;
var destination = new THREE.Vector3(0, 0, 0);

var mouse = new THREE.Vector2();
var mouseOver = false;
var mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var mousePosition = new THREE.Vector3();
var raycaster = new THREE.Raycaster();

var splashConf = {
    attraction: 0.03,
    velocityLimit: 1.2,
    move: true,
    followMouse: true
};

function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    
    splashScene = new THREE.Scene();
    splashScene.background = new THREE.Color(0x1a1510);
    
    splashCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    splashCamera.position.z = 75;
    
    splashRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    splashRenderer.setSize(window.innerWidth, window.innerHeight);
    splash.appendChild(splashRenderer.domElement);
    
    // Load butterfly textures
    bodyTexture = new THREE.TextureLoader().load('https://klevron.github.io/codepen/butterflies/b1.png');
    wingTexture1 = new THREE.TextureLoader().load('https://klevron.github.io/codepen/butterflies/b1w.png');
    wingTexture2 = new THREE.TextureLoader().load('https://klevron.github.io/codepen/butterflies/b2w.png');
    wingTexture3 = new THREE.TextureLoader().load('https://klevron.github.io/codepen/butterflies/b3w.png');
    bodyTexture4 = new THREE.TextureLoader().load('https://klevron.github.io/codepen/butterflies/b4.png');
    wingTexture4 = new THREE.TextureLoader().load('https://klevron.github.io/codepen/butterflies/b4w.png');
    
    splashButterflies = [];
    for (var i = 0; i < nbButterfliesSplash; i++) {
        var b = new Butterfly();
        splashButterflies.push(b);
        splashScene.add(b.o3d);
    }
    
    shuffleButterflies();
    
    window.addEventListener('resize', onSplashResize, false);
    document.addEventListener('mousemove', onSplashMouseMove, false);
    document.addEventListener('mouseout', function () { mouseOver = false; }, false);
    
    animateSplash();
    
    // Hide splash after 7 seconds
    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            initEnhancedBackgroundAnimations();
            cancelAnimationFrame(splashAnimationId);
        }, 1500);
    }, 7000);
}

var splashAnimationId;
function animateSplash() {
    splashAnimationId = requestAnimationFrame(animateSplash);
    
    TWEEN.update();
    
    if (splashConf.move) {
        for (var i = 0; i < splashButterflies.length; i++) {
            splashButterflies[i].move();
        }
    }
    
    splashRenderer.render(splashScene, splashCamera);
}

function shuffleButterflies() {
    for (var i = 0; i < splashButterflies.length; i++) {
        splashButterflies[i].shuffle();
    }
}

// === BUTTERFLY CONSTRUCTOR ===
function Butterfly() {
    this.minWingRotation = -Math.PI / 6;
    this.maxWingRotation = Math.PI / 2 - 0.1;
    this.wingRotation = 0;
    
    this.velocity = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true));
    this.destination = destination;
    
    var confs = [
        { bodyTexture: bodyTexture, bodyW: 10, bodyH: 15, wingTexture: wingTexture1, wingW: 10, wingH: 15, wingX: 5.5 },
        { bodyTexture: bodyTexture, bodyW: 6, bodyH: 9, wingTexture: wingTexture2, wingW: 15, wingH: 20, wingX: 7.5 },
        { bodyTexture: bodyTexture, bodyW: 8, bodyH: 12, wingTexture: wingTexture3, wingW: 10, wingH: 15, wingX: 5.5 },
        { bodyTexture: bodyTexture4, bodyW: 6, bodyH: 10, bodyY: 2, wingTexture: wingTexture4, wingW: 15, wingH: 20, wingX: 8 },
    ];
    
    this.init(confs[Math.floor(rnd(4))]);
}

Butterfly.prototype.init = function (bconf) {
    var geometry = new THREE.PlaneGeometry(bconf.wingW, bconf.wingH);
    var material = new THREE.MeshBasicMaterial({ transparent: true, map: bconf.wingTexture, side: THREE.DoubleSide, depthTest: false });
    var lwmesh = new THREE.Mesh(geometry, material);
    lwmesh.position.x = -bconf.wingX;
    this.lwing = new THREE.Object3D();
    this.lwing.add(lwmesh);
    
    var rwmesh = new THREE.Mesh(geometry, material);
    rwmesh.rotation.y = Math.PI;
    rwmesh.position.x = bconf.wingX;
    this.rwing = new THREE.Object3D();
    this.rwing.add(rwmesh);
    
    geometry = new THREE.PlaneGeometry(bconf.bodyW, bconf.bodyH);
    material = new THREE.MeshBasicMaterial({ transparent: true, map: bconf.bodyTexture, side: THREE.DoubleSide, depthTest: false });
    this.body = new THREE.Mesh(geometry, material);
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

Butterfly.prototype.initTween = function () {
    var duration = limit(splashConf.velocityLimit - this.velocity.length(), 0.1, 1.5) * 1000;
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

Butterfly.prototype.move = function () {
    var dest;
    if (mouseOver && splashConf.followMouse) {
        dest = mousePosition;
    } else {
        dest = this.destination;
    }
    
    var dv = dest.clone().sub(this.o3d.position).normalize();
    this.velocity.x += splashConf.attraction * dv.x;
    this.velocity.y += splashConf.attraction * dv.y;
    this.velocity.z += splashConf.attraction * dv.z;
    this.limitVelocity();
    
    // update position & rotation
    this.setWingRotation(this.wingRotation);
    this.o3d.lookAt(this.o3d.position.clone().add(this.velocity));
    this.o3d.position.add(this.velocity);
};

Butterfly.prototype.limitVelocity = function () {
    this.velocity.x = limit(this.velocity.x, -splashConf.velocityLimit, splashConf.velocityLimit);
    this.velocity.y = limit(this.velocity.y, -splashConf.velocityLimit, splashConf.velocityLimit);
    this.velocity.z = limit(this.velocity.z, -splashConf.velocityLimit, splashConf.velocityLimit);
};

Butterfly.prototype.setWingRotation = function (y) {
    this.lwing.rotation.y = y;
    this.rwing.rotation.y = -y;
};

Butterfly.prototype.shuffle = function () {
    this.velocity = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true));
    var p = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true)).normalize().multiplyScalar(100);
    this.o3d.position.set(p.x, p.y, p.z);
    var scale = rnd(0.4) + 0.1;
    this.o3d.scale.set(scale, scale, scale);
}

function limit(number, min, max) {
    return Math.min(Math.max(number, min), max);
}

function rnd(max, negative) {
    return negative ? Math.random() * 2 * max - max : Math.random() * max;
}

function onSplashResize() {
    splashCamera.aspect = window.innerWidth / window.innerHeight;
    splashCamera.updateProjectionMatrix();
    splashRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onSplashMouseMove(event) {
    var v = new THREE.Vector3();
    splashCamera.getWorldDirection(v);
    v.normalize();
    mousePlane.normal = v;
    
    mouseOver = true;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, splashCamera);
    raycaster.ray.intersectPlane(mousePlane, mousePosition);
}

// Initialize splash screen on load
window.addEventListener('load', () => {
    initSplashScreen();
});

// === 3D BACKGROUND BUTTERFLIES (LESS QUANTITY) ===
const nbButterfliesBackground = 15; // Reduced quantity
var bgScene, bgCamera, bgRenderer;
var bgButterflies;
var bgDestination = new THREE.Vector3(0, 0, 0);
var bgMouse = new THREE.Vector2();
var bgMouseOver = false;
var bgMousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var bgMousePosition = new THREE.Vector3();
var bgRaycaster = new THREE.Raycaster();

var bgConf = {
    attraction: 0.02,
    velocityLimit: 0.8,
    move: true,
    followMouse: false // Disabled for background
};

function initBackgroundButterflies() {
    const bgContainer = document.getElementById('bg-butterflies-canvas');
    
    bgScene = new THREE.Scene();
    bgScene.background = null; // Transparent background
    
    bgCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    bgCamera.position.z = 75;
    
    bgRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    bgRenderer.setClearColor(0x000000, 0); // Transparent
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgContainer.appendChild(bgRenderer.domElement);
    
    bgButterflies = [];
    for (var i = 0; i < nbButterfliesBackground; i++) {
        var b = new BackgroundButterfly();
        bgButterflies.push(b);
        bgScene.add(b.o3d);
    }
    
    shuffleBackgroundButterflies();
    
    window.addEventListener('resize', onBgResize, false);
    
    animateBackgroundButterflies();
}

function BackgroundButterfly() {
    this.minWingRotation = -Math.PI / 6;
    this.maxWingRotation = Math.PI / 2 - 0.1;
    this.wingRotation = 0;
    
    this.velocity = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true));
    this.destination = bgDestination;
    
    var confs = [
        { bodyTexture: bodyTexture, bodyW: 10, bodyH: 15, wingTexture: wingTexture1, wingW: 10, wingH: 15, wingX: 5.5 },
        { bodyTexture: bodyTexture, bodyW: 6, bodyH: 9, wingTexture: wingTexture2, wingW: 15, wingH: 20, wingX: 7.5 },
        { bodyTexture: bodyTexture, bodyW: 8, bodyH: 12, wingTexture: wingTexture3, wingW: 10, wingH: 15, wingX: 5.5 },
        { bodyTexture: bodyTexture4, bodyW: 6, bodyH: 10, bodyY: 2, wingTexture: wingTexture4, wingW: 15, wingH: 20, wingX: 8 },
    ];
    
    this.initBg(confs[Math.floor(rnd(4))]);
}

BackgroundButterfly.prototype.initBg = function (bconf) {
    var geometry = new THREE.PlaneGeometry(bconf.wingW, bconf.wingH);
    var material = new THREE.MeshBasicMaterial({ transparent: true, map: bconf.wingTexture, side: THREE.DoubleSide, depthTest: false, opacity: 0.6 });
    var lwmesh = new THREE.Mesh(geometry, material);
    lwmesh.position.x = -bconf.wingX;
    this.lwing = new THREE.Object3D();
    this.lwing.add(lwmesh);
    
    var rwmesh = new THREE.Mesh(geometry, material);
    rwmesh.rotation.y = Math.PI;
    rwmesh.position.x = bconf.wingX;
    this.rwing = new THREE.Object3D();
    this.rwing.add(rwmesh);
    
    geometry = new THREE.PlaneGeometry(bconf.bodyW, bconf.bodyH);
    material = new THREE.MeshBasicMaterial({ transparent: true, map: bconf.bodyTexture, side: THREE.DoubleSide, depthTest: false, opacity: 0.6 });
    this.body = new THREE.Mesh(geometry, material);
    if (bconf.bodyY) this.body.position.y = bconf.bodyY;
    
    this.group = new THREE.Object3D();
    this.group.add(this.body);
    this.group.add(this.lwing);
    this.group.add(this.rwing);
    this.group.rotation.x = Math.PI / 2;
    this.group.rotation.y = Math.PI;
    
    this.setWingRotationBg(this.wingRotation);
    this.initTweenBg();
    
    this.o3d = new THREE.Object3D();
    this.o3d.add(this.group);
};

BackgroundButterfly.prototype.initTweenBg = function () {
    var duration = limit(bgConf.velocityLimit - this.velocity.length(), 0.1, 1.5) * 1000;
    this.wingRotation = this.minWingRotation;
    this.tweenWingRotation = new TWEEN.Tween(this)
        .to({ wingRotation: this.maxWingRotation }, duration)
        .repeat(1)
        .yoyo(true)
        .onComplete(function(object) {
            object.initTweenBg();
        })
        .start();
};

BackgroundButterfly.prototype.moveBg = function () {
    var dest = this.destination;
    
    var dv = dest.clone().sub(this.o3d.position).normalize();
    this.velocity.x += bgConf.attraction * dv.x;
    this.velocity.y += bgConf.attraction * dv.y;
    this.velocity.z += bgConf.attraction * dv.z;
    this.limitVelocityBg();
    
    // update position & rotation
    this.setWingRotationBg(this.wingRotation);
    this.o3d.lookAt(this.o3d.position.clone().add(this.velocity));
    this.o3d.position.add(this.velocity);
};

BackgroundButterfly.prototype.limitVelocityBg = function () {
    this.velocity.x = limit(this.velocity.x, -bgConf.velocityLimit, bgConf.velocityLimit);
    this.velocity.y = limit(this.velocity.y, -bgConf.velocityLimit, bgConf.velocityLimit);
    this.velocity.z = limit(this.velocity.z, -bgConf.velocityLimit, bgConf.velocityLimit);
};

BackgroundButterfly.prototype.setWingRotationBg = function (y) {
    this.lwing.rotation.y = y;
    this.rwing.rotation.y = -y;
};

BackgroundButterfly.prototype.shuffleBg = function () {
    this.velocity = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true));
    var p = new THREE.Vector3(rnd(1, true), rnd(1, true), rnd(1, true)).normalize().multiplyScalar(100);
    this.o3d.position.set(p.x, p.y, p.z);
    var scale = rnd(0.3) + 0.08; // Slightly smaller
    this.o3d.scale.set(scale, scale, scale);
}

function shuffleBackgroundButterflies() {
    for (var i = 0; i < bgButterflies.length; i++) {
        bgButterflies[i].shuffleBg();
    }
}

function animateBackgroundButterflies() {
    requestAnimationFrame(animateBackgroundButterflies);
    
    TWEEN.update();
    
    if (bgConf.move) {
        for (var i = 0; i < bgButterflies.length; i++) {
            bgButterflies[i].moveBg();
        }
    }
    
    bgRenderer.render(bgScene, bgCamera);
}

function onBgResize() {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
}

// === ENHANCED BACKGROUND ANIMATIONS WITH GOLDEN PARTICLES ===
function initEnhancedBackgroundAnimations() {
    // Initialize 3D background butterflies
    initBackgroundButterflies();
    
    const particlesCanvas = document.getElementById('particles-canvas');
    const ctx = particlesCanvas.getContext('2d');
    
    function resizeCanvas() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = document.body.scrollHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Enhanced particle system
    const particles = [];
    const particleCount = Math.min(100, Math.floor(window.innerWidth / 15));
    
    class EnhancedParticle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * particlesCanvas.width;
            this.y = Math.random() * particlesCanvas.height;
            this.size = Math.random() * 3.5 + 1;
            this.speedX = (Math.random() - 0.5) * 0.9;
            this.speedY = (Math.random() - 0.5) * 0.9;
            this.opacity = Math.random() * 0.7 + 0.3;
            this.hue = 40 + Math.random() * 25; // Golden hues
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > particlesCanvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > particlesCanvas.height) this.speedY *= -1;
            
            this.hue += 0.25;
            if (this.hue > 65) this.hue = 40;
        }
        
        draw() {
            ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.opacity})`;
            ctx.shadowBlur = 18;
            ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, 0.9)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new EnhancedParticle());
    }
    
    function animateEnhancedParticles() {
        ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Enhanced connections with golden colors
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 140) {
                    const avgHue = (particles[i].hue + particles[j].hue) / 2;
                    ctx.strokeStyle = `hsla(${avgHue}, 85%, 55%, ${0.35 * (1 - distance / 140)})`;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateEnhancedParticles);
    }
    
    animateEnhancedParticles();
    
    // Create floating golden elements
    createGoldenElements();
}

function createGoldenElements() {
    const background = document.querySelector('.animated-background');
    
    // Create golden particles
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'golden-particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 350}px`);
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.width = `${Math.random() * 4 + 3}px`;
        particle.style.height = particle.style.width;
        background.appendChild(particle);
    }
    
    // Create sparkle particles
    const sparkleCount = Math.min(35, Math.floor(window.innerWidth / 35));
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.setProperty('--sparkle-drift', `${(Math.random() - 0.5) * 250}px`);
        sparkle.style.setProperty('--sparkle-final', `${(Math.random() - 0.5) * 400}px`);
        sparkle.style.setProperty('--rotation', `${(Math.random() - 0.5) * 360}deg`);
        sparkle.style.animationDuration = `${20 + Math.random() * 12}s`;
        sparkle.style.animationDelay = `${Math.random() * 18}s`;
        sparkle.style.width = `${Math.random() * 5 + 5}px`;
        sparkle.style.height = sparkle.style.width;
        background.appendChild(sparkle);
    }
    
    // Create dust trails
    const dustCount = Math.min(70, Math.floor(window.innerWidth / 18));
    for (let i = 0; i < dustCount; i++) {
        const dust = document.createElement('div');
        dust.className = 'dust-trail';
        dust.style.left = `${Math.random() * 100}%`;
        dust.style.setProperty('--dust-drift', `${(Math.random() - 0.5) * 300}px`);
        dust.style.animationDuration = `${13 + Math.random() * 9}s`;
        dust.style.animationDelay = `${Math.random() * 13}s`;
        dust.style.width = `${Math.random() * 3 + 2}px`;
        dust.style.height = dust.style.width;
        background.appendChild(dust);
    }
}

// Enhanced scroll animations
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.dedication, .foreword, .introduction, .preface, .chapter');
    sections.forEach(section => {
        observer.observe(section);
    });
});

// Anti-copy protection
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'u' || e.key === 's' || e.key === 'a')) {
        e.preventDefault();
        return false;
    }
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        return false;
    }
});
document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('selectstart', event => event.preventDefault());
