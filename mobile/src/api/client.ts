import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS simulator, or your local IP for physical device
// const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Android Emulator default
const API_BASE_URL = 'http://10.233.166.62:8000/api'; // Physical device over Wi-Fi

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30s to allow for AI processing and image uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user data on 401 error
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');

      // We don't want to alert on /auth/me because that's a silent check
      if (error.config.url !== '/auth/me') {
        // You could use a global event emitter or a state update here if needed
      }
    }
    return Promise.reject(error);
  }
);
