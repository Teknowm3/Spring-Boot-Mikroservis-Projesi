package com.yazilimsistemtasarim.user_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserProfileDTO {
    
    private Long id;
    
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private String role;
    
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
}
