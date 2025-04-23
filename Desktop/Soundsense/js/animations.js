// NoiseSense - Enhanced Animations & Motion Graphics
// Dependencies: GSAP, ScrollTrigger, Lottie

gsap.registerPlugin(ScrollTrigger);

// Advanced Animation Configuration
const ANIMATION_CONFIG = {
  stagger: {
    amount: 0.4,
    from: "start",
    ease: "power2.out"
  },
  ease: "expo.out",
  duration: 1,
  breakpoints: {
    mobile: 768,
    tablet: 1024
  },
  transitions: {
    smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
    springy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    bouncy: "cubic-bezier(0.68, -0.6, 0.32, 1.6)"
  }
};

// Initialize all animations with performance optimization
function initAnimations() {
  // Create a timeline for initial page load animations
  const mainTl = gsap.timeline({
    defaults: {
      ease: ANIMATION_CONFIG.transitions.smooth,
      duration: 1
    }
  });

  // Fade out loader
  mainTl.to('.page-loader', {
    opacity: 0,
    duration: 0.5,
    onComplete: () => document.querySelector('.page-loader')?.remove()
  });

  // Use requestIdleCallback for non-critical animations
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      initHeroAnimations(mainTl);
      initParallaxEffects();
      initFloatingElements();
    });
  } else {
    setTimeout(() => {
      initHeroAnimations(mainTl);
      initParallaxEffects();
      initFloatingElements();
    }, 0);
  }

  // Initialize critical animations immediately
  initMeasuringStageAnimations();
  initProgressBar();
  initPhoneTimeline();
  initBackgroundEffects();
}

// Hero Section Animations with advanced effects
function initHeroAnimations(mainTl) {
  const heroTl = gsap.timeline({
    defaults: { 
      ease: ANIMATION_CONFIG.transitions.smooth,
      force3D: true,
      willChange: "transform, opacity"
    }
  });

  // Split text only if needed
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && !heroTitle.querySelector('.char')) {
    splitText(heroTitle);
  }

  // Advanced text animation
  heroTl
    .from(".hero-title .char", {
      opacity: 0,
      y: 100,
      rotateX: -90,
      duration: 1,
      stagger: {
        ...ANIMATION_CONFIG.stagger,
        each: 0.05
      }
    })
    .from(".hero-subtitle", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
      webkitClipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)"
    }, "-=0.4")
    .from(".hero-cta", {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: ANIMATION_CONFIG.transitions.springy
    }, "-=0.2");

  // Advanced floating animation with 3D effect
  gsap.to(".hero-visual", {
    y: 20,
    rotateX: 10,
    rotateY: 10,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    transformPerspective: 1000,
    transformOrigin: "center center",
    force3D: true
  });

  // Add to main timeline
  mainTl.add(heroTl);
}

// Enhanced Parallax Effects with depth
function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  parallaxElements.forEach(element => {
    const speed = element.dataset.parallax || 0.2;
    const rotation = element.dataset.rotation || 0;
    const scale = element.dataset.scale || 1;
    
    gsap.to(element, {
      y: () => -ScrollTrigger.maxScroll(window) * speed,
      rotate: rotation,
      scale: scale,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      },
      force3D: true
    });
  });
}

// New: Floating Elements Animation
function initFloatingElements() {
  const elements = document.querySelectorAll('.float');
  
  elements.forEach((element, index) => {
    gsap.to(element, {
      y: "random(-20, 20)",
      x: "random(-10, 10)",
      rotation: "random(-10, 10)",
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.2
    });
  });
}

// New: Background Effects
function initBackgroundEffects() {
  // Create particles
  const particlesContainer = document.querySelector('.particles');
  if (particlesContainer) {
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particlesContainer.appendChild(particle);
      
      gsap.set(particle, {
        x: "random(0, 100%)",
        y: "random(0, 100%)",
        scale: "random(0.5, 1.5)"
      });
      
      gsap.to(particle, {
        x: "random(0, 100%)",
        y: "random(0, 100%)",
        duration: "random(10, 20)",
        repeat: -1,
        ease: "none"
      });
    }
  }
}

