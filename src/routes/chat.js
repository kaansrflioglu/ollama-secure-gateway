const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticate = require('../middlewares/auth');

// Apply the authentication middleware to all routes on this router
router.use(authenticate);

// Route for chat completion
router.post('/chat', chatController.chat);

// Route for single prompt generation
router.post('/generate', chatController.generate);

// Route to list available local models
router.get('/models', chatController.listModels);

module.exports = router;
