package com.notebook.user;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotEmpty;

/**
 * Value object representing a user's address.
 *
 * This class is mapped as an {@link jakarta.persistence.Embeddable} so that all
 * its fields are stored in the owning entity's table (e.g. {@code UserDetails}).
 */
@Embeddable
public class Address {

    @NotEmpty(message = "Address Line 1 is required")
    private String Address1;
    
    private String Address2;
    
    @NotEmpty(message = "City is required")
    private String city;
    
    @NotEmpty(message = "State is required")
    private String state;
    
    @NotEmpty(message = "Country is required")
    private String country;
    
    @NotEmpty(message = "Zip Code is required")
    private String zipCode;

    public Address() {}

    // Getters and Setters
    public String getAddress1() {
        return Address1;
    }
    public void setAddress1(String address1) {
        Address1 = address1;
    }

    public String getAddress2() {
        return Address2;
    }
    public void setAddress2(String address2) {
        Address2 = address2;
    }

    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }
    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }
    public void setCountry(String country) {
        this.country = country;
    }

    public String getZipCode() {
        return zipCode;
    }
    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }
}