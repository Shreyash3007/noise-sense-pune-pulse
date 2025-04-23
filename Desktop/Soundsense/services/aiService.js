/**
 * AI Service Module - NoiseSense Application
 * Handles processing of user messages and AI responses
 * Currently using mock responses, but designed for easy integration with actual AI services
 */

// Import future dependencies (commented out until needed)
// const axios = require('axios'); // For making HTTP requests to AI APIs

// Simulated conversation context to maintain some state between messages
const conversationContexts = new Map();

// Configuration for future AI integration
const AI_CONFIG = {
  model: process.env.AI_MODEL || 'gpt-3.5-turbo', // Example for future OpenAI integration
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '150'),
  contextWindow: parseInt(process.env.AI_CONTEXT_WINDOW || '10'), // Number of messages to keep in context
  provider: process.env.AI_PROVIDER || 'mock', // 'mock', 'openai', etc.
  timeout: parseInt(process.env.AI_TIMEOUT || '5000') // Timeout in ms
};

/**
 * Process a user message and return an AI response
 * @param {string} message - The user's message
 * @param {string} userId - Unique identifier for the user (for context tracking)
 * @returns {Promise<object>} - Promise resolving to the AI response
 * @throws {Error} - If message processing fails
 */
async function processMessage(message, userId = 'anonymous') {
  // Input validation
  if (!message || typeof message !== 'string') {
    throw new Error('Message must be a non-empty string');
  }
  
  if (message.length > 500) {
    throw new Error('Message too long (max 500 characters)');
  }
  
  try {
    // Get or create user context
    const userContext = getUserContext(userId);
    
    // Add user message to context
    addMessageToContext(userContext, 'user', message);
    
    // Generate response based on configured provider
    let response;
    
    switch (AI_CONFIG.provider) {
      case 'openai':
        // Placeholder for future OpenAI integration
        // response = await callOpenAI(message, userContext);
        console.warn('OpenAI integration not implemented yet, falling back to mock response');
        response = await generateMockResponse(message, userContext);
        break;
        
      // Add more providers as needed
      // case 'azure':
      //   response = await callAzureAI(message, userContext);
      //   break;
        
      case 'mock':
      default:
        response = await generateMockResponse(message, userContext);
        break;
    }
    
    // Add AI response to context
    addMessageToContext(userContext, 'assistant', response.text);
    
    return response;
  } catch (error) {
    console.error('Error processing message:', error);
    
    // Clean up the context if processing failed
    pruneOldContexts();
    
    // Rethrow with a user-friendly message but preserve the original error
    const userError = new Error('Failed to process your message');
    userError.originalError = error;
    userError.code = error.code || 'PROCESSING_ERROR';
    throw userError;
  }
}

/**
 * Get or create a conversation context for a user
 * @param {string} userId - Unique identifier for the user
 * @returns {object} - User's conversation context
 */
function getUserContext(userId) {
  if (!conversationContexts.has(userId)) {
    conversationContexts.set(userId, {
      messages: [],
      lastInteraction: Date.now(),
      metadata: {
        noiseContext: null,
        locationData: null
      }
    });
  }
  
  const context = conversationContexts.get(userId);
  context.lastInteraction = Date.now();
  
  return context;
}

/**
 * Add a message to the user's conversation context
 * @param {object} context - User's conversation context
 * @param {string} role - Message role ('user' or 'assistant')
 * @param {string} content - Message content
 */
function addMessageToContext(context, role, content) {
  if (!context || !content) return;
  
  if (role !== 'user' && role !== 'assistant') {
    console.warn(`Invalid role: ${role}. Using 'user' as default.`);
    role = 'user';
  }
  
  context.messages.push({
    role,
    content,
    timestamp: Date.now()
  });
  
  // Maintain context window size
  if (context.messages.length > AI_CONFIG.contextWindow) {
    context.messages = context.messages.slice(-AI_CONFIG.contextWindow);
  }
}

/**
 * Generate a mock response to the user's message
 * This is a temporary implementation that will be replaced with actual AI integration
 * @param {string} message - The user's message
 * @param {object} context - User's conversation context
 * @returns {Promise<object>} - Promise resolving to the AI response
 */
