import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, ForgotPasswordFormData } from '../utils/validation'
import { apiService } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'
import './Auth.css'

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<{
    checking: boolean
    exists: boolean | null
    message?: string
  }>({ checking: false, exists: null })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const email = watch('email')
  const debouncedEmail = useDebounce(email, 500)

  // Check email existence on debounce
  useEffect(() => {
    if (debouncedEmail && debouncedEmail.includes('@')) {
      setEmailStatus({ checking: true, exists: null })
      apiService
        .checkEmailExists(debouncedEmail)
        .then((response) => {
          setEmailStatus({
            checking: false,
            exists: !response.available, // available=false means exists
            message: response.available
              ? 'Email not found in our system'
              : 'Email found',
          })
        })
        .catch(() => {
          setEmailStatus({ checking: false, exists: null })
        })
    } else {
      setEmailStatus({ checking: false, exists: null })
    }
  }, [debouncedEmail])

  // Manual check on blur
  const handleEmailBlur = async () => {
    if (email && email.includes('@')) {
      setEmailStatus({ checking: true, exists: null })
      try {
        const response = await apiService.checkEmailExists(email)
        setEmailStatus({
          checking: false,
          exists: !response.available,
          message: response.available
            ? 'Email not found in our system'
            : 'Email found',
        })
      } catch {
        setEmailStatus({ checking: false, exists: null })
      }
    }
  }

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Final check: ensure email exists before sending reset link
      const emailCheck = await apiService.checkEmailExists(data.email)
      if (emailCheck.available) {
        setError('Email not found in our system. Please check your email address.')
        setIsLoading(false)
        return
      }

      // Send reset password email
      const response = await apiService.forgotPassword(data.email)

      if (response.success) {
        setIsSubmitted(true)
      } else {
        setError(response.message || 'Failed to send reset email. Please try again.')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to send reset email. Please try again later.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h1>Check Your Email</h1>
            <p>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="success-subtext">
              Please check your inbox and click on the reset link to create a new password.
              The link will expire in 15 minutes.
            </p>
            <div className="success-actions">
              <Link to="/login" className="back-to-login">
                Back to Login
              </Link>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="resend-button"
              >
                Resend Email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your password
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register('email')}
              onBlur={handleEmailBlur}
              className={
                errors.email || emailStatus.exists === false ? 'error' : ''
              }
            />
            {emailStatus.checking && (
              <span className="checking-indicator">Checking...</span>
            )}
            {emailStatus.exists === false && (
              <span className="field-error">
                {emailStatus.message || 'Email not found in our system'}
              </span>
            )}
            {emailStatus.exists === true && (
              <span className="field-success">✓ Email found</span>
            )}
            {errors.email && !emailStatus.checking && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
