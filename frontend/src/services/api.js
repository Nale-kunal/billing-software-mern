// Centralized API configuration
// Backend server URL - uses environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : 'http://localhost:5000/api';

export default API_BASE_URL;

