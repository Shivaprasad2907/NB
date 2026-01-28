# Backend Integration Guide

This document provides specific guidance for integrating the frontend with your Spring Boot backend.

## Required Backend Endpoints

### 1. Check Email Availability

**Endpoint**: `GET /api/auth/check-email`

**Query Parameters**:
- `email` (required): Email address to check

**Response (200 OK)**:
```json
{
  "available": true,
  "message": "Email is available"
}
```

**Response (409 Conflict)**:
```json
{
  "available": false,
  "message": "Email already registered"
}
```

**Spring Boot Example**:
```java
@GetMapping("/auth/check-email")
public ResponseEntity<ValidationResponse> checkEmail(@RequestParam String email) {
    boolean exists = userRepository.existsByEmail(email);
    ValidationResponse response = new ValidationResponse();
    response.setAvailable(!exists);
    response.setMessage(exists ? "Email already registered" : "Email is available");
    
    return exists 
        ? ResponseEntity.status(409).body(response)
        : ResponseEntity.ok(response);
}
```

### 2. Check Username Availability

**Endpoint**: `GET /api/auth/check-username`

**Query Parameters**:
- `username` (required): Username to check

**Response (200 OK)**:
```json
{
  "available": true,
  "message": "Username is available"
}
```

**Response (409 Conflict)**:
```json
{
  "available": false,
  "message": "Username already taken"
}
```

**Spring Boot Example**:
```java
@GetMapping("/auth/check-username")
public ResponseEntity<ValidationResponse> checkUsername(@RequestParam String username) {
    boolean exists = userRepository.existsByUsername(username);
    ValidationResponse response = new ValidationResponse();
    response.setAvailable(!exists);
    response.setMessage(exists ? "Username already taken" : "Username is available");
    
    return exists 
        ? ResponseEntity.status(409).body(response)
        : ResponseEntity.ok(response);
}
```

### 3. User Registration

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "myusername",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "username": "myusername",
    "provider": "local"
  }
}
```

**Spring Boot Example**:
```java
@PostMapping("/auth/register")
public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
    // Validate passwords match
    if (!request.getPassword().equals(request.getConfirmPassword())) {
        throw new ValidationException("Passwords do not match");
    }
    
    // Check if email/username already exists
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new ConflictException("Email already registered");
    }
    if (userRepository.existsByUsername(request.getUsername())) {
        throw new ConflictException("Username already taken");
    }
    
    // Create user
    User user = new User();
    user.setEmail(request.getEmail());
    user.setUsername(request.getUsername());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setProvider("local");
    user = userRepository.save(user);
    
    // Generate JWT token
    String token = jwtTokenProvider.generateToken(user);
    
    AuthResponse response = new AuthResponse();
    response.setToken(token);
    response.setUser(mapToUserDto(user));
    
    return ResponseEntity.ok(response);
}
```

### 4. User Login (Dual Check: Email OR Username)

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",  // Can be email OR username
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "username": "myusername",
    "provider": "local"
  }
}
```

**Spring Boot Example**:
```java
@PostMapping("/auth/login")
public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
    User user = null;
    
    // Determine if identifier is email or username
    String identifier = request.getEmail(); // Frontend sends in 'email' field
    
    if (identifier.contains("@")) {
        // It's an email
        user = userRepository.findByEmail(identifier)
            .orElseThrow(() -> new AuthenticationException("Invalid credentials"));
    } else {
        // It's a username
        user = userRepository.findByUsername(identifier)
            .orElseThrow(() -> new AuthenticationException("Invalid credentials"));
    }
    
    // Verify password
    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new AuthenticationException("Invalid credentials");
    }
    
    // Generate JWT token
    String token = jwtTokenProvider.generateToken(user);
    
    AuthResponse response = new AuthResponse();
    response.setToken(token);
    response.setUser(mapToUserDto(user));
    
    return ResponseEntity.ok(response);
}
```

**Alternative Approach** (More Explicit):
```java
// You could also accept both fields and check both
@PostMapping("/auth/login")
public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
    Optional<User> user = Optional.empty();
    
    // Try email first
    if (request.getEmail() != null && request.getEmail().contains("@")) {
        user = userRepository.findByEmail(request.getEmail());
    }
    
    // If not found, try username
    if (user.isEmpty()) {
        user = userRepository.findByUsername(request.getEmail());
    }
    
    User foundUser = user.orElseThrow(() -> 
        new AuthenticationException("Invalid credentials"));
    
    // Verify password
    if (!passwordEncoder.matches(request.getPassword(), foundUser.getPassword())) {
        throw new AuthenticationException("Invalid credentials");
    }
    
    // Generate token and return
    // ...
}
```

