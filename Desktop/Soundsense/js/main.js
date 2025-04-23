// NoiseSense - Main JavaScript
// Version: 1.1.0
// Dependencies: GSAP, ScrollTrigger, Lottie

/**
 * Configuration object for centralized settings management
 * Makes it easier to modify app-wide parameters in one place
 */
const CONFIG = {
  selectors: {
    themeToggle: '#theme-toggle',
    aiChatToggle: '#ai-chat-toggle',
    navLinks: 'a[href^="#"]',
    sections: 'section[id]',
    heroContent: '.hero-content',
    stepsAnimation: '.step-item',
    sectionTitles: '.section-title, .section-subtitle',
    lottieContainer: '#timeline-lottie',
    loader: '.page-loader'
  },
  animations: {
    scrollDebounce: 100,
    headerOffset: 80,
    chatLoadingTime: 1500
  },
  storage: {
    themeKey: 'noisesense-theme'
  },
  api: {
    baseUrl: '/api',
    theme: '/api/theme',
    health: '/api/health'
  }
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Remove page loader after content is loaded
  const loader = document.querySelector(CONFIG.selectors.loader);
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }, 800);
  }
  
  // Initialize all components
  initThemeToggle();
  initScrollAnimations();
  initLottieAnimations();
  initAIChat();
  initSmoothScroll();
  
  // Update copyright year automatically
  updateCopyrightYear();
});

/**
 * Theme Toggle Functionality
 * Switches between light and dark themes with localStorage persistence
 * Includes accessibility attributes and respects user preferences
 * Now with API integration
 */
function initThemeToggle() {
  const themeToggle = document.getElementById(CONFIG.selectors.themeToggle.substring(1));
  if (!themeToggle) return;
  
  const htmlElement = document.documentElement;
  
  // Generate a unique ID for the current user or use an existing one
  let userId = localStorage.getItem('noisesense-user-id');
  if (!userId) {
    userId = 'user_' + Date.now() + Math.floor(Math.random() * 1000);
    localStorage.setItem('noisesense-user-id', userId);
  }
  
  // First try to get theme from server
  fetchThemeFromServer(userId)
    .then(serverTheme => {
      if (serverTheme) {
        applyTheme(serverTheme);
      } else {
        // Fallback to local preferences if server fails
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem(CONFIG.storage.themeKey);
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        applyTheme(initialTheme);
      }
    })
    .catch(error => {
      // Handle error and fallback to local storage
      console.warn('Failed to fetch theme from server:', error);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem(CONFIG.storage.themeKey);
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
      applyTheme(initialTheme);
    });
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(CONFIG.storage.themeKey)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply theme locally
    applyTheme(newTheme);
    localStorage.setItem(CONFIG.storage.themeKey, newTheme);
    
    // Save theme to server
    saveThemeToServer(userId, newTheme)
      .catch(error => {
        console.warn('Failed to save theme to server:', error);
        // Theme already applied locally, so no need for fallback action
      });
  });
  
  // Helper function to apply theme and update accessibility attributes
  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-pressed', theme === 'dark');
    
    // Update screen reader text
    const srElement = themeToggle.querySelector('.sr-only');
    if (srElement) {
      srElement.textContent = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;
    }
  }
  
  /**
   * Fetch user theme from server
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} - Theme name or null if not found
   */
  async function fetchThemeFromServer(userId) {
    try {
      const response = await fetch(`${CONFIG.api.theme}?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
      const data = await response.json();
      if (data.success && data.data && data.data.theme) {
        return data.data.theme;
      }
      return null;
    } catch (error) {
      console.error('Error fetching theme:', error);
      return null;
    }
  }
  
  /**
   * Save user theme to server
   * @param {string} userId - User ID
   * @param {string} theme - Theme name
   * @returns {Promise<boolean>} - Success status
   */
  async function saveThemeToServer(userId, theme) {
    try {
      const response = await fetch(CONFIG.api.theme, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          theme
        })
      });
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Error saving theme:', error);
      return false;
    }
  }
}

/**
 * ScrollTrigger Animations
 * Handles scroll-based animations using GSAP with Intersection Observer
 * for better performance than traditional scroll events
 */
function initScrollAnimations() {
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);
  
  // Hero section parallax effect
  gsap.from(CONFIG.selectors.heroContent, {
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top 80%',
      end: 'top 40%',
      scrub: true
    }
  });
  
  // Step items entrance animation
  gsap.from(CONFIG.selectors.stepsAnimation, {
    opacity: 0,
    y: 50,
    stagger: 0.15,
    duration: 0.8,
    scrollTrigger: {
      trigger: '.steps-container',
      start: 'top 80%'
    }
  });
  
  // Measure teaser section animation with enhanced toggle actions
  gsap.from(CONFIG.selectors.sectionTitles, {
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 0.8,
    scrollTrigger: {
      trigger: '.measure-teaser',
      start: 'top 70%',
      toggleActions: 'play pause resume reset'
    }
  });
  
  // Use Intersection Observer for active navigation instead of scroll events
  initNavHighlightWithIntersectionObserver();
}

/**
 * Uses Intersection Observer API to highlight active nav sections
 * Much more performant than scroll event listeners
 */
function initNavHighlightWithIntersectionObserver() {
  const sections = document.querySelectorAll(CONFIG.selectors.sections);
  
  if (!sections.length) return;
  
  const navMap = Array.from(sections).reduce((map, section) => {
    const id = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href*="#${id}"]`);
    if (navLink) map.set(section, navLink);
    return map;
  }, new Map());
  
  const observerOptions = {
    root: null, // viewport
    rootMargin: '-20% 0px -70% 0px', // consider element in middle ~30% of viewport
    threshold: 0
  };
  
  const observerCallback = (entries) => {
    entries.forEach(entry => {
      const navLink = navMap.get(entry.target);
      if (!navLink) return;
      
      if (entry.isIntersecting) {
        // Remove active class from all links before setting the new active one
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        navLink.classList.add('active');
      }
    });
  };
  
  const observer = new IntersectionObserver(observerCallback, observerOptions);
  
  // Observe all sections
  sections.forEach(section => {
    if (navMap.has(section)) {
      observer.observe(section);
    }
  });
}

