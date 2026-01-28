/**
 * Security utilities for frontend
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Note: This is a basic sanitization. For production, consider using DOMPurify
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong'
  score: number
} {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 5) strength = 'strong'
  else if (score >= 3) strength = 'medium'

  return { strength, score }
}

/**
 * Generate CSRF token (if needed)
 * Usually handled by backend, but can be stored here
 */
export function getCsrfToken(): string | null {
  return document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content') || null
}

/**
 * Secure token storage considerations
 * Note: localStorage is vulnerable to XSS. Consider httpOnly cookies for production
 */
export const TokenStorage = {
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Error storing token:', error)
    }
  },
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Error retrieving token:', error)
      return null
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing token:', error)
    }
  },
}
