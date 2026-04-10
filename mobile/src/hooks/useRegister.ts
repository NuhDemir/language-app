// src/hooks/useRegister.ts
// Register hook - separates logic from UI

import { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { authApi } from '../api/auth.api';
import { RegisterRequest, ApiError } from '../types/auth';

interface UseRegisterReturn {
  loading: boolean;
  register: (data: RegisterRequest) => Promise<boolean>;
}

export const useRegister = (): UseRegisterReturn => {
  const [loading, setLoading] = useState(false);

  const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
    if (loading) return false;

    setLoading(true);

    try {
      await authApi.register(data);

      Toast.show({
        type: 'success',
        text1: 'Kayıt Başarılı! 🎉',
        text2: 'Şimdi giriş yapabilirsiniz.',
        position: 'top',
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;

      Toast.show({
        type: 'error',
        text1: 'Kayıt Başarısız',
        text2: apiError.message || 'Bir hata oluştu',
        position: 'top',
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { loading, register };
};

export default useRegister;
