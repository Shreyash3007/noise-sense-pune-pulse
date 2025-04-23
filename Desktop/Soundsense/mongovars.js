/**
 * NoiseSense - MongoDB Environment Variables
 * This file extracts MongoDB credentials from environment variables
 * or uses fallbacks for development.
 */

// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// MongoDB Configuration
module.exports = {
  // Connection string for MongoDB Atlas
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://shreyash04553:shreyash04553@cluster0.fkfchvz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  
  // Database name
  DB_NAME: process.env.DB_NAME || 'noisesense',
  
  // Connection options
  CONNECTION_OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: process.env.MONGO_POOL_SIZE ? parseInt(process.env.MONGO_POOL_SIZE) : 10,
    connectTimeoutMS: process.env.MONGO_CONNECT_TIMEOUT ? parseInt(process.env.MONGO_CONNECT_TIMEOUT) : 5000,
    socketTimeoutMS: process.env.MONGO_SOCKET_TIMEOUT ? parseInt(process.env.MONGO_SOCKET_TIMEOUT) : 30000
  },
  
  // Collection names
  COLLECTIONS: {
    USERS: 'users',
    THEMES: 'themes'
  }
}; 