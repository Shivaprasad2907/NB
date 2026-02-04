package com.notebook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.notebook.user.UserDetails;

@Repository
public interface UserRepository extends JpaRepository<UserDetails, Integer> {

    UserDetails findByEmail(String email);

    // UserDetails findByEmailAndPassword(String email, String password);
    // boolean existsByEmail(String email);
    // Optional<UserDetails> findByEmailOptional(String email);

}
    