### 5. OAuth Endpoints

**Initiate OAuth**:
```
GET /api/auth/oauth2/authorization/{provider}
```
Where `{provider}` is: `google`, `github`, or `linkedin`

**OAuth Callback**:
```
GET /api/auth/oauth2/callback/{provider}?code=...
```
Backend handles the callback and redirects to frontend with token.

**Spring Boot OAuth2 Configuration**:
```java
@Configuration
public class OAuth2Config {
    
    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(
            googleClientRegistration(),
            githubClientRegistration(),
            linkedinClientRegistration()
        );
    }
    
    private ClientRegistration googleClientRegistration() {
        return ClientRegistration.withRegistrationId("google")
            .clientId(googleClientId)
            .clientSecret(googleClientSecret)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("{baseUrl}/api/auth/oauth2/callback/{registrationId}")
            .scope("openid", "profile", "email")
            .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
            .tokenUri("https://www.googleapis.com/oauth2/v4/token")
            .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
            .userNameAttributeName(IdTokenClaimNames.SUB)
            .clientName("Google")
            .build();
    }
    
    // Similar for GitHub and LinkedIn
}
```

### 6. OAuth User Processing

**After OAuth Callback**:

```java
@GetMapping("/auth/oauth2/callback/{provider}")
public void oauth2Callback(
    @PathVariable String provider,
    OAuth2AuthenticationToken token,
    HttpServletResponse response
) throws IOException {
    OAuth2User oauth2User = token.getPrincipal();
    
    // Extract user info based on provider
    String email = extractEmail(oauth2User, provider);
    String name = extractName(oauth2User, provider);
    String providerId = extractProviderId(oauth2User, provider);
    
    // Find or create user
    User user = findOrCreateOAuthUser(email, name, provider, providerId);
    
    // Generate JWT token
    String jwtToken = jwtTokenProvider.generateToken(user);
    
    // Redirect to frontend with token
    response.sendRedirect("http://localhost:3000/auth/callback?token=" + jwtToken);
}

private User findOrCreateOAuthUser(
    String email, 
    String name, 
    String provider, 
    String providerId
) {
    // Check if user exists by provider ID
    Optional<User> existingUser = userRepository
        .findByProviderAndProviderId(provider, providerId);
    
    if (existingUser.isPresent()) {
        return existingUser.get();
    }
    
    // Check if email exists (link OAuth to existing account)
    if (email != null) {
        Optional<User> emailUser = userRepository.findByEmail(email);
        if (emailUser.isPresent()) {
            // Link OAuth provider to existing account
            User user = emailUser.get();
            user.setProvider(provider);
            user.setProviderId(providerId);
            return userRepository.save(user);
        }
    }
    
    // Create new user
    User newUser = new User();
    newUser.setEmail(email);
    newUser.setName(name);
    newUser.setProvider(provider);
    newUser.setProviderId(providerId);
    
    // Generate username from email or use provider username
    if (email != null) {
        String username = generateUsernameFromEmail(email);
        newUser.setUsername(username);
    } else {
        // Use provider username (e.g., GitHub login)
        newUser.setUsername(providerId); // Or extract from OAuth user
    }
    
    return userRepository.save(newUser);
}

private String generateUsernameFromEmail(String email) {
    String base = email.split("@")[0];
    String username = base.replaceAll("[^a-zA-Z0-9]", "_");
    
    // Ensure uniqueness
    int counter = 1;
    String finalUsername = username;
    while (userRepository.existsByUsername(finalUsername)) {
        finalUsername = username + counter;
        counter++;
    }
    
    return finalUsername;
}
```

## CORS Configuration

**Spring Boot CORS Config**:
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000") // Frontend URL
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

## Security Configuration

