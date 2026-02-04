package com.notebook.service;

import org.springframework.stereotype.Service;

@Service
public interface EmailService {
    void sendVerificationEmail(String to, String name, String verificationLink);
    // void sendPasswordResetEmail(String to, String name, String resetLink);
    // void verifyEmail(String email);
    // void sendPasswordResetEmail(String to, String name, String resetLink);
    // void verifyResetToken(String token, String email);
    // void resetPassword(String token, String email, String newPassword);
    // void sendVerificationEmail(String to, String name, String verificationLink);
    // void verifyEmail(String email);
    // void sendPasswordResetEmail(String to, String name, String resetLink);
    // void verifyResetToken(String token, String email);
    // void resetPassword(String token, String email, String newPassword);


}
