// API Configuration
export const API_CONFIG = {
  // Production API Gateway URL
  PRODUCTION: "https://1813b6ckkf.execute-api.us-east-1.amazonaws.com/dev",
  
  // Development API URL (if you have a local development server)
  DEVELOPMENT: "http://localhost:4000/api",
  
  // Current environment - change this based on your setup
  CURRENT: process.env.REACT_APP_API_BASE || "https://1813b6ckkf.execute-api.us-east-1.amazonaws.com/dev"
};

// Available API endpoints
export const API_ENDPOINTS = {
  LOGIN: "/api/login",
  ME: "/api/me",
  ADMIN_USERS: "/api/admin/users",
  CREDIT_REPORT: "/api/forthcrm/credit-report"
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.CURRENT}${endpoint}`;
};

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production'; 