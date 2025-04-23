/**
 * NoiseSense - Theme Service Example
 * Run with: node examples/themeExample.js
 */

const { getUserTheme, saveUserTheme, clearCache, getCacheStats } = require('../services/themeService');
const { connectToDatabase, closeConnection } = require('../db/mongoClient');

// Example user IDs for testing
const TEST_USERS = [
  'test_user_1',
  'test_user_2',
  'test_user_3'
];

// Test themes
const THEMES = ['light', 'dark'];

/**
 * Run theme service examples
 */
async function runExamples() {
  console.log('🎨 Running Theme Service Examples...\n');
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');
    
    // Test getting default theme for new user
    const userId = TEST_USERS[0];
    console.log(`1️⃣ Getting theme for new user (${userId})...`);
    const defaultTheme = await getUserTheme(userId);
    console.log(`   Result: ${defaultTheme} (should be 'light')\n`);
    
    // Test saving theme
    const newTheme = 'dark';
    console.log(`2️⃣ Saving theme '${newTheme}' for user ${userId}...`);
    const saveResult = await saveUserTheme(userId, newTheme);
    console.log(`   Result: ${saveResult ? 'Success' : 'Failed'}\n`);
    
    // Test getting saved theme
    console.log(`3️⃣ Getting saved theme for user ${userId}...`);
    const savedTheme = await getUserTheme(userId);
    console.log(`   Result: ${savedTheme} (should be '${newTheme}')\n`);
    
    // Test cache hit
    console.log(`4️⃣ Getting theme again (should hit cache)...`);
    const cachedTheme = await getUserTheme(userId);
    console.log(`   Result: ${cachedTheme}\n`);
    
    // Test cache stats
    console.log('5️⃣ Getting cache statistics...');
    const stats = getCacheStats();
    console.log('   Cache Stats:', JSON.stringify(stats, null, 2), '\n');
    
    // Test clearing cache
    console.log(`6️⃣ Clearing cache for user ${userId}...`);
    clearCache(userId);
    console.log('   Cache cleared\n');
    
    // Test getting theme after cache clear
    console.log(`7️⃣ Getting theme after cache clear (should hit database)...`);
    const themeAfterClear = await getUserTheme(userId);
    console.log(`   Result: ${themeAfterClear}\n`);
    
    // Test invalid theme value
    console.log('8️⃣ Testing invalid theme value...');
    const invalidResult = await saveUserTheme(userId, 'invalid_theme');
    console.log(`   Result: ${invalidResult} (should be false)\n`);
    
    // Test multiple users
    console.log('9️⃣ Testing multiple users...');
    for (const user of TEST_USERS) {
      const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
      const result = await saveUserTheme(user, theme);
      console.log(`   User ${user}: Set theme to ${theme} - ${result ? 'Success' : 'Failed'}`);
    }
    console.log();
    
    // Final cache stats
    console.log('🔟 Final cache statistics:');
    const finalStats = getCacheStats();
    console.log('   Cache Stats:', JSON.stringify(finalStats, null, 2));
    
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