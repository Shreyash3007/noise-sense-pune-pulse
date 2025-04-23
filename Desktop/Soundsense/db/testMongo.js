/**
 * NoiseSense - MongoDB Connection Test
 * Run with: node db/testMongo.js
 */

// Replace <password> with your actual password in the mongoClient.js file before running this test
const { testConnection, closeConnection } = require('./mongoClient');

async function runTest() {
  console.log('🔍 Testing MongoDB Atlas connection...');
  
  try {
    // Test the connection
    const result = await testConnection();
    
    if (result.success) {
      console.log('✅ Successfully connected to MongoDB Atlas!');
      
      if (result.collections.length > 0) {
        console.log(`📋 Available collections: ${result.collections.join(', ')}`);
      } else {
        console.log('ℹ️ No collections found yet. You may need to create your first collection.');
        console.log('ℹ️ Example: db.createCollection("users")');
      }
    } else {
      console.error('❌ Connection test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    // Always close the connection when done
    try {
      await closeConnection();
      console.log('👋 Connection closed');
    } catch (error) {
      console.error('⚠️ Error closing connection:', error);
    }
    
    // Exit the process
    process.exit(0);
  }
}

// Run the test
runTest(); 