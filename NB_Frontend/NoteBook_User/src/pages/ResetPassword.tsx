import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from '../utils/validation'
import { apiService } from '../services/api'
import './Auth.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [verificationMessage, setVerificationMessage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Extract token and email from URL parameters
  useEffect(() => {
    const urlToken = searchParams.get('token')
    const urlEmail = searchParams.get('email')

    if (!urlToken || !urlEmail) {
      setError('Invalid reset link. Missing token or email.')
      setIsVerifying(false)
      return
    }

    setToken(urlToken)
    setEmail(urlEmail)
    verifyToken(urlToken, urlEmail)
  }, [searchParams])

  // Verify token on component mount
  const verifyToken = async (resetToken: string, resetEmail: string) => {
    setIsVerifying(true)
    setError(null)

    try {
      // Check frontend cache first (if token was cached)
      const cachedToken = localStorage.getItem(`resetToken_${resetEmail}`)
      if (cachedToken) {
        const cacheData = JSON.parse(cachedToken)
        if (cacheData.token === resetToken && Date.now() < cacheData.expiresAt) {
          // Frontend cache verified
          setVerificationMessage('Token verified (from cache)')
          setIsVerifying(false)
          return
        }
      }

      // Verify with backend
      const response = await apiService.verifyResetToken(resetToken, resetEmail)

      if (response.valid) {
        setVerificationMessage('Token verified successfully')
        setIsVerifying(false)
      } else {
        setError(response.message || 'Invalid or expired reset token')
        setIsVerifying(false)
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to verify reset token. The link may have expired.'
      )
      setIsVerifying(false)
    }
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !email) {
      setError('Missing token or email. Please use the link from your email.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Re-verify token before reset (security check)
      const verification = await apiService.verifyResetToken(token, email)
      if (!verification.valid) {
        setError('Token has expired. Please request a new reset link.')
        setIsLoading(false)
        return
      }

      // Reset password
      const response = await apiService.resetPassword(
        token,
        email,
        data.newPassword,
        data.confirmPassword
      )

      if (response.success) {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(response.message || 'Failed to reset password. Please try again.')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to reset password. Please try again or request a new link.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="verifying-message">
            <div className="spinner"></div>
            <h2>Verifying Reset Link...</h2>
            <p>Please wait while we verify your reset token.</p>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h1>Password Reset Successful</h1>
            <p>Your password has been reset successfully.</p>
            <p className="success-subtext">
              Redirecting to login page...
            </p>
            <Link to="/login" className="back-to-login">
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (error && !token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="error-message">{error}</div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/forgot-password" className="back-to-login">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reset Password</h1>
        <p className="auth-subtitle">
          Enter your new password for <strong>{email}</strong>
        </p>

        {verificationMessage && (
          <div className="info-message">{verificationMessage}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                {...register('newPassword')}
                className={errors.newPassword ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.newPassword && (
              <span className="field-error">{errors.newPassword.message}</span>
            )}
            <div className="password-requirements">
              <small>Password must contain:</small>
              <ul>
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character</li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
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
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
