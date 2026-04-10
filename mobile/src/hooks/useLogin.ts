// src/hooks/useLogin.ts
// Login hook - separates logic from UI

import { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';
import { LoginRequest, ApiError } from '../types/auth';

interface UseLoginReturn {
  loading: boolean;
  login: (data: LoginRequest) => Promise<boolean>;
}

export const useLogin = (): UseLoginReturn => {
  const [loading, setLoading] = useState(false);
  const authLogin = useAuthStore((state) => state.login);

  const login = useCallback(async (data: LoginRequest): Promise<boolean> => {
    // Prevent double-click
    if (loading) return false;

    setLoading(true);

    try {
      const response = await authApi.login(data);

      // Store token and user
      authLogin(response.access_token, response.user);

      // Success toast
      Toast.show({
        type: 'success',
        text1: 'Hoş geldiniz! 🎉',
        text2: `Merhaba, ${response.user.username}`,
        position: 'top',
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;

      // Error toast
      Toast.show({
        type: 'error',
        text1: 'Giriş Başarısız',
        text2: apiError.message || 'Bir hata oluştu',
        position: 'top',
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [loading, authLogin]);

  return { loading, login };
};

export default useLogin;
