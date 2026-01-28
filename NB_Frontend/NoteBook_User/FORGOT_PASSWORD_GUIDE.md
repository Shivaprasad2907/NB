# Forgot Password Feature - Implementation Guide

## Overview

This document describes the forgot password and reset password flow implementation, including frontend validation, email checking, token verification, and cache handling.

## Flow Diagram

```
1. User clicks "Forgot Password" → ForgotPassword Page
2. User enters email → Real-time validation (checks database)
3. Email verified → Send reset link to email
4. User clicks link in email → ResetPassword Page (with token & email)
5. Token verified (frontend cache + backend) → Show reset form
6. User enters new password → Reset password → Redirect to login
```

## Frontend Implementation

### 1. Forgot Password Page (`/forgot-password`)

**Features:**
- Real-time email validation (debounced + on blur)
- Checks if email exists in database before sending reset link
- Success message after email sent
- Resend email option

**Email Validation:**
- **On Type**: Debounced check (500ms delay) after user stops typing
- **On Blur**: Immediate check when user leaves the field
- **Before Submit**: Final verification to ensure email exists

**API Call:**
```typescript
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset link sent to your email",
  "token": "optional_frontend_cache_token"
}
```

### 2. Reset Password Page (`/reset-password?token=...&email=...`)

**Features:**
- Token verification (frontend cache + backend)
- Password strength validation
- Password confirmation matching
- Auto-redirect to login after success

**Token Verification Flow:**
1. Extract token and email from URL parameters
2. Check frontend cache first (if available)
3. If cache valid → proceed to reset form
4. If cache invalid/expired → verify with backend
5. If backend verification fails → show error

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Must match confirmation password

**API Calls:**
```typescript
// Verify token
GET /api/auth/verify-reset-token?token=...&email=...

Response:
{
  "valid": true,
  "email": "user@example.com"
}

// Reset password
POST /api/auth/reset-password
{
  "token": "reset_token",
  "email": "user@example.com",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Cache Verification System

### Frontend Cache (localStorage)

**Purpose:** Quick token verification without backend call (if token was cached)

**Storage Format:**
```json
{
  "token": "reset_token_string",
  "email": "user@example.com",
  "timestamp": 1234567890,
  "expiresAt": 1234567890 + 900000  // 15 minutes
}
```

**Key Format:** `resetToken_{email}`

**Cache Lifecycle:**
1. Created when forgot password email is sent (if backend provides token)
2. Verified on reset password page load
3. Cleared after successful password reset
4. Auto-expires after 15 minutes

**Cache Verification Logic:**
```typescript
// Check cache first
const cachedToken = localStorage.getItem(`resetToken_${email}`)
if (cachedToken) {
  const cacheData = JSON.parse(cachedToken)
  if (cacheData.token === token && Date.now() < cacheData.expiresAt) {
    // Cache valid - use it
    return { valid: true, email }
  }
}

// Cache invalid/expired - verify with backend
const response = await apiService.verifyResetToken(token, email)
```

### Backend Token Verification

**Purpose:** Primary source of truth for token validity

**Backend Should:**
- Store reset tokens in database/cache
- Set expiration (typically 15 minutes)
- Verify token matches email
- Invalidate token after use
- Regenerate token if needed

## Backend API Requirements

### 1. Forgot Password Endpoint

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Backend Logic:**
1. Validate email format
2. Check if email exists in database
3. Generate secure reset token (JWT or random string)
4. Store token in database/cache with:
   - Email association
   - Expiration time (15 minutes)
   - Used flag (false)
5. Send email with reset link:
   ```
   http://localhost:3000/reset-password?token={token}&email={email}
   ```
6. Return success response (optionally include token for frontend cache)

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email",
  "token": "optional_token_for_frontend_cache"
}
```

**Security Considerations:**
- Don't reveal if email exists (prevent enumeration)
- Rate limit requests (e.g., 3 requests per hour per email)
- Use secure token generation
- Set short expiration time

### 2. Verify Reset Token Endpoint

**Endpoint:** `GET /api/auth/verify-reset-token`

**Query Parameters:**
- `token` (required): Reset token
- `email` (required): User email

**Backend Logic:**
1. Validate token format
2. Check if token exists in database/cache
3. Verify token matches email
4. Check if token is expired
5. Check if token has been used
6. Return verification result

**Response (Valid):**
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invalid or expired reset token"
}
```

### 3. Reset Password Endpoint

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "token": "reset_token",
  "email": "user@example.com",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Backend Logic:**
1. Verify token (same as verify endpoint)
2. Validate password strength
3. Verify passwords match
4. Hash new password
5. Update user password in database
6. Invalidate/delete reset token
7. Optionally invalidate all user sessions
8. Return success response

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**
- 400: Invalid password format
- 400: Passwords don't match
- 401: Invalid or expired token
- 404: User not found

## Email Template Example

**Subject:** Reset Your Password

**Body:**
```
Hello,

You requested to reset your password. Click the link below to create a new password:

