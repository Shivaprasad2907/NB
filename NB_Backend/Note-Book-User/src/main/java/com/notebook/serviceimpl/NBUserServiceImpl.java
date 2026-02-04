package com.notebook.serviceimpl;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.notebook.config.EmailVerificationTokenUtil;
import com.notebook.repository.EmailRepository;
import com.notebook.repository.UserRepository;
import com.notebook.service.EmailService;
import com.notebook.service.NBUserService;
import com.notebook.user.UserDetails;
import com.notebook.user.UserLogin;
import com.notebook.user.UserRegister;

// import lombok.RequiredArgsConstructor;



@Service
// @RequiredArgsConstructor
public class NBUserServiceImpl implements NBUserService {

    private static final Logger log = LoggerFactory.getLogger(NBUserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenUtil tokenUtil;
    private final EmailService emailService;
    private final EmailRepository emailRepository;

    public NBUserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailVerificationTokenUtil tokenUtil, EmailRepository emailRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenUtil = tokenUtil;
        this.emailService = emailService;
        this.emailRepository = emailRepository;
    }

    /* 
        @UserRegistration module
        method registerUser refer source from UserRegister
        - UserDetails is user Entity Module for dealing B/W DataBase.
        - For Existing User Checking and New User Creation
    */

    @Override
    public UserRegister registerUser(UserRegister userRegister) {

        /* 
            Checking FOr Existing User Email is register or not
        */
        if (emailRepository.existsByEmail(userRegister.getEmail())) {
            throw new RuntimeException(userRegister.getEmail() + " User Already Existed");
        }

        // Create new UserDetails entity for this registration (do not inject JPA entities)
        UserDetails entity = new UserDetails();
        entity.setFirstName(userRegister.getFirstName());
        entity.setLastName(userRegister.getLastName());
        entity.setEmail(userRegister.getEmail());
        entity.setPassword(passwordEncoder.encode(userRegister.getPassword()));
        entity.setPhone(userRegister.getPhone());
        entity.setAddress(userRegister.getAddress());

        UserDetails saved = userRepository.save(entity);

        // Generate email verification token (JWT)
        String token = tokenUtil.generateToken(saved.getEmail());

        // Build verification link
        String verificationLink =
                "http://localhost:8080/user/verify-email?token=" + token;

        // Send verification email
        emailService.sendVerificationEmail(
                saved.getEmail(),
                saved.getFirstName(),
                verificationLink
        );

        userRegister.setId(saved.getId());
        return userRegister;
    }

    @Override
    public UserLogin loginUser(UserLogin userLogin) {
        UserDetails userDetails = userRepository.findByEmail(userLogin.getEmail());

        if (userDetails == null) {
            return null;
        }

        log.info("User Details: " + userDetails);

        if(!passwordEncoder.matches(userLogin.getPassword(), userDetails.getPassword())) {
            return null;
        }
        log.info("User Details passed password encoder" );

        UserLogin response = new UserLogin();
        response.setEmail(userDetails.getEmail());
        // usually you do NOT return the password, but if you must:
        // response.setPassword(userDetails.getPassword());
        return response;
    }

  

}





// @Override
// public Optional<UserLogin> loginUser(UserLogin userLogin) {
//     Optional<UserDetails> userDetailsOpt = userRepository.findByEmail(userLogin.getEmail());

//     // passwordEncoder = new BCryptPasswordEncoder();

//     if (!userDetailsOpt.isPresent()) {
//         log.info("User not found with email: " + userLogin.getEmail());
//         return Optional.empty();
//     }

//     UserDetails userDetails = userDetailsOpt.get();
//     log.info("User Details: " + userDetails);

//     if (userDetails.getEmail() == null) {
//         return null;
//     }

//     log.info("User Details" + userDetails);

//     if(!passwordEncoder.matches(userLogin.getPassword(), userDetails.getPassword())) {
//         return null;
//     }
//     log.info("User Details passed password encoder" );

//     UserLogin response = new UserLogin();
//     response.setEmail(userDetails.getEmail());
//     // usually you do NOT return the password, but if you must:
//     // response.setPassword(userDetails.getPassword());
//     return Optional.of(response);
// }