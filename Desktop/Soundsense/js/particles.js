// NoiseSense - Particle Animation System
class ParticleSystem {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      count: 50,
      minSize: 5,
      maxSize: 15,
      speed: 1,
      color: '#3b82f6',
      opacity: 0.1,
      blurAmount: 5,
      ...options
    };
    
    this.particles = [];
    this.isAnimating = false;
    this.bounds = {
      width: 0,
      height: 0
    };
    
    this.init();
  }
  
  init() {
    this.createParticles();
    this.setupResizeObserver();
    this.animate();
  }
  
  createParticles() {
    // Clear existing particles
    this.particles.forEach(p => p.element.remove());
    this.particles = [];
    
    // Update bounds
    const rect = this.container.getBoundingClientRect();
    this.bounds = {
      width: rect.width,
      height: rect.height
    };
    
    // Create new particles
    for (let i = 0; i < this.options.count; i++) {
      this.createParticle();
    }
  }
  
  createParticle() {
    const element = document.createElement('div');
    element.classList.add('particle');
    
    const size = this.random(this.options.minSize, this.options.maxSize);
    
    element.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background-color: ${this.options.color};
      opacity: ${this.options.opacity};
      filter: blur(${this.options.blurAmount}px);
      left: ${this.random(0, this.bounds.width)}px;
      top: ${this.random(0, this.bounds.height)}px;
    `;
    
    this.container.appendChild(element);
    
    const particle = {
      element,
      size,
      x: parseFloat(element.style.left),
      y: parseFloat(element.style.top),
      speedX: this.random(-0.5, 0.5) * this.options.speed,
      speedY: this.random(-0.5, 0.5) * this.options.speed
    };
    
    this.particles.push(particle);
  }
  
  setupResizeObserver() {
    const resizeObserver = new ResizeObserver(() => {
      this.createParticles();
    });
    
    resizeObserver.observe(this.container);
  }
  
  animate() {
    if (!this.isAnimating) return;
    
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Bounce off walls
      if (particle.x <= 0 || particle.x >= this.bounds.width - particle.size) {
        particle.speedX *= -1;
      }
      if (particle.y <= 0 || particle.y >= this.bounds.height - particle.size) {
        particle.speedY *= -1;
      }
      
      // Apply position
      particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
    });
    
    requestAnimationFrame(() => this.animate());
  }
  
  start() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }
  
  stop() {
    this.isAnimating = false;
  }
  
  random(min, max) {
    return Math.random() * (max - min) + min;
  }
}

// Create particle systems for different sections
document.addEventListener('DOMContentLoaded', () => {
  // Hero section particles
  const heroContainer = document.querySelector('.hero .particles');
  if (heroContainer) {
    const heroParticles = new ParticleSystem(heroContainer, {
      count: 30,
      color: 'var(--color-accent)',
      speed: 0.3
    });
    heroParticles.start();
  }
  
  // Measuring section particles
  const measureContainer = document.querySelector('.measure-container .particles');
  if (measureContainer) {
    const measureParticles = new ParticleSystem(measureContainer, {
      count: 20,
      color: 'var(--color-success)',
      speed: 0.2,
      minSize: 3,
      maxSize: 8
    });
    measureParticles.start();
  }
}); 