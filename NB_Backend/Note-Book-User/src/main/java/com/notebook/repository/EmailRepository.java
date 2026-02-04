package com.notebook.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.notebook.user.UserDetails;

public interface EmailRepository extends JpaRepository<UserDetails, Integer> {

    Optional<UserDetails> findByEmail(String email);
    boolean existsByEmail(String email);

}
