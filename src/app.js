const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const chatRoutes = require('./routes/chat');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS for all origins (useful for mobile apps)
app.use(cors());

// Parse JSON request bodies (increased limit to support multimodal models and large payloads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all api routes
app.use('/api/', limiter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'OK', 
    timestamp: new Date() 
  });
});

// Setup api routes
app.use('/api', chatRoutes);

// Catch 404
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    error: 'API Route not found' 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
