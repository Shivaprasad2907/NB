import { AuthProvider } from '../types/auth'
import { apiService } from '../services/api'
import './OAuthButton.css'

interface OAuthButtonProps {
  provider: AuthProvider
  onClick?: () => void
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: 'G',
    color: '#4285F4',
  },
  github: {
    name: 'GitHub',
    icon: 'G',
    color: '#333',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'in',
    color: '#0077B5',
  },
}

export default function OAuthButton({ provider, onClick }: OAuthButtonProps) {
  const config = providerConfig[provider]

  const handleClick = () => {
    if (onClick) onClick()
    apiService.initiateOAuth(provider)
  }

  return (
    <button
      type="button"
      className="oauth-button"
      onClick={handleClick}
      style={{ '--provider-color': config.color } as React.CSSProperties}
    >
      <span className="oauth-icon">{config.icon}</span>
      Continue with {config.name}
    </button>
  )
}