[Reset Password](http://localhost:3000/reset-password?token={token}&email={email})

This link will expire in 15 minutes.

If you didn't request this, please ignore this email.

Best regards,
Your App Team
```

## Security Best Practices

### Frontend

1. **Token Storage:**
   - Store tokens in localStorage with expiration
   - Clear tokens after use
   - Never expose tokens in URLs (use POST for sensitive operations)

2. **Validation:**
   - Validate email format before API call
   - Show password requirements clearly
   - Verify passwords match before submit

3. **Error Handling:**
   - Don't reveal if email exists (prevent enumeration)
   - Show generic error messages
   - Log errors server-side

4. **Cache Management:**
   - Set short expiration (15 minutes)
   - Clear cache after successful reset
   - Verify cache expiration before use

### Backend

1. **Token Generation:**
   - Use cryptographically secure random tokens
   - Include email in token payload (JWT) or store association
   - Set short expiration (15 minutes)

2. **Token Storage:**
   - Store in database with expiration
   - Mark tokens as used after reset
   - Clean up expired tokens periodically

3. **Rate Limiting:**
   - Limit forgot password requests (3 per hour per email)
   - Limit reset attempts (5 per token)
   - Implement CAPTCHA for suspicious activity

4. **Email Security:**
   - Use HTTPS for reset links
   - Include email in link for verification
   - Set short expiration time
   - Invalidate token after use

5. **Password Security:**
   - Enforce strong password requirements
   - Hash passwords with bcrypt/argon2
   - Never store plain text passwords

## Spring Boot Implementation Example

### Entity

```java
@Entity
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(nullable = false)
    private boolean used = false;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
}
```

### Controller

```java
@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
        @RequestBody @Valid ForgotPasswordRequest request
    ) {
        // Check if user exists (don't reveal if not)
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        
        if (user.isPresent()) {
            // Generate token
            String token = generateSecureToken();
            
            // Save token
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(token);
            resetToken.setEmail(request.getEmail());
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
            resetToken.setCreatedAt(LocalDateTime.now());
            tokenRepository.save(resetToken);
            
            // Send email
            String resetLink = "http://localhost:3000/reset-password?token=" 
                + token + "&email=" + request.getEmail();
            emailService.sendPasswordResetEmail(request.getEmail(), resetLink);
        }
        
        // Always return success (don't reveal if email exists)
        return ResponseEntity.ok(new ForgotPasswordResponse(
            true,
            "If the email exists, a reset link has been sent."
        ));
    }
    
    @GetMapping("/verify-reset-token")
    public ResponseEntity<TokenVerificationResponse> verifyToken(
        @RequestParam String token,
        @RequestParam String email
    ) {
        Optional<PasswordResetToken> resetToken = tokenRepository
            .findByTokenAndEmail(token, email);
        
        if (resetToken.isEmpty()) {
            return ResponseEntity.ok(new TokenVerificationResponse(
                false,
                "Invalid token"
            ));
        }
        
        PasswordResetToken tokenEntity = resetToken.get();
        
        if (tokenEntity.isUsed()) {
            return ResponseEntity.ok(new TokenVerificationResponse(
                false,
                "Token has already been used"
            ));
        }
        
        if (tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.ok(new TokenVerificationResponse(
                false,
                "Token has expired"
            ));
        }
        
        return ResponseEntity.ok(new TokenVerificationResponse(
            true,
            email
        ));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ResetPasswordResponse> resetPassword(
        @RequestBody @Valid ResetPasswordRequest request
    ) {
        // Verify token
        Optional<PasswordResetToken> resetToken = tokenRepository
            .findByTokenAndEmail(request.getToken(), request.getEmail());
        
        if (resetToken.isEmpty() || 
            resetToken.get().isUsed() ||
            resetToken.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invalid or expired token");
        }
        
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        
        // Update password
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Mark token as used
        PasswordResetToken tokenEntity = resetToken.get();
        tokenEntity.setUsed(true);
        tokenRepository.save(tokenEntity);
        
        return ResponseEntity.ok(new ResetPasswordResponse(
            true,
            "Password reset successfully"
        ));
    }
    
    private String generateSecureToken() {
        return UUID.randomUUID().toString() + "-" + 
               System.currentTimeMillis();
    }
}
```

## Testing Checklist

- [ ] Forgot password with valid email
- [ ] Forgot password with invalid email (should not reveal)
- [ ] Reset password with valid token
- [ ] Reset password with expired token
- [ ] Reset password with used token
- [ ] Reset password with invalid token
- [ ] Password strength validation
- [ ] Password confirmation matching
- [ ] Frontend cache verification
- [ ] Backend token verification
- [ ] Rate limiting on forgot password
- [ ] Email delivery
- [ ] Token expiration handling
- [ ] Multiple reset attempts

## Common Issues & Solutions

### Issue: Token not found in cache
**Solution:** Backend should provide token in forgot password response, or frontend can skip cache and always verify with backend.

### Issue: Token expired
**Solution:** Show clear error message and provide link to request new reset link.

### Issue: Email not received
**Solution:** Check spam folder, verify email service configuration, implement resend functionality.

### Issue: Cache and backend token mismatch
**Solution:** Backend is source of truth. If mismatch, use backend verification result.

---

This implementation provides a secure, user-friendly forgot password flow with proper validation, caching, and error handling.
