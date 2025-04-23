/**
 * Theme Service for NoiseSense
 * Manages user theme preferences with MongoDB integration
 */

const Theme = require('../models/Theme');

// Constants
const CONFIG = {
  // Cache settings
  CACHE: {
    ENABLED: true,
    MAX_SIZE: 500,             // Maximum number of items in cache
    TTL: 1000 * 60 * 60 * 24,  // Cache TTL: 24 hours
    CLEANUP_INTERVAL: 1000 * 60 * 30 // Cleanup every 30 minutes
  },
  
  // Retry settings for database operations
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 300,
    MAX_DELAY: 3000
  },
  
  // Logging configuration
  LOGGING: {
    ENABLED: true,
    ERROR_LEVEL: true,
    WARN_LEVEL: true,
    INFO_LEVEL: process.env.NODE_ENV !== 'production',
    DEBUG_LEVEL: process.env.NODE_ENV === 'development'
  }
};

// In-memory cache for theme preferences
const themeCache = new Map();
let lastCacheCleanup = Date.now();
let isCacheInitialized = false;

// Cache statistics for monitoring
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  evictions: 0,
  cleanups: 0,
  size: 0
};

/**
 * Logs a message with the specified level
 * @param {string} level - Log level ('error', 'warn', 'info', 'debug')
 * @param {string} message - Message to log
 * @param {Object} [data] - Optional data to include
 */
