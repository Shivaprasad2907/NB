package com.notebook.service;

import org.springframework.stereotype.Service;

import com.notebook.user.UserLogin;
import com.notebook.user.UserRegister;

@Service
public interface NBUserService {

    UserRegister registerUser(UserRegister userRegister);
    UserLogin loginUser(UserLogin userLogin);
    // UserRegister getUserById(Integer id);
    // UserRegister updateUser(UserRegister userRegister);
    // void deleteUser(Integer id);

}
 