async function generateMockResponse(message, context) {
  // Add timeout protection to simulate real API behavior
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), AI_CONFIG.timeout);
  });
  
  const responsePromise = new Promise(async (resolve) => {
    // Simulate AI processing time (200-700ms)
    const processingTime = Math.floor(Math.random() * 500) + 200;
    await new Promise(waitResolve => setTimeout(waitResolve, processingTime));
    
    // Mock response based on message content
    let responseText = '';
    let responseType = 'general';
    
    // Simple keyword-based response generation
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('noise') || lowerMessage.includes('sound')) {
      responseText = getNoiseRelatedResponse(lowerMessage);
      responseType = 'noise_info';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      responseText = "Hello! I'm your NoiseSense AI assistant. How can I help you with noise monitoring today?";
      responseType = 'greeting';
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('capabilities') || lowerMessage.includes('what can you do')) {
      responseText = "NoiseSense can help you track noise levels, visualize noise data, and understand the impact of noise pollution. You can measure sound levels, view historical data, and get recommendations for healthier sound environments.";
      responseType = 'features';
    } else if (lowerMessage.includes('thank')) {
      responseText = "You're welcome! If you have any other questions about NoiseSense, feel free to ask.";
      responseType = 'gratitude';
    } else if (lowerMessage.includes('help')) {
      responseText = "I can help with noise monitoring, data interpretation, and providing information about noise pollution. What specific assistance do you need?";
      responseType = 'help';
    } else if (lowerMessage.includes('error') || lowerMessage.includes('not working')) {
      responseText = "I'm sorry to hear you're experiencing an issue. Could you provide more details about the problem you're facing with NoiseSense?";
      responseType = 'troubleshooting';
    } else {
      // Check if this might be a follow-up question
      if (context.messages.length > 1) {
        const lastBotMessage = context.messages
          .filter(msg => msg.role === 'assistant')
          .pop();
        
        if (lastBotMessage && lastBotMessage.content.includes('noise')) {
          responseText = "Noise pollution can affect your health in various ways. Would you like to know more about a specific aspect of noise pollution?";
          responseType = 'follow_up';
        } else {
          responseText = "I'm here to help with your noise monitoring needs. Could you clarify how I can assist you with NoiseSense?";
          responseType = 'general';
        }
      } else {
        responseText = "I'm here to help with your noise monitoring needs. Could you clarify how I can assist you with NoiseSense?";
        responseType = 'general';
      }
    }
    
    resolve({
      text: responseText,
      type: responseType,
      timestamp: Date.now(),
      model: "mock-model"
    });
  });
  
  // Race between timeout and response to ensure we don't hang
  return Promise.race([responsePromise, timeoutPromise]);
}

/**
 * Generate noise-related responses
 * @param {string} message - Lowercase user message
 * @returns {string} - Noise-related response
 */
function getNoiseRelatedResponse(message) {
  if (message.includes('level') || message.includes('measurement') || message.includes('decibel')) {
    return "Noise levels are measured in decibels (dB). Regular exposure to sounds above 85dB can cause hearing damage. The NoiseSense app can help you monitor these levels in your environment.";
  } else if (message.includes('health') || message.includes('effect') || message.includes('impact')) {
    return "Noise pollution can have serious health effects including stress, sleep disturbance, cardiovascular issues, and cognitive impairment. NoiseSense helps you identify harmful noise levels to protect your health.";
  } else if (message.includes('reduce') || message.includes('lower') || message.includes('minimize')) {
    return "To reduce noise exposure, you can use sound-absorbing materials, white noise machines, noise-canceling headphones, or modify your space layout. The NoiseSense app can recommend specific solutions based on your measurements.";
  } else {
    return "Noise pollution is unwanted sound that can affect health and quality of life. With NoiseSense, you can measure and track noise levels in your environment to better understand your exposure.";
  }
}

/**
 * Removes old conversation contexts to manage memory usage
 * Contexts older than 24 hours will be removed
 */
function pruneOldContexts() {
  const now = Date.now();
  const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  for (const [userId, context] of conversationContexts.entries()) {
    if (now - context.lastInteraction > expiryTime) {
      conversationContexts.delete(userId);
    }
  }
}

/**
 * Placeholder for future OpenAI integration
 * @param {string} message - The user's message
 * @param {object} context - User's conversation context
 * @returns {Promise<object>} - Promise resolving to the AI response
 */
// async function callOpenAI(message, context) {
//   // This will be implemented when integrating with OpenAI
//   throw new Error('OpenAI integration not implemented yet');
// }

// Schedule regular pruning of old contexts
setInterval(pruneOldContexts, 60 * 60 * 1000); // Run every hour

// Export the module
module.exports = {
  processMessage,
  clearUserContext: (userId) => conversationContexts.delete(userId),
  // For testing and administration
  getStats: () => ({
    activeContexts: conversationContexts.size,
    configuration: { ...AI_CONFIG, apiKey: AI_CONFIG.apiKey ? '***' : undefined }
  })
}; 