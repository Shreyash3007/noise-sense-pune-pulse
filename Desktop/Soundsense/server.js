/**
 * NoiseSense - Express Server
 */

const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./db/mongoClient');
const Theme = require('./models/Theme');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for specific origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'https://noisesenseapp.onrender.com');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API routes
// Theme endpoints
app.get('/api/theme', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const theme = await Theme.getByUserId(userId);
    res.json({ success: true, data: theme || { theme: 'light' } });
  } catch (error) {
    console.error('Error getting theme:', error);
    res.status(500).json({ success: false, error: 'Failed to get theme' });
  }
});

app.post('/api/theme', async (req, res) => {
  try {
    const { theme, userId = 'default' } = req.body;
    
    if (!theme || !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ success: false, error: 'Invalid theme' });
    }
    
    const result = await Theme.setUserTheme(userId, theme);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error setting theme:', error);
    res.status(500).json({ success: false, error: 'Failed to set theme' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await connectToDatabase();
    
    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: Date.now(),
      error: error.message,
      database: 'disconnected'
    });
  }
});

// Handle 404 - Send the 404.html page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Test MongoDB connection on startup
  connectToDatabase()
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
}); 