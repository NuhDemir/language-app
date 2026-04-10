// src/api/client.ts
// Axios Instance with Interceptors
// Global error handling, token injection, 401 auto-logout

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAuthStore } from '../stores/auth.store';

// ============================================================
// DYNAMIC API BASE URL RESOLVER
// Web: localhost kullanır
// Mobile: Expo dev server'ın IP'sini otomatik algılar
// ============================================================
const getApiBaseUrl = (): string => {
  if (!__DEV__) {
    return 'https://api.languagelearning.com/api';
  }

  // Web platformunda localhost kullan
  if (Platform.OS === 'web') {
    console.log('🔧 [API] Web platform detected, using localhost');
    return 'http://localhost:3000/api';
  }

  // Mobile: Expo dev server'ın host bilgisini al (örn: "192.168.1.5:8081")
  const expoHostUri = Constants.expoConfig?.hostUri;
  
  if (expoHostUri) {
    // Host URI'den IP'yi çıkar (port kısmını kaldır)
    const hostIp = expoHostUri.split(':')[0];
    console.log(`🔧 [API] Auto-detected host IP: ${hostIp}`);
    return `http://${hostIp}:3000/api`;
  }

  // Fallback: Bilgisayarının Wi-Fi IP'sini buraya yaz
  // PowerShell: (Get-NetIPAddress -AddressFamily IPv4).IPAddress
  console.warn('⚠️ [API] Could not auto-detect IP, using fallback');
  return 'http://10.37.1.71:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Axios instance oluştur
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// REQUEST INTERCEPTOR
// Her request'e Authorization header ekle
// ============================================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging (development only)
    if (__DEV__) {
      console.log(`🌐 [API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// Global error handling, 401 auto-logout
// ============================================================
apiClient.interceptors.response.use(
  (response) => {
    // Başarılı response - data'yı döndür
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Network hatası
    if (!error.response) {
      console.error('🔴 [API] Network Error - Server unreachable');
      return Promise.reject({
        statusCode: 0,
        message: 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.',
      });
    }

    const status = error.response.status;

    // 401 Unauthorized - Token geçersiz, logout yap
    if (status === 401) {
      console.warn('🔴 [API] 401 Unauthorized - Logging out');
      useAuthStore.getState().logout();
      return Promise.reject({
        statusCode: 401,
        message: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
      });
    }

    // 403 Forbidden
    if (status === 403) {
      return Promise.reject({
        statusCode: 403,
        message: 'Bu işlem için yetkiniz bulunmamaktadır.',
      });
    }

    // 500+ Server Error
    if (status >= 500) {
      console.error('🔴 [API] Server Error:', status);
      return Promise.reject({
        statusCode: status,
        message: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
      });
    }

    // Diğer hatalar (400, 404, 409, etc.) - Backend'in mesajını kullan
    const errorData = error.response.data as { message?: string | string[] };
    const message = Array.isArray(errorData?.message) 
      ? errorData.message[0] 
      : errorData?.message || 'Bir hata oluştu.';

    return Promise.reject({
      statusCode: status,
      message,
    });
  }
);

export default apiClient;
