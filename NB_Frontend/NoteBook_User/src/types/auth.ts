export interface User {
  id: string
  email: string
  username?: string
  name?: string
  provider?: 'local' | 'google' | 'github' | 'linkedin'
  providerId?: string
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  username: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  token: string
  user: User
  refreshToken?: string
}

export interface ValidationResponse {
  available: boolean
  message?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
  token?: string // For frontend cache/tracking
}

export interface ResetPasswordRequest {
  token: string
  email: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

export interface TokenVerificationResponse {
  valid: boolean
  email?: string
  message?: string
}

export type AuthProvider = 'google' | 'github' | 'linkedin'
