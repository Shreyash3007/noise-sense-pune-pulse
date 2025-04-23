/**
 * NoiseSense - Theme Model for MongoDB
 */

const { connectToDatabase, ObjectId } = require('../db/mongoClient');

// Theme model methods
const Theme = {
  /**
   * Get a user's theme preference
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Theme object or null
   */
  async getByUserId(userId) {
    try {
      const db = await connectToDatabase();
      return await db.collection('themes').findOne({ userId });
    } catch (error) {
      console.error('Error getting theme by user ID:', error);
      throw error;
    }
  },

  /**
   * Set or update a user's theme preference
   * @param {string} userId - User ID
   * @param {string} themeName - Theme name (e.g., 'light', 'dark')
   * @returns {Promise<Object>} Updated theme object
   */
  async setUserTheme(userId, themeName) {
    try {
      const db = await connectToDatabase();
      
      // Create or update theme preference
      const result = await db.collection('themes').findOneAndUpdate(
        { userId },
        { 
          $set: { 
            theme: themeName,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { 
          upsert: true,
          returnDocument: 'after'
        }
      );
      
      return result;
    } catch (error) {
      console.error('Error setting user theme:', error);
      throw error;
    }
  },

  /**
   * Get default theme settings
   * @returns {Promise<Object>} Default theme settings
   */
  async getDefaultTheme() {
    try {
      const db = await connectToDatabase();
      const defaultTheme = await db.collection('themes').findOne({ isDefault: true });
      
      // Return default theme or fallback to light theme
      return defaultTheme || { 
        theme: 'light',
        properties: {
          colorPrimary: '#4a90e2',
          colorText: '#333333',
          colorBackground: '#ffffff',
          fontMain: 'Roboto, sans-serif'
        }
      };
    } catch (error) {
      console.error('Error getting default theme:', error);
      throw error;
    }
  },

  /**
   * Create a new theme
   * @param {Object} themeData - Theme data
   * @returns {Promise<Object>} Created theme
   */
  async create(themeData) {
    try {
      const db = await connectToDatabase();
      
      // Add timestamps
      const themeWithTimestamps = {
        ...themeData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('themes').insertOne(themeWithTimestamps);
      
      return {
        _id: result.insertedId,
        ...themeWithTimestamps
      };
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  },

  /**
   * Get themes with statistics
   * @returns {Promise<Object>} Theme usage statistics
   */
  async getThemeStats() {
    try {
      const db = await connectToDatabase();
      
      // Aggregate theme usage
      const stats = await db.collection('themes').aggregate([
        { $match: { userId: { $exists: true } } }, // Only user themes
        { $group: {
            _id: '$theme',
            count: { $sum: 1 },
            lastUsed: { $max: '$updatedAt' }
          }
        },
        { $sort: { count: -1 } },
        { $project: {
            _id: 0,
            themeName: '$_id',
            userCount: '$count',
            lastUsed: 1
          }
        }
      ]).toArray();
      
      return {
        themes: stats,
        totalUsers: stats.reduce((sum, item) => sum + item.userCount, 0)
      };
    } catch (error) {
      console.error('Error getting theme stats:', error);
      throw error;
    }
  }
};

module.exports = Theme; 