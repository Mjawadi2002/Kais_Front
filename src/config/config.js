// Environment configuration
const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// Log configuration in development
if (config.IS_DEVELOPMENT) {
  console.log('🔧 App Configuration:', {
    API_BASE_URL: config.API_BASE_URL,
    NODE_ENV: config.NODE_ENV,
    REACT_APP_ENV: process.env.REACT_APP_ENV
  });
}

export default config;