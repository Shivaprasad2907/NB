# Quick Start Guide

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Backend URL** (if different from default)
   - Create `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open browser to `http://localhost:3000`

## Key Features

### ✅ Real-time Validation
- Email checked on blur and after 500ms debounce
- Username checked on blur and after 500ms debounce
- Visual feedback: ✓ Available, ✗ Taken, ⏳ Checking...

### ✅ Dual Login Support
- Login accepts **email OR username** in the email field
- Backend automatically determines type and authenticates

### ✅ OAuth Integration
- Click OAuth button → Redirects to backend → Returns with token
- Supports: Google, GitHub, LinkedIn

## Backend Requirements

Your Spring Boot backend must implement:

1. `GET /api/auth/check-email?email=...` - Email availability
2. `GET /api/auth/check-username?username=...` - Username availability  
3. `POST /api/auth/register` - User registration
4. `POST /api/auth/login` - Login (accepts email OR username)
5. `GET /api/auth/oauth2/authorization/{provider}` - OAuth initiation
6. `GET /api/auth/oauth2/callback/{provider}` - OAuth callback

See `BACKEND_INTEGRATION.md` for detailed implementation guide.

## Security Checklist

- ✅ Input validation (frontend + backend)
- ✅ HTTPS in production
- ✅ Secure token storage
- ✅ CSRF protection
- ✅ Rate limiting (backend)
- ✅ XSS prevention
- ✅ Error handling

See `FRONTEND_SECURITY_GUIDE.md` for comprehensive security guide.

## OAuth Data Storage

**What gets stored:**
- **Email**: If available from OAuth provider (Google, LinkedIn usually provide)
- **Username**: Generated from email or uses provider username (GitHub)
- **Provider Info**: Provider name and provider ID

**Account Linking:**
- If OAuth email matches existing account → Link OAuth to existing account
- If new user → Create account with OAuth data

See `FRONTEND_SECURITY_GUIDE.md` for detailed OAuth storage strategy.

## Project Structure

```
src/
├── components/     # OAuth buttons
├── hooks/          # useAuth, useDebounce
├── pages/          # Login, Register, Dashboard
├── services/       # API client
├── types/          # TypeScript types
└── utils/          # Validation, security
```

## Common Issues

**CORS Errors:**
- Ensure backend CORS is configured for `http://localhost:3000`
- See `BACKEND_INTEGRATION.md` for CORS config

**OAuth Not Working:**
- Check backend OAuth configuration
- Verify redirect URIs match
- Check OAuth provider credentials

**Validation Not Working:**
- Ensure backend endpoints return correct format
- Check network tab for API errors
- Verify debounce timing (500ms)

## Next Steps

1. Review `FRONTEND_SECURITY_GUIDE.md` for security best practices
2. Review `BACKEND_INTEGRATION.md` for backend implementation
3. Customize UI styling in `src/pages/Auth.css`
4. Add additional OAuth providers if needed
5. Implement password reset flow
6. Add email verification flow