**Spring Security Config**:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/auth/oauth2/**")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers("/api/auth/check-email", "/api/auth/check-username").permitAll()
                .requestMatchers("/api/auth/oauth2/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("http://localhost:3000/auth/callback", true)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

## Rate Limiting

**Add Rate Limiting to Validation Endpoints**:
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final Map<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();
    
    @GetMapping("/check-email")
    public ResponseEntity<ValidationResponse> checkEmail(
        @RequestParam String email,
        HttpServletRequest request
    ) {
        String clientId = getClientId(request);
        
        // Rate limit: 10 requests per minute per IP
        if (!checkRateLimit(clientId, 10, 60)) {
            return ResponseEntity.status(429).build();
        }
        
        // ... rest of the logic
    }
    
    private boolean checkRateLimit(String clientId, int maxRequests, int windowSeconds) {
        RateLimitInfo info = rateLimitMap.computeIfAbsent(
            clientId, 
            k -> new RateLimitInfo()
        );
        
        long now = System.currentTimeMillis();
        if (now - info.getWindowStart() > windowSeconds * 1000) {
            info.reset(now);
        }
        
        if (info.getRequestCount() >= maxRequests) {
            return false;
        }
        
        info.increment();
        return true;
    }
}
```

## Database Schema Recommendations

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),  -- NULL for OAuth users
    provider VARCHAR(20) NOT NULL DEFAULT 'local',
    provider_id VARCHAR(255),
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_provider (provider, provider_id),
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_provider (provider, provider_id)
);
```

### 7. Forgot Password

**Endpoint**: `POST /api/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset link sent to your email",
  "token": "optional_token_for_frontend_cache"
}
```

**Spring Boot Example**:
```java
@PostMapping("/auth/forgot-password")
public ResponseEntity<ForgotPasswordResponse> forgotPassword(
    @RequestBody @Valid ForgotPasswordRequest request
) {
    // Check if user exists (don't reveal if not)
    Optional<User> user = userRepository.findByEmail(request.getEmail());
    
    if (user.isPresent()) {
        // Generate secure token
        String token = UUID.randomUUID().toString() + "-" + System.currentTimeMillis();
        
        // Save token to database/cache
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(request.getEmail());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        resetToken.setUsed(false);
        resetToken.setCreatedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
        
        // Send email with reset link
        String resetLink = "http://localhost:3000/reset-password?token=" 
            + token + "&email=" + request.getEmail();
        emailService.sendPasswordResetEmail(request.getEmail(), resetLink);
    }
    
    // Always return success (don't reveal if email exists - security)
    return ResponseEntity.ok(new ForgotPasswordResponse(
        true,
        "If the email exists, a reset link has been sent."
    ));
}
```

### 8. Verify Reset Token

**Endpoint**: `GET /api/auth/verify-reset-token`

**Query Parameters**:
- `token` (required): Reset token from email
- `email` (required): User email

**Response (200 OK)**:
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

**Response (Invalid)**:
```json
{
  "valid": false,
  "message": "Invalid or expired reset token"
}
```

**Spring Boot Example**:
```java
@GetMapping("/auth/verify-reset-token")
public ResponseEntity<TokenVerificationResponse> verifyResetToken(
    @RequestParam String token,
    @RequestParam String email
) {
    Optional<PasswordResetToken> resetToken = passwordResetTokenRepository
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
```

### 9. Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "email": "user@example.com",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Spring Boot Example**:
```java
@PostMapping("/auth/reset-password")
public ResponseEntity<ResetPasswordResponse> resetPassword(
    @RequestBody @Valid ResetPasswordRequest request
) {
    // Verify token
    Optional<PasswordResetToken> resetToken = passwordResetTokenRepository
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
    
    // Validate password strength
    if (!isPasswordStrong(request.getNewPassword())) {
        throw new BadRequestException("Password does not meet strength requirements");
    }
    
    // Update password
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new NotFoundException("User not found"));
    
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
    
    // Mark token as used
    PasswordResetToken tokenEntity = resetToken.get();
    tokenEntity.setUsed(true);
    passwordResetTokenRepository.save(tokenEntity);
    
    return ResponseEntity.ok(new ResetPasswordResponse(
        true,
        "Password reset successfully"
    ));
}
```

### Password Reset Token Entity

```java
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 255)
    private String token;
    
    @Column(nullable = false, length = 255)
    private String email;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(nullable = false)
    private boolean used = false;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    // Getters and setters
}
```

## Testing Endpoints

Use these curl commands to test:

```bash
# Check email
curl "http://localhost:8080/api/auth/check-email?email=test@example.com"

# Check username
curl "http://localhost:8080/api/auth/check-username?username=testuser"

# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!","confirmPassword":"Test123!"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Forgot Password
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify Reset Token (replace TOKEN and EMAIL)
curl "http://localhost:8080/api/auth/verify-reset-token?token=TOKEN&email=test@example.com"

# Reset Password (replace TOKEN)
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN","email":"test@example.com","newPassword":"NewPass123!","confirmPassword":"NewPass123!"}'
```
