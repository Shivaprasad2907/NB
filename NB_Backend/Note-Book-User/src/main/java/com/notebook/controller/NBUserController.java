package com.notebook.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.notebook.serviceimpl.NBUserServiceImpl;
import com.notebook.user.UserDetails;
import com.notebook.user.UserLogin;
import com.notebook.user.UserRegister;


@RestController
@RequestMapping("/user")
public class NBUserController {

    private final NBUserServiceImpl nbUserServiceImpl;
    UserDetails userDetails;
    

    public NBUserController(NBUserServiceImpl nbUserServiceImpl) {
        this.nbUserServiceImpl = nbUserServiceImpl;
    }

    
    @GetMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserRegister userRegister) {

        UserRegister user = nbUserServiceImpl.registerUser(userRegister);

        if (user != null) {
            String message = "Registered Successfully " + userRegister.getFirstName();
            return new ResponseEntity<>(message, HttpStatus.OK);
        }
        else
            return new ResponseEntity<>("Registration failed", HttpStatus.BAD_REQUEST);

    }

        @PostMapping("/login")
        public ResponseEntity<String> uLogin(@RequestBody UserLogin userLogin) {
        
                UserLogin ud = nbUserServiceImpl.loginUser(userLogin);

                if (ud != null) {
                    String message = "Login Successfully " + userDetails.getFirstName();
                    return new ResponseEntity<>(message, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>("Login failed", HttpStatus.UNAUTHORIZED);
                }
        }
    }


 