/**
 * Lottie Animations
 * Handles Lottie animations including scroll-triggered playback
 * With error handling and performance optimization
 */
function initLottieAnimations() {
  // Ensure Lottie library exists
  if (typeof lottie === 'undefined') {
    console.warn('Lottie library not loaded. Skipping animations.');
    return;
  }
  
  // Placeholder for phone mockup animation
  const phoneMockupContainer = document.getElementById(CONFIG.selectors.lottieContainer.substring(1));
  
  if (!phoneMockupContainer) return;
  
  // Add loading state
  phoneMockupContainer.classList.add('loading');
  
  // Initialize Lottie animation with error handling
  try {
    const phoneMockupAnim = lottie.loadAnimation({
      container: phoneMockupContainer,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'assets/lottie/phone-mockup.json',
      rendererSettings: {
        progressiveLoad: true, // Improves initial loading performance
        hideOnTransparent: true // Better performance
      }
    });
    
    // Handle animation load error
    phoneMockupAnim.addEventListener('data_failed', () => {
      console.error('Failed to load Lottie animation');
      phoneMockupContainer.classList.remove('loading');
      phoneMockupContainer.classList.add('error');
      phoneMockupContainer.innerHTML = '<p>Animation failed to load</p>';
    });
    
    // Handle animation load success
    phoneMockupAnim.addEventListener('data_ready', () => {
      phoneMockupContainer.classList.remove('loading');
      
      // Create ScrollTrigger for the Lottie animation
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: 'bottom center',
        scrub: true,
        onUpdate: (self) => {
          // Use requestAnimationFrame for smoother animation updates
          requestAnimationFrame(() => {
            // Calculate frame based on scroll progress
            const scrollProgress = self.progress;
            const totalFrames = phoneMockupAnim.totalFrames;
            const currentFrame = Math.floor(scrollProgress * totalFrames);
            
            // Update animation frame
            phoneMockupAnim.goToAndStop(currentFrame, true);
          });
        }
      });
    });
  } catch (error) {
    console.error('Error initializing Lottie animation:', error);
    phoneMockupContainer.classList.remove('loading');
    phoneMockupContainer.classList.add('error');
  }
}

/**
 * AI Chat Functionality
 * Initializes the AI chat assistant with visual feedback and accessibility
 */
function initAIChat() {
  const aiChatToggle = document.getElementById(CONFIG.selectors.aiChatToggle.substring(1));
  
  if (!aiChatToggle) return;
  
  // Create a simulated chat component (to be replaced with real implementation)
  let chatInitialized = false;
  let chatVisible = false;
  
  aiChatToggle.addEventListener('click', () => {
    // Don't allow multiple clicks while loading
    if (aiChatToggle.classList.contains('loading')) return;
    
    // If chat is already initialized, toggle visibility instead of reloading
    if (chatInitialized) {
      toggleChatVisibility();
      return;
    }
    
    // Store original content to restore later
    const originalContent = aiChatToggle.innerHTML;
    
    // Show loading state in button
    aiChatToggle.innerHTML = `
      <span aria-hidden="true" class="loading-spinner">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
      <span class="sr-only">Loading AI assistant...</span>
    `;
    aiChatToggle.classList.add('loading');
    aiChatToggle.setAttribute('aria-busy', 'true');
    
    // Simulate loading (replace with actual chat initialization in production)
    setTimeout(() => {
      // Restore original content with updated aria attributes
      aiChatToggle.innerHTML = originalContent;
      aiChatToggle.classList.remove('loading');
      aiChatToggle.setAttribute('aria-busy', 'false');
      aiChatToggle.setAttribute('aria-expanded', 'true');
      
      // Mark as initialized
      chatInitialized = true;
      chatVisible = true;
      
      // Here you would typically launch the actual chat interface
      console.log('AI Chat Assistant launched');
      
      // In a real implementation, create and show the chat interface
      simulateChatInterface();
    }, CONFIG.animations.chatLoadingTime);
  });
  
  // Toggle chat visibility function
  function toggleChatVisibility() {
    chatVisible = !chatVisible;
    aiChatToggle.setAttribute('aria-expanded', chatVisible.toString());
    
    // In a real implementation, show/hide the chat interface
    console.log(chatVisible ? 'Showing chat' : 'Hiding chat');
  }
  
  // Placeholder for actual chat implementation
  function simulateChatInterface() {
    // This would be replaced with actual chat UI creation
  }
}

/**
 * Smooth Scroll for Navigation Links
 * Provides smooth scrolling to anchor links with header offset
 * Uses event delegation for better performance
 */
function initSmoothScroll() {
  // Use event delegation instead of attaching to each link
  document.addEventListener('click', (e) => {
    // Check if click was on an anchor link
    const anchor = e.target.closest('a[href^="#"]');
    
    if (!anchor) return;
    
    e.preventDefault();
    
    const targetId = anchor.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      // Calculate offset considering sticky headers or other elements
      const headerOffset = CONFIG.animations.headerOffset;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update URL without scrolling (browser history)
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    }
  });
}

/**
 * Updates the copyright year automatically
 */
function updateCopyrightYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }
} 