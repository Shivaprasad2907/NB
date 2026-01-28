import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome to Dashboard</h1>
        {user && (
          <div className="user-info">
            <h2>User Information</h2>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {user.username && (
              <p>
                <strong>Username:</strong> {user.username}
              </p>
            )}
            {user.name && (
              <p>
                <strong>Name:</strong> {user.name}
              </p>
            )}
            <p>
              <strong>Provider:</strong> {user.provider || 'local'}
            </p>
          </div>
        )}
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  )
}
