package com.notebook.serviceimpl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.notebook.repository.UserRepository;
import com.notebook.service.NBUserService;
import com.notebook.user.UserDetails;
import com.notebook.user.UserLogin;
import com.notebook.user.UserRegister;

@Service
public class NBUserServiceImpl implements NBUserService {

    private static final Logger log = LoggerFactory.getLogger(NBUserServiceImpl.class);

    private final UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    public NBUserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }



    @Override
    public UserRegister registerUser(UserRegister userRegister) {
        UserDetails entity = new UserDetails();
        entity.setFirstName(userRegister.getFirstName());
        entity.setLastName(userRegister.getLastName());
        entity.setEmail(userRegister.getEmail());
        entity.setPassword(passwordEncoder.encode( userRegister.getPassword()));
        entity.setPhone(userRegister.getPhone());
        entity.setAddress(userRegister.getAddress());

        UserDetails saved = userRepository.save(entity);
        userRegister.setId(saved.getId());
        return userRegister;
    }

    @Override
    public UserLogin loginUser(UserLogin userLogin) {
        UserDetails userDetails =
                userRepository.findByEmail(userLogin.getEmail());

        // passwordEncoder = new BCryptPasswordEncoder();
        
        log.info("User Details" + userDetails);

        if (userDetails.getEmail() == null) {
            return null;
        }

        log.info("User Details" + userDetails);
        
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