function log(level, message, data = null) {
  if (!CONFIG.LOGGING.ENABLED) return;
  
  const levelEnabled = CONFIG.LOGGING[`${level.toUpperCase()}_LEVEL`];
  if (!levelEnabled) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[ThemeService][${timestamp}][${level.toUpperCase()}]`;
  
  if (data) {
    if (level === 'error') {
      console.error(prefix, message, data);
    } else if (level === 'warn') {
      console.warn(prefix, message, data);
    } else {
      console.log(prefix, message, data);
    }
  } else {
    if (level === 'error') {
      console.error(prefix, message);
    } else if (level === 'warn') {
      console.warn(prefix, message);
    } else {
      console.log(prefix, message);
    }
  }
}

/**
 * Sanitizes a user ID to be safe for database operations
 * @param {string|number} userId - User ID to sanitize
 * @returns {string} Sanitized user ID
 */
function sanitizeUserId(userId) {
  if (!userId) return '';
  
  // Convert to string and sanitize
  const id = String(userId).trim();
  
  // Allow only alphanumeric characters, dashes, and underscores
  return id.replace(/[^a-zA-Z0-9\-_]/g, '').substring(0, 255);
}

/**
 * Initializes the cache system if not already initialized
 */
function initializeCache() {
  if (isCacheInitialized) return;
  
  if (CONFIG.CACHE.ENABLED) {
    // Set up periodic cache cleanup
    setInterval(() => cleanupCache(), CONFIG.CACHE.CLEANUP_INTERVAL);
    log('info', 'Theme cache initialized with cleanup interval', { 
      interval: CONFIG.CACHE.CLEANUP_INTERVAL,
      maxSize: CONFIG.CACHE.MAX_SIZE,
      ttl: CONFIG.CACHE.TTL 
    });
  } else {
    log('info', 'Theme cache is disabled');
  }
  
  isCacheInitialized = true;
}

/**
 * Cleans up expired cache entries
 */
function cleanupCache() {
  if (!CONFIG.CACHE.ENABLED) return;
  
  const now = Date.now();
  let removedCount = 0;
  
  for (const [key, entry] of themeCache.entries()) {
    if (now - entry.timestamp > CONFIG.CACHE.TTL) {
      themeCache.delete(key);
      removedCount++;
    }
  }
  
  // Update stats
  cacheStats.cleanups++;
  cacheStats.evictions += removedCount;
  cacheStats.size = themeCache.size;
  
  lastCacheCleanup = now;
  
  if (removedCount > 0) {
    log('debug', `Cache cleanup removed ${removedCount} expired entries`, { 
      currentSize: themeCache.size,
      cleanupTime: new Date().toISOString() 
    });
  }
}

/**
 * Gets a value from the cache
 * @param {string} key - Cache key
 * @returns {*|null} Cached value or null if not found
 */
function getCacheValue(key) {
  if (!CONFIG.CACHE.ENABLED) return null;
  
  initializeCache();
  const entry = themeCache.get(key);
  
  if (!entry) {
    cacheStats.misses++;
    return null;
  }
  
  const now = Date.now();
  
  // Check if the entry has expired
  if (now - entry.timestamp > CONFIG.CACHE.TTL) {
    themeCache.delete(key);
    cacheStats.evictions++;
    cacheStats.size = themeCache.size;
    return null;
  }
  
  cacheStats.hits++;
  return entry.value;
}

/**
 * Sets a value in the cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 */
function setCacheValue(key, value) {
  if (!CONFIG.CACHE.ENABLED) return;
  
  initializeCache();
  
  // Check if cache needs cleanup before adding a new entry
  if (themeCache.size >= CONFIG.CACHE.MAX_SIZE) {
    // Use LRU strategy - remove oldest entries first
    const entries = Array.from(themeCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 20% of entries
    const removeCount = Math.ceil(CONFIG.CACHE.MAX_SIZE * 0.2);
    for (let i = 0; i < removeCount && i < entries.length; i++) {
      themeCache.delete(entries[i][0]);
      cacheStats.evictions++;
    }
    
    log('debug', `Cache eviction removed ${removeCount} oldest entries`, { 
      currentSize: themeCache.size,
      evictionTime: new Date().toISOString() 
    });
  }
  
  // Add new entry
  themeCache.set(key, {
    value,
    timestamp: Date.now()
  });
  
  cacheStats.sets++;
  cacheStats.size = themeCache.size;
}

/**
 * Clears the cache for a specific user or all users
 * @param {string|null} userId - User ID to clear cache for, or null for all
 */
function clearCache(userId = null) {
  if (!CONFIG.CACHE.ENABLED) return;
  
  if (userId) {
    const safeUserId = sanitizeUserId(userId);
    const key = `theme_${safeUserId}`;
    
    if (themeCache.has(key)) {
      themeCache.delete(key);
      cacheStats.evictions++;
      cacheStats.size = themeCache.size;
      log('debug', `Cache cleared for user ${safeUserId}`);
    }
  } else {
    const size = themeCache.size;
    themeCache.clear();
    cacheStats.evictions += size;
    cacheStats.size = 0;
    log('debug', `Entire cache cleared (${size} entries)`);
  }
}

/**
 * Executes a database operation with retry logic
 * @param {Function} operation - The operation to execute
 * @param {string} operationName - Name of the operation for logging
 * @returns {Promise<*>} Result of the operation
 */
async function executeWithRetry(operation, operationName) {
  let attempt = 0;
  let lastError = null;
  
  while (attempt < CONFIG.RETRY.MAX_ATTEMPTS) {
    try {
      attempt++;
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Log the error
      log('warn', `Attempt ${attempt}/${CONFIG.RETRY.MAX_ATTEMPTS} for ${operationName} failed`, { 
        error: error.message
      });
      
      // Calculate exponential backoff with jitter
      const delay = Math.min(
        CONFIG.RETRY.INITIAL_DELAY * Math.pow(2, attempt - 1) + Math.random() * 100,
        CONFIG.RETRY.MAX_DELAY
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All attempts failed
  log('error', `All ${CONFIG.RETRY.MAX_ATTEMPTS} attempts for ${operationName} failed`, { 
    error: lastError.message 
  });
  
  throw lastError;
}

/**
 * Gets a user's theme preference
 * @param {string} userId - User ID
 * @param {string} [defaultTheme='light'] - Default theme to use if not found
 * @returns {Promise<string>} Theme preference
 */
async function getUserTheme(userId, defaultTheme = 'light') {
  const safeUserId = sanitizeUserId(userId);
  if (!safeUserId) {
    log('warn', 'getUserTheme called with invalid userId');
    return defaultTheme;
  }
  
  // Check cache first
  const cacheKey = `theme_${safeUserId}`;
  const cachedTheme = getCacheValue(cacheKey);
  
  if (cachedTheme !== null) {
    log('debug', `Theme found in cache for user ${safeUserId}`, { theme: cachedTheme });
    return cachedTheme;
  }
  
  const getData = async () => {
    try {
      const themeData = await Theme.getByUserId(safeUserId);
      
      if (themeData && themeData.theme) {
        // Cache the result
        setCacheValue(cacheKey, themeData.theme);
        log('debug', `Theme loaded from database for user ${safeUserId}`, { theme: themeData.theme });
        return themeData.theme;
      } else {
        // No preference found, use default
        log('debug', `No theme found for user ${safeUserId}, using default`, { defaultTheme });
        return defaultTheme;
      }
    } catch (error) {
      log('error', `Error getting theme for user ${safeUserId}`, { error: error.message });
      throw error;
    }
  };
  
  try {
    return await executeWithRetry(getData, 'getUserTheme');
  } catch (error) {
    // Return default theme on error
    log('error', `Failed to get theme for user ${safeUserId}, using default`, { 
      error: error.message, 
      defaultTheme 
    });
    return defaultTheme;
  }
}

/**
 * Saves a user's theme preference
 * @param {string} userId - User ID
 * @param {string} theme - Theme preference
 * @returns {Promise<boolean>} Success status
 */
async function saveUserTheme(userId, theme) {
  const safeUserId = sanitizeUserId(userId);
  if (!safeUserId) {
    log('warn', 'saveUserTheme called with invalid userId');
    return false;
  }
  
  // Validate theme value
  if (theme !== 'light' && theme !== 'dark') {
    log('warn', `Invalid theme value: ${theme}`, { userId: safeUserId });
    return false;
  }
  
  const saveData = async () => {
    try {
      const result = await Theme.setUserTheme(safeUserId, theme);
      
      if (result) {
        // Update cache
        const cacheKey = `theme_${safeUserId}`;
        setCacheValue(cacheKey, theme);
        
        log('info', `Theme saved for user ${safeUserId}`, { theme });
        return true;
      } else {
        log('error', `Failed to save theme for user ${safeUserId}`, { theme });
        return false;
      }
    } catch (error) {
      log('error', `Error saving theme for user ${safeUserId}`, { 
        error: error.message,
        theme 
      });
      throw error;
    }
  };
  
  try {
    return await executeWithRetry(saveData, 'saveUserTheme');
  } catch (error) {
    log('error', `All attempts to save theme for user ${safeUserId} failed`, { 
      error: error.message 
    });
    return false;
  }
}

/**
 * Gets cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
  return {
    ...cacheStats,
    enabled: CONFIG.CACHE.ENABLED,
    maxSize: CONFIG.CACHE.MAX_SIZE,
    ttl: CONFIG.CACHE.TTL,
    lastCleanup: new Date(lastCacheCleanup).toISOString()
  };
}

module.exports = {
  getUserTheme,
  saveUserTheme,
  clearCache,
  getCacheStats
}; 