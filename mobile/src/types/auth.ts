// src/types/auth.ts
// Authentication related type definitions

export interface User {
  id: string;
  username: string;
  email: string;
  totalXp?: number;
  streakDays?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
