/**
 * Authentication Middleware
 * Checks if the request contains the correct 'X-API-Key' header.
 */
module.exports = (req, res, next) => {
  const configuredApiKey = process.env.API_KEY;

  // If API_KEY is not configured or left as default, warn the developer but allow request (for easy onboarding)
  if (!configuredApiKey || configuredApiKey === 'your_super_secret_api_key_here') {
    console.warn('[Security Warn] API_KEY environment variable is not set or using default value. Request allowed without validation.');
    return next();
  }

  const requestApiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];

  if (!requestApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing X-API-Key header'
    });
  }

  if (requestApiKey !== configuredApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid API Key'
    });
  }

  // API Key is valid, proceed
  next();
};
