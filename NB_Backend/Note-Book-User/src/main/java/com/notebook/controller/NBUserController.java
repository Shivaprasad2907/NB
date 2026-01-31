package com.notebook.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.notebook.service.NBUserService;
import com.notebook.user.UserLogin;
import com.notebook.user.UserRegister;

@RestController
@RequestMapping("/user")
public class NBUserController {

    private final NBUserService nbUserService;

    public NBUserController(NBUserService nbUserService) {
        this.nbUserService = nbUserService;
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
}
