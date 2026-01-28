package com.notebook.user;

import org.springframework.data.annotation.Id;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserRegister {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer id;

@NotEmpty(message = "First Name is required")
@Size(min = 2, max = 20, message = "First Name must be between 2 and 20 characters")
private String firstName;

@NotEmpty(message = "Last Name is required")
@Size(min = 2, max = 20, message = "Last Name must be between 2 and 20 characters")
private String lastName;

@NotEmpty(message = "Email is required")
@Email(message = "Invalid email format")
private String email;

@NotEmpty(message = "Password is required")
@Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
private String password;


@NotEmpty(message = "Phone is required")
@Size(min = 10, max = 10, message = "Phone must be 10 digits")
@Pattern(regexp = "^[0-9]*$", message = "Phone must contain only numbers")
private String phone;

@NotEmpty(message = "Address is required")
private Address address;
    
    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
  
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
    public Address getAddress() {
        return address;
    }
    public void setAddress(Address address) {
        this.address = address;
    }


    

}
