import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterFormData } from '../utils/validation'
import { apiService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useDebounce } from '../hooks/useDebounce'
import OAuthButton from '../components/OAuthButton'
import './Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Real-time validation states
  const [emailStatus, setEmailStatus] = useState<{
    checking: boolean
    available: boolean | null
    message?: string
  }>({ checking: false, available: null })

  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean
    available: boolean | null
    message?: string
  }>({ checking: false, available: null })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const email = watch('email')
  const username = watch('username')
  const debouncedEmail = useDebounce(email, 500)
  const debouncedUsername = useDebounce(username, 500)

  // Check email availability on debounce
  useEffect(() => {
    if (debouncedEmail && debouncedEmail.includes('@')) {
      setEmailStatus({ checking: true, available: null })
      apiService
        .checkEmailExists(debouncedEmail)
        .then((response) => {
          setEmailStatus({
            checking: false,
            available: response.available,
            message: response.message,
          })
        })
        .catch(() => {
          setEmailStatus({ checking: false, available: null })
        })
    } else {
      setEmailStatus({ checking: false, available: null })
    }
  }, [debouncedEmail])

  // Check username availability on debounce
  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      setUsernameStatus({ checking: true, available: null })
      apiService
        .checkUsernameExists(debouncedUsername)
        .then((response) => {
          setUsernameStatus({
            checking: false,
            available: response.available,
            message: response.message,
          })
        })
        .catch(() => {
          setUsernameStatus({ checking: false, available: null })
        })
    } else {
      setUsernameStatus({ checking: false, available: null })
    }
  }, [debouncedUsername])

  // Manual check on blur (on-click outside)
  const handleEmailBlur = async () => {
    if (email && email.includes('@')) {
      setEmailStatus({ checking: true, available: null })
      try {
        const response = await apiService.checkEmailExists(email)
        setEmailStatus({
          checking: false,
          available: response.available,
          message: response.message,
        })
      } catch {
        setEmailStatus({ checking: false, available: null })
      }
    }
  }

  const handleUsernameBlur = async () => {
    if (username && username.length >= 3) {
      setUsernameStatus({ checking: true, available: null })
      try {
        const response = await apiService.checkUsernameExists(username)
        setUsernameStatus({
          checking: false,
          available: response.available,
          message: response.message,
        })
      } catch {
        setUsernameStatus({ checking: false, available: null })
      }
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    // Final validation before submit
    if (emailStatus.available === false) {
      setError('Email is already registered')
      return
    }
    if (usernameStatus.available === false) {
      setError('Username is already taken')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.register({
        email: data.email,
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })

      login(response.user, response.token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Sign up to get started</p>

        {/* OAuth Buttons */}
        <div className="oauth-section">
          <OAuthButton provider="google" />
          <OAuthButton provider="github" />
          <OAuthButton provider="linkedin" />
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              onBlur={handleEmailBlur}
              className={
                errors.email || emailStatus.available === false ? 'error' : ''
              }
            />
            {emailStatus.checking && (
              <span className="checking-indicator">Checking...</span>
            )}
            {emailStatus.available === false && (
              <span className="field-error">
                {emailStatus.message || 'Email already registered'}
              </span>
            )}
            {emailStatus.available === true && (
              <span className="field-success">✓ Email available</span>
            )}
            {errors.email && !emailStatus.checking && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              {...register('username')}
              onBlur={handleUsernameBlur}
              className={
                errors.username || usernameStatus.available === false
                  ? 'error'
                  : ''
              }
            />
            {usernameStatus.checking && (
              <span className="checking-indicator">Checking...</span>
            )}
            {usernameStatus.available === false && (
              <span className="field-error">
                {usernameStatus.message || 'Username already taken'}
              </span>
            )}
            {usernameStatus.available === true && (
              <span className="field-success">✓ Username available</span>
            )}
            {errors.username && !usernameStatus.checking && (
              <span className="field-error">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                {...register('password')}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="field-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