// Enhanced Measuring Stage Animations
function initMeasuringStageAnimations() {
  const stages = document.querySelectorAll('.measure-stage');
  
  stages.forEach((stage, index) => {
    const stageTl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top 80%",
        end: "top 20%",
        toggleActions: "play none none reverse"
      }
    });

    stageTl
      .from(stage, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: ANIMATION_CONFIG.transitions.smooth
      })
      .from(stage.querySelectorAll('.stage-content > *'), {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: ANIMATION_CONFIG.transitions.springy
      }, "-=0.4")
      .to(stage, {
        scale: 1,
        duration: 0.5,
        ease: ANIMATION_CONFIG.transitions.bouncy
      }, "-=0.2");

    updateProgress((index + 1) / stages.length);
  });
}

// Optimized Progress Bar with smooth updates
function updateProgress(progress) {
  gsap.to('.progress-fill', {
    scaleX: progress,
    duration: 0.5,
    ease: ANIMATION_CONFIG.transitions.smooth,
    force3D: true
  });
}

// Enhanced Phone Timeline Animation
function initPhoneTimeline() {
  const phoneContainer = document.querySelector('.phone-container');
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  if (!phoneContainer || !timelineItems.length) return;
  
  timelineItems.forEach((item, index) => {
    gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        onEnter: () => activateTimelineItem(index),
        onLeaveBack: () => activateTimelineItem(index - 1)
      }
    });
  });
}

// Optimized Timeline Item Activation with 3D effects
function activateTimelineItem(index) {
  const items = document.querySelectorAll('.timeline-item');
  const phone = document.querySelector('.phone-visual');
  
  items.forEach((item, i) => {
    const isActive = i === index;
    gsap.to(item, {
      opacity: isActive ? 1 : 0.5,
      scale: isActive ? 1 : 0.95,
      duration: 0.6,
      ease: ANIMATION_CONFIG.transitions.springy
    });
  });
  
  if (phone) {
    gsap.to(phone, {
      rotationY: index * 360 / items.length,
      duration: 1,
      ease: ANIMATION_CONFIG.transitions.smooth,
      force3D: true
    });
  }
}

// Enhanced Noise Meter Animation
function initNoiseMeter() {
  const meter = document.querySelector('.noise-meter');
  
  if (!meter) return;
  
  const needle = meter.querySelector('.meter-needle');
  if (needle) {
    gsap.to(needle, {
      rotation: "random(-60, 60)",
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      force3D: true
    });
  }
  
  const glow = meter.querySelector('.meter-glow');
  if (glow) {
    gsap.to(glow, {
      opacity: "random(0.3, 1)",
      scale: "random(0.95, 1.05)",
      duration: "random(0.5, 1.5)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      force3D: true
    });
  }
}

// Optimized Text Splitting
function splitText(element = null) {
  const elements = element ? [element] : document.querySelectorAll('[data-split]');
  
  elements.forEach(element => {
    const type = element.dataset.split || 'chars';
    const text = element.textContent.trim();
    let result;
    
    if (type === 'chars') {
      result = text.split('').map(char => 
        `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
    } else if (type === 'words') {
      result = text.split(' ').map(word => 
        `<span class="word">${word}</span>`
      ).join(' ');
    }
    
    element.innerHTML = result;
    element.style.opacity = 1; // Show text after splitting
  });
}

// Initialize with performance monitoring and error handling
document.addEventListener('DOMContentLoaded', () => {
  const startTime = performance.now();
  
  try {
    initAnimations();
    
    if (document.querySelector('.noise-meter')) {
      initNoiseMeter();
    }
    
    const endTime = performance.now();
    console.log(`✨ Animations initialized in ${Math.round(endTime - startTime)}ms`);
  } catch (error) {
    console.error('Animation initialization error:', error);
  }
}); 