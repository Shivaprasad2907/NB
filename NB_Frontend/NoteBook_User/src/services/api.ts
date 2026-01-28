import axios, { AxiosInstance, AxiosError } from 'axios'
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ValidationResponse,
  AuthProvider,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  TokenVerificationResponse,
} from '../types/auth'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookies/CSRF tokens
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Check if email exists in database
   * Called on email input blur or after debounce
   */
  async checkEmailExists(email: string): Promise<ValidationResponse> {
    try {
      const response = await this.api.get<ValidationResponse>(`/auth/check-email`, {
        params: { email },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        // Email already exists
        return { available: false, message: 'Email already registered' }
      }
      throw error
    }
  }

  /**
   * Check if username exists in database
   * Called on username input blur or after debounce
   */
  async checkUsernameExists(username: string): Promise<ValidationResponse> {
    try {
      const response = await this.api.get<ValidationResponse>(`/auth/check-username`, {
        params: { username },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        // Username already exists
        return { available: false, message: 'Username already taken' }
      }
      throw error
    }
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', credentials)
    return response.data
  }

  /**
   * Login user
   * Backend should check both email and username
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  }

  /**
   * Initiate OAuth flow
   * Redirects to provider's authorization page
   */
  initiateOAuth(provider: AuthProvider): void {
    // Redirect to backend OAuth endpoint
    window.location.href = `/api/auth/oauth2/authorization/${provider}`
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<any> {
    const response = await this.api.get('/auth/me')
    return response.data
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.api.post('/auth/logout')
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  /**
   * Request password reset
   * Checks if email exists and sends reset link
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await this.api.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      { email } as ForgotPasswordRequest
    )
    
    // Store token in cache for verification (if provided)
    if (response.data.token) {
      this.cacheResetToken(email, response.data.token)
    }
    
    return response.data
  }

  /**
   * Verify reset token before showing reset form
   */
  async verifyResetToken(token: string, email: string): Promise<TokenVerificationResponse> {
    try {
      // Check frontend cache first
      const cachedToken = this.getCachedResetToken(email)
      if (cachedToken && cachedToken === token) {
        return { valid: true, email }
      }

      // Verify with backend
      const response = await this.api.get<TokenVerificationResponse>(
        '/auth/verify-reset-token',
        {
          params: { token, email },
        }
      )
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          valid: false,
          message: error.response?.data?.message || 'Invalid or expired token',
        }
      }
      throw error
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    email: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ResetPasswordResponse> {
    const response = await this.api.post<ResetPasswordResponse>(
      '/auth/reset-password',
      {
        token,
        email,
        newPassword,
        confirmPassword,
      } as ResetPasswordRequest
    )

    // Clear cached token after successful reset
    this.clearCachedResetToken(email)

    return response.data
  }

  /**
   * Cache reset token in localStorage (with expiration)
   * Frontend cache for quick verification
   */
  private cacheResetToken(email: string, token: string): void {
    const cacheData = {
      token,
      email,
      timestamp: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    }
    localStorage.setItem(`resetToken_${email}`, JSON.stringify(cacheData))
  }

  /**
   * Get cached reset token if valid
   */
  private getCachedResetToken(email: string): string | null {
    try {
      const cached = localStorage.getItem(`resetToken_${email}`)
      if (!cached) return null

      const cacheData = JSON.parse(cached)
      
      // Check if expired
      if (Date.now() > cacheData.expiresAt) {
        localStorage.removeItem(`resetToken_${email}`)
        return null
      }

      return cacheData.token
    } catch {
      return null
    }
  }

  /**
   * Clear cached reset token
   */
  private clearCachedResetToken(email: string): void {
    localStorage.removeItem(`resetToken_${email}`)
  }
}

export const apiService = new ApiService()
