// src/api/auth.api.ts
// Authentication API calls

import apiClient from './client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

export const authApi = {
  /**
   * User login - returns JWT token and user data
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * User registration - returns JWT token and user data
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Get current user profile (validates token)
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },
};

export default authApi;
