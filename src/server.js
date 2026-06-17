require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Ollama API Middleware running on port ${PORT}`);
  console.log(` Proxying requests to Ollama at: ${process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'}`);
  console.log(`=========================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
