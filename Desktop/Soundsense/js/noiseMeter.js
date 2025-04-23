// NoiseSense - Noise Meter Visualization
// Dependencies: GSAP

class NoiseMeter {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      minDb: 30,
      maxDb: 120,
      warningLevel: 85,
      dangerLevel: 100,
      updateInterval: 100,
      smoothingFactor: 0.8,
      ...options
    };
    
    this.currentValue = 0;
    this.targetValue = 0;
    this.isAnimating = false;
    
    this.audioContext = null;
    this.mediaStream = null;
    this.analyser = null;
    this.dataArray = null;
    this.isRecording = false;
    this.animationFrame = null;
    this.meterElement = document.getElementById('noise-meter');
    this.valueElement = document.getElementById('noise-value');
    this.startButton = document.getElementById('start-measure');
    this.stopButton = document.getElementById('stop-measure');
    
    // Bind methods
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.updateMeter = this.updateMeter.bind(this);
    
    this.init();
  }
  
  async init() {
    try {
      // Check for browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio input is not supported in this browser');
      }
      
      // Setup event listeners
      if (this.startButton) {
        this.startButton.addEventListener('click', this.startRecording);
      }
      if (this.stopButton) {
        this.stopButton.addEventListener('click', this.stopRecording);
      }
      
      // Initialize audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      this.createMeterElements();
      this.initializeGSAP();
      this.setupEventListeners();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Could not initialize audio system');
    }
  }
  
  createMeterElements() {
    // Create SVG container
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("viewBox", "0 0 200 200");
    this.svg.classList.add("noise-meter-svg");
    
    // Create meter background
    this.background = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.background.classList.add("meter-background");
    
    // Create meter needle
    this.needle = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.needle.classList.add("meter-needle");
    
    // Create value display
    this.valueDisplay = document.createElement("div");
    this.valueDisplay.classList.add("meter-value");
    
    // Create level indicator
    this.levelIndicator = document.createElement("div");
    this.levelIndicator.classList.add("meter-level");
    
    // Append elements
    this.svg.appendChild(this.background);
    this.svg.appendChild(this.needle);
    this.container.appendChild(this.svg);
    this.container.appendChild(this.valueDisplay);
    this.container.appendChild(this.levelIndicator);
    
    // Add gradient definitions
    this.addGradients();
  }
  
  addGradients() {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // Create gradient for meter background
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", "meter-gradient");
    gradient.setAttribute("gradientUnits", "userSpaceOnUse");
    
    const stops = [
      { offset: "0%", color: "#10b981" },    // Safe level
      { offset: "60%", color: "#f59e0b" },   // Warning level
      { offset: "80%", color: "#ef4444" }    // Danger level
    ];
    
    stops.forEach(stop => {
      const element = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      element.setAttribute("offset", stop.offset);
      element.setAttribute("stop-color", stop.color);
      gradient.appendChild(element);
    });
    
    defs.appendChild(gradient);
    this.svg.appendChild(defs);
  }
  
  initializeGSAP() {
    // Create needle animation
    this.needleAnimation = gsap.to(this.needle, {
      rotation: 0,
      transformOrigin: "center bottom",
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
      paused: true
    });
    
    // Create glow animation
    this.glowAnimation = gsap.to(this.container, {
      boxShadow: "0 0 30px rgba(239, 68, 68, 0.5)",
      duration: 0.3,
      paused: true
    });
  }
  
  setupEventListeners() {
    // Add resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.updateMeterDimensions();
    });
    
    resizeObserver.observe(this.container);
  }
  
  updateMeterDimensions() {
    const { width, height } = this.container.getBoundingClientRect();
    const radius = Math.min(width, height) * 0.4;
    
    // Update meter arc
    const startAngle = -120;
    const endAngle = 120;
    const arcPath = this.describeArc(100, 100, radius, startAngle, endAngle);
    this.background.setAttribute("d", arcPath);
    
    // Update needle position
    this.needle.setAttribute("x1", "100");
    this.needle.setAttribute("y1", "100");
    this.needle.setAttribute("x2", "100");
    this.needle.setAttribute("y2", 100 - radius);
  }
  
  describeArc(x, y, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }
  
  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  
  async startRecording() {
    try {
      if (this.isRecording) return;
      
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });
      
      // Create audio nodes
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      // Connect nodes
      source.connect(this.analyser);
      
      // Setup data array for analysis
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      // Start measuring
      this.isRecording = true;
      this.updateMeter();
      
      // Update UI
      if (this.startButton) this.startButton.disabled = true;
      if (this.stopButton) this.stopButton.disabled = false;
      
    } catch (error) {
      console.error('Recording error:', error);
      this.showError('Could not access microphone');
    }
  }
  
  stopRecording() {
    if (!this.isRecording) return;
    
    // Stop all tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    
    // Cancel animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Reset state
    this.isRecording = false;
    this.mediaStream = null;
    
    // Update UI
    if (this.startButton) this.startButton.disabled = false;
    if (this.stopButton) this.stopButton.disabled = true;
    if (this.valueElement) this.valueElement.textContent = '0';
    if (this.meterElement) this.meterElement.style.setProperty('--level', '0%');
  }
  
  updateMeter() {
    if (!this.isRecording) return;
    
    // Get current volume level
    this.analyser.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((acc, val) => acc + val, 0) / this.dataArray.length;
    const normalizedValue = Math.min(100, (average / 255) * 100);
    
    // Update UI
    if (this.valueElement) {
      this.valueElement.textContent = Math.round(normalizedValue);
    }
    if (this.meterElement) {
      this.meterElement.style.setProperty('--level', `${normalizedValue}%`);
      
      // Update meter color based on level
      if (normalizedValue < 30) {
        this.meterElement.className = 'meter-low';
      } else if (normalizedValue < 70) {
        this.meterElement.className = 'meter-medium';
      } else {
        this.meterElement.className = 'meter-high';
      }
    }
    
    // Continue measuring
    this.animationFrame = requestAnimationFrame(this.updateMeter);
  }
  
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    if (this.meterElement) {
      this.meterElement.appendChild(errorElement);
    }
    
    // Disable controls
    if (this.startButton) this.startButton.disabled = true;
    if (this.stopButton) this.stopButton.disabled = true;
  }
}

// Create and export instance
const noiseMeter = new NoiseMeter();
export default noiseMeter; 