package com.notebook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.notebook.user.UserLogin;

@Repository
public interface UserRepository<UserRegister> extends JpaRepository<UserRegister, Integer> {
  
    UserRegister findByEmail(String email);
    UserLogin findByEmailAndPassword(String email, String password);

}
    
