/**
 * NoiseSense - User Model for MongoDB
 */

const { connectToDatabase, ObjectId } = require('../db/mongoClient');

// User model methods
const User = {
  /**
   * Get a user by ID
   * @param {string|ObjectId} userId - User ID
   * @returns {Promise<Object>} User object or null
   */
  async getById(userId) {
    try {
      const db = await connectToDatabase();
      const _id = userId instanceof ObjectId ? userId : new ObjectId(userId);
      return await db.collection('users').findOne({ _id });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    try {
      const db = await connectToDatabase();
      
      // Add timestamps
      const userWithTimestamps = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('users').insertOne(userWithTimestamps);
      
      return {
        _id: result.insertedId,
        ...userWithTimestamps
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update a user
   * @param {string|ObjectId} userId - User ID
   * @param {Object} updateData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(userId, updateData) {
    try {
      const db = await connectToDatabase();
      
      // Add updated timestamp
      const updateWithTimestamp = {
        ...updateData,
        updatedAt: new Date()
      };
      
      const _id = userId instanceof ObjectId ? userId : new ObjectId(userId);
      
      // Use findOneAndUpdate with returnDocument: 'after' to get the updated document
      const result = await db.collection('users').findOneAndUpdate(
        { _id },
        { $set: updateWithTimestamp },
        { returnDocument: 'after' }
      );
      
      // Return the updated document
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param {string|ObjectId} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(userId) {
    try {
      const db = await connectToDatabase();
      const _id = userId instanceof ObjectId ? userId : new ObjectId(userId);
      const result = await db.collection('users').deleteOne({ _id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Get all users
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of users
   */
  async getAll(filter = {}, options = {}) {
    try {
      const db = await connectToDatabase();
      
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
      
      return await db.collection('users')
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
};

module.exports = User; 