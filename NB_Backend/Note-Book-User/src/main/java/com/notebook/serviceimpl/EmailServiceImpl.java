package com.notebook.serviceimpl;

import java.nio.charset.StandardCharsets;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.notebook.service.EmailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
// import lombok.RequiredArgsConstructor;

@Service
// @RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@example.com}")
    private String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendVerificationEmail(String to, String name, String verificationLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Verify Your Email – Learning Platform");
            helper.setText(buildHtmlEmail(name, verificationLink), true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildHtmlEmail(String name, String verificationLink) {
        return EmailTemplateBuilder.buildVerificationTemplate(name, verificationLink);
    }

    // @Override
    // public Optional<UserLogin> verifyEmail(String email) {
    //     Optional<UserDetails> user = EmailRepository.findByEmail(email);
    //     if (user != null) {
    //         user.setEmailVerified(true);
    //         userRepository.save(user);
        
    // }
   
}

