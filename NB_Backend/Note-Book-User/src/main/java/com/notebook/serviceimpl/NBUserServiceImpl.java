package com.notebook.serviceimpl;

import org.springframework.stereotype.Service;

import com.notebook.repository.UserRepository;
import com.notebook.service.NBUserService;
import com.notebook.user.UserLogin;
import com.notebook.user.UserRegister;

@Service
public class NBUserServiceImpl implements NBUserService {

    private final UserRepository<UserRegister> userRepository;

    public NBUserServiceImpl(UserRepository<UserRegister> userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserRegister registerUser(UserRegister userRegister) {

        UserRegister user =  new UserRegister();

        user.setFirstName(user.getFirstName());
        user.setLastName(user.getLastName());
        user.setEmail(user.getEmail());
        user.setPassword(user.getPassword());

        return userRepository.save(user);
    }

    @Override
    public UserLogin loginUser(UserLogin userLogin) {
        return userRepository.findByEmailAndPassword(userLogin.getEmail(), userLogin.getPassword());
    }

    


    


}
