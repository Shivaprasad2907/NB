# Notebook User - Frontend Application

A modern, secure frontend application for user authentication with login, registration, and OAuth integration (Google, GitHub, LinkedIn).

## Features

- 🔐 **Secure Authentication**: Login and registration with email/username
- ⚡ **Real-time Validation**: Email and username availability checking
- 🔑 **OAuth Integration**: Support for Google, GitHub, and LinkedIn
- 🎨 **Modern UI**: Beautiful, responsive design
- 🛡️ **Security First**: Best practices for frontend security
- ✅ **Form Validation**: Client-side validation with Zod
- 🔄 **Dual Login**: Login with either email or username

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:8080` (Spring Boot)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── OAuthButton.tsx # OAuth provider buttons
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   └── useDebounce.ts  # Debounce hook for validation
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   └── Dashboard.tsx   # Protected dashboard
├── services/           # API services
│   └── api.ts          # API client
├── types/              # TypeScript types
│   └── auth.ts         # Authentication types
├── utils/              # Utility functions
│   ├── validation.ts   # Validation schemas
│   └── security.ts    # Security utilities
└── App.tsx             # Main app component
```

## Key Features Explained

### Real-time Validation

The registration form checks email and username availability:
- **On Type**: Debounced check (500ms delay) after user stops typing
- **On Blur**: Immediate check when user leaves the field
- Visual feedback: ✓ Available, ✗ Taken, ⏳ Checking...

### Dual Login Support

The login form accepts either email or username:
- User can enter email OR username in the email field
- Backend determines the type and authenticates accordingly
- Single input field for better UX

### OAuth Integration

OAuth providers redirect through backend:
1. User clicks OAuth button
2. Redirects to `/api/auth/oauth2/authorization/{provider}`
3. Backend handles OAuth flow
4. Returns to frontend with authentication token

## Backend API Requirements

Your Spring Boot backend should implement these endpoints:

- `GET /api/auth/check-email?email=...` - Check email availability
- `GET /api/auth/check-username?username=...` - Check username availability
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (accepts email OR username)
- `GET /api/auth/oauth2/authorization/{provider}` - Initiate OAuth
- `GET /api/auth/oauth2/callback/{provider}` - OAuth callback

See `FRONTEND_SECURITY_GUIDE.md` for detailed API specifications.

## Security Considerations

### Critical Precautions

1. **Token Storage**: Prefer httpOnly cookies over localStorage
2. **Input Validation**: Always validate on backend (never trust frontend)
3. **HTTPS**: Use HTTPS in production
4. **CSRF Protection**: Implement CSRF tokens
5. **Rate Limiting**: Backend should limit API calls
6. **Error Messages**: Never expose internal errors

See `FRONTEND_SECURITY_GUIDE.md` for comprehensive security guidelines.

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## OAuth Data Storage

When users authenticate via OAuth:

- **Email**: Stored if available from provider (Google, LinkedIn usually provide)
- **Username**: Generated from email or uses provider username (GitHub)
- **Provider Info**: Stored to link accounts

Backend should handle:
- Email conflicts (OAuth email matches existing account)
- Username generation
- Account linking

See `FRONTEND_SECURITY_GUIDE.md` for detailed OAuth storage strategy.

## Development

### Code Style

- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling

### Testing

```bash
# Run linter
npm run lint
```

## Documentation

- `FRONTEND_SECURITY_GUIDE.md` - Comprehensive security and best practices guide
- `README.md` - This file

## License

MIT
