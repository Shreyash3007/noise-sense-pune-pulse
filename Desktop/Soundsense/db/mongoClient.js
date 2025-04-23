/**
 * NoiseSense - MongoDB Atlas Connection Client
 */

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { MONGODB_URI, DB_NAME, CONNECTION_OPTIONS } = require('../mongovars');

// Connection metrics for monitoring
const connectionMetrics = {
  attempts: 0,
  successes: 0,
  failures: 0,
  lastConnected: null,
  lastError: null,
  isConnected: false
};

let client = null;
let db = null;

/**
 * Connect to MongoDB Atlas
 * @returns {Promise<object>} MongoDB database connection
 */
const connectToDatabase = async () => {
  if (db) return db;

  try {
    connectionMetrics.attempts++;
    
    // Use URI from mongovars.js
    const uri = MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI is not configured');
    }

    // Use connection options from mongovars.js
    client = new MongoClient(uri, CONNECTION_OPTIONS);
    await client.connect();
    
    db = client.db(DB_NAME);
    
    // Add connection event listeners
    client.on('connectionPoolCreated', (event) => {
      console.log('MongoDB connection pool created');
    });

    client.on('connectionPoolClosed', (event) => {
      console.log('MongoDB connection pool closed');
    });

    // Ping to confirm connection
    await client.db("admin").command({ ping: 1 });
    
    console.log("Connected successfully to MongoDB Atlas");
    
    // Update connection metrics
    connectionMetrics.successes++;
    connectionMetrics.lastConnected = new Date();
    connectionMetrics.isConnected = true;
    connectionMetrics.lastError = null;
    
    return db;
  } catch (error) {
    // Update failure metrics
    connectionMetrics.failures++;
    connectionMetrics.lastError = {
      message: error.message,
      time: new Date(),
      code: error.code || 'UNKNOWN'
    };
    connectionMetrics.isConnected = false;
    
    console.error("MongoDB Connection Error:", error);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
};

/**
 * Get connection metrics and status
 * @returns {Object} Connection metrics and status
 */
function getConnectionMetrics() {
  return {
    ...connectionMetrics,
    uptime: connectionMetrics.lastConnected 
      ? Math.floor((new Date() - connectionMetrics.lastConnected) / 1000) 
      : 0
  };
}

/**
 * Close MongoDB connection
 * @returns {Promise<void>}
 */
const closeConnection = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    connectionMetrics.isConnected = false;
    console.log("MongoDB connection closed");
  }
};

/**
 * Test database connection and report on available collections
 * @returns {Promise<{success: boolean, collections?: string[], error?: string}>}
 */
async function testConnection() {
  try {
    const db = await connectToDatabase();
    const collections = await db.listCollections().toArray();
    
    console.log(`Successfully connected to MongoDB Atlas`);
    console.log(`Available collections: ${collections.map(c => c.name).join(', ') || 'None yet'}`);
    
    return {
      success: true,
      collections: collections.map(c => c.name)
    };
  } catch (error) {
    console.error("Test connection failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export functions and client
module.exports = {
  connectToDatabase,
  getConnectionMetrics,
  closeConnection,
  testConnection,
  client, // Exposed for advanced use cases
  ObjectId, // Export ObjectId for use in models
  getDb: () => {
    if (!db) {
      throw new Error('Database not initialized. Call connectToDatabase() first.');
    }
    return db;
  }
}; 