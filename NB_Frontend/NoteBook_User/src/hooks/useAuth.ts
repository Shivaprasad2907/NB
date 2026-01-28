import { useState, useEffect, useCallback } from 'react'
import { User } from '../types/auth'
import { apiService } from '../services/api'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('authToken')

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((user: User, token: string) => {
    setUser(user)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('authToken', token)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
    }
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}
