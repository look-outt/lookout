const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  GOOGLE_LOGIN: `${API_BASE_URL}/api/google-login`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/forgot-password`,
  RESET_PASSWORD: (token) => `${API_BASE_URL}/api/reset-password/${token}`,
};

export const AI_ENDPOINTS = {
  GENERATE_POST: `${AI_API_BASE_URL}/generate_post`,
  SAVE_CHOICE: `${AI_API_BASE_URL}/save_choice`,
  CLIENTS: (userId) => `${AI_API_BASE_URL}/clients/${userId}`,
};

export default {
  API_BASE_URL,
  AI_API_BASE_URL,
  ...API_ENDPOINTS,
  ...AI_ENDPOINTS,
};
