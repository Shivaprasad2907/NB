package com.notebook.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.notebook.config.EmailVerificationTokenUtil;
import com.notebook.repository.UserRepository;
import com.notebook.service.EmailService;
import com.notebook.service.NBUserService;
import com.notebook.user.UserDetails;
import com.notebook.user.UserLogin;
import com.notebook.user.UserRegister;

// import lombok.RequiredArgsConstructor;




@RestController
@RequestMapping("/user")

public class NBUserController {

    private final NBUserService nbUserService;
    private final EmailVerificationTokenUtil tokenUtil;
    private final UserRepository userRepository;
    // private final EmailRepository emailRepository;   //EmailRepository emailRepository 
    private final EmailService emailService;
    public NBUserController(NBUserService nbUserService, EmailVerificationTokenUtil tokenUtil, UserRepository userRepository , EmailService emailService) {
        this.nbUserService = nbUserService;
        this.tokenUtil = tokenUtil;
        this.userRepository= userRepository;
        // this.emailRepository = emailRepository;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserRegister userRegister) {

        UserRegister user = nbUserService.registerUser(userRegister);

        if (user != null) {
            String message = "Registered Successfully " + user.getFirstName();
            return new ResponseEntity<>(message, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Registration failed", HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> uLogin(@RequestBody UserLogin userLogin) {
        
      UserLogin ud = nbUserService.loginUser(userLogin);

        if (ud != null) {
            String message = "Login Successfully " + ud.getEmail();
            return new ResponseEntity<>(message, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Login failed", HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/verify-email/{token}")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {

        // 1️⃣ Validate token and extract email
            String email = tokenUtil.extractEmail(token);
        emailService.sendVerificationEmail(email, "Verify Your Email", "http://localhost:8080/user/verify-email/" + token);
        return ResponseEntity.ok("Email verification link sent to your email");
    }
    
    @GetMapping("/verify-email-token")
    public ResponseEntity<String> verifyEmailToken(@RequestParam String token) {
        String email = tokenUtil.extractEmail(token);
        UserDetails user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        user.setEmailVerified(true);
        userRepository.save(user);
        return new ResponseEntity<>("Email verification token verified successfully", HttpStatus.OK);
    }   

    // @PostMapping("/forgot-password")
    // public ResponseEntity<String> forgotPassword(@RequestParam String email) {
    //     UserDetails user = userRepository.findByEmail(email);
    //     if (user == null) {
    //         return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
    //     }
    //     String token = tokenUtil.generateVerificationToken(email);
    //     emailService.sendVerificationEmail(email, "Reset Your Password", "http://localhost:8080/user/verify-reset-token/" + token);
    //     return new ResponseEntity<>("Password reset link sent to your email", HttpStatus.OK);
    // }   

    // @GetMapping("/verify-reset-token")
    // public ResponseEntity<String> verifyResetToken(@RequestParam String token) {
    //     String email = tokenUtil.extractEmail(token);
    //     UserDetails user = userRepository.findByEmail(email);
    //     if (user == null) {
    //         throw new RuntimeException("User not found");
    //     }
    // }

    // @PostMapping("/reset-password")
    // public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestParam String email) {
    //     String email = tokenUtil.extractEmail(token);
    //     UserDetails user = userRepository.findByEmail(email);
    //     if (user == null) {
    //         throw new RuntimeException("User not found");
    //     }
    // }

    // @PostMapping("/change-password")
    // public ResponseEntity<String> changePassword(@RequestParam String token, @RequestParam String email) {
    //     String email = tokenUtil.extractEmail(token);
    //     UserDetails user = userRepository.findByEmail(email);
    //     if (user == null) {
    //         throw new RuntimeException("User not found");
    //     }
    // }

    // @PostMapping("/logout")
    // public ResponseEntity<String> logout(@RequestParam String email) {
    //     UserDetails user = userRepository.findByEmail(email);
    //     if (user == null) {
    //         throw new RuntimeException("User not found");
    //     }
    // }

    // @PostMapping("/delete-account")
    // public ResponseEntity<String> deleteAccount(@RequestParam String email) {
    //     UserDetails user = userRepository.findByEmail(email);
    //     if (user == null) {
    //         throw new RuntimeException("User not found");
    //     }
    // }
}