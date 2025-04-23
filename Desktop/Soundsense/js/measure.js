// NoiseSense - Measuring Interface
class MeasuringInterface {
  constructor() {
    this.currentStage = 0;
    this.stages = document.querySelectorAll('.measure-stage');
    this.progressBar = document.querySelector('.progress-bar');
    this.noiseMeter = null;
    this.map = null;
    
    this.init();
  }
  
  init() {
    this.setupScrollTrigger();
    this.setupLocationStage();
    this.setupMeasuringStage();
    this.setupSourceSelection();
    this.setupProgressBar();
  }
  
  setupScrollTrigger() {
    this.stages.forEach((stage, index) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => this.activateStage(index),
          onEnterBack: () => this.activateStage(index),
          onLeave: () => this.deactivateStage(index),
          onLeaveBack: () => this.deactivateStage(index)
        }
      });
    });
  }
  
  setupLocationStage() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;
    
    // Initialize map (replace with your preferred map library)
    this.initMap(mapContainer);
    
    // Add entrance animation
    gsap.from(mapContainer, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: mapContainer,
        start: 'top 80%'
      }
    });
  }
  
  setupMeasuringStage() {
    const meterContainer = document.querySelector('.meter-container');
    if (!meterContainer) return;
    
    // Initialize noise meter
    this.noiseMeter = new NoiseMeter(meterContainer, {
      minDb: 30,
      maxDb: 120,
      warningLevel: 85,
      dangerLevel: 100
    });
    
    // Add entrance animation
    gsap.from(meterContainer, {
      opacity: 0,
      scale: 0.9,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: meterContainer,
        start: 'top 80%'
      }
    });
  }
  
  setupSourceSelection() {
    const sourceCards = document.querySelectorAll('.source-card');
    
    sourceCards.forEach((card, index) => {
      // Add entrance animation
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: index * 0.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%'
        }
      });
      
      // Add click handler
      card.addEventListener('click', () => {
        sourceCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        // Add selection animation
        gsap.to(card, {
          scale: 1.05,
          duration: 0.3,
          ease: 'back.out(1.7)'
        });
      });
    });
  }
  
  setupProgressBar() {
    gsap.to(this.progressBar, {
      scaleX: 1,
      duration: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.measure-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });
  }
  
  activateStage(index) {
    const stage = this.stages[index];
    if (!stage) return;
    
    // Update current stage
    this.currentStage = index;
    
    // Add active class
    stage.classList.add('active');
    
    // Activate stage content
    const content = stage.querySelector('.stage-content');
    if (content) {
      content.classList.add('active');
    }
    
    // Start measuring if on measuring stage
    if (index === 1 && this.noiseMeter) {
      this.noiseMeter.startRandomAnimation();
    }
    
    // Update progress
    this.updateProgress();
  }
  
  deactivateStage(index) {
    const stage = this.stages[index];
    if (!stage) return;
    
    // Remove active class
    stage.classList.remove('active');
    
    // Deactivate stage content
    const content = stage.querySelector('.stage-content');
    if (content) {
      content.classList.remove('active');
    }
    
    // Stop measuring if leaving measuring stage
    if (index === 1 && this.noiseMeter) {
      this.noiseMeter.stop();
    }
  }
  
  updateProgress() {
    const progress = (this.currentStage + 1) / this.stages.length;
    gsap.to(this.progressBar, {
      scaleX: progress,
      duration: 0.5,
      ease: 'power2.out'
    });
  }
  
  initMap(container) {
    // Initialize map with your preferred library
    // This is a placeholder - replace with actual map implementation
    console.log('Map initialization would go here');
    
    // Example: Add map placeholder
    container.innerHTML = `
      <div class="map-placeholder" style="
        width: 100%;
        height: 100%;
        background: var(--color-bg-tertiary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-mono);
        color: var(--color-text-secondary);
      ">
        Map Placeholder
      </div>
    `;
  }
}

// Initialize measuring interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MeasuringInterface();
}); 