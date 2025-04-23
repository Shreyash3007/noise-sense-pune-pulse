/**
 * NoiseSense - User Model Example
 * Run with: node examples/userExample.js
 */

const User = require('../models/User');
const { connectToDatabase, closeConnection } = require('../db/mongoClient');

// Test user data
const TEST_USERS = [
  {
    name: 'Test User 1',
    email: 'test1@example.com',
    preferences: {
      notifications: true,
      language: 'en',
      timezone: 'UTC'
    }
  },
  {
    name: 'Test User 2',
    email: 'test2@example.com',
    preferences: {
      notifications: false,
      language: 'es',
      timezone: 'America/New_York'
    }
  }
];

/**
 * Run user model examples
 */
async function runExamples() {
  console.log('👤 Running User Model Examples...\n');
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');
    
    // Create users
    console.log('1️⃣ Creating test users...');
    const createdUsers = [];
    for (const userData of TEST_USERS) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   Created user: ${user.name} (${user._id})`);
    }
    console.log();
    
    // Get user by ID
    const firstUser = createdUsers[0];
    console.log(`2️⃣ Getting user by ID (${firstUser._id})...`);
    const fetchedUser = await User.getById(firstUser._id);
    console.log('   User found:', JSON.stringify(fetchedUser, null, 2), '\n');
    
    // Update user
    console.log(`3️⃣ Updating user ${firstUser._id}...`);
    const updateData = {
      preferences: {
        ...firstUser.preferences,
        notifications: !firstUser.preferences.notifications,
        theme: 'dark'
      }
    };
    const updatedUser = await User.update(firstUser._id, updateData);
    console.log('   Updated user:', JSON.stringify(updatedUser, null, 2), '\n');
    
    // Get all users
    console.log('4️⃣ Getting all users...');
    const allUsers = await User.getAll();
    console.log(`   Found ${allUsers.length} users:`, 
      allUsers.map(u => `${u.name} (${u._id})`).join(', '), 
      '\n'
    );
    
    // Delete users
    console.log('5️⃣ Cleaning up test users...');
    for (const user of createdUsers) {
      const deleted = await User.delete(user._id);
      console.log(`   Deleted user ${user._id}: ${deleted ? 'Success' : 'Failed'}`);
    }
    console.log();
    
    // Verify deletion
    console.log('6️⃣ Verifying users were deleted...');
    const remainingUsers = await User.getAll({ 
      _id: { $in: createdUsers.map(u => u._id) } 
    });
    console.log(`   Remaining test users: ${remainingUsers.length} (should be 0)`);
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
  } finally {
    // Close MongoDB connection
    try {
      await closeConnection();
      console.log('\n👋 MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}

// Run the examples
runExamples(); 