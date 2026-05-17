// Configuration for the custom backend API

export const API_CONFIG = {
  // Replace this with your actual backend URL
  // Example: 'http://localhost:5000/predict'
  ENDPOINT: 'http://127.0.0.1:8000/predict',
  // Simulated delay for testing UI (set to 0 when connected to real backend)
  SIMULATED_DELAY: 500,
  // Set this to true to mock the API response if the backend isn't ready
  USE_MOCK: false
};
