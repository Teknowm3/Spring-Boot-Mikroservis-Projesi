package com.yazilimsistemtasarim.auth_service.service;

import com.yazilimsistemtasarim.auth_service.dto.AuthResponse;
import com.yazilimsistemtasarim.auth_service.dto.AdminCreateUserRequest;
import com.yazilimsistemtasarim.auth_service.dto.LoginRequest;
import com.yazilimsistemtasarim.auth_service.dto.RegisterRequest;
import com.yazilimsistemtasarim.auth_service.entity.Role;
import com.yazilimsistemtasarim.auth_service.entity.User;
import com.yazilimsistemtasarim.auth_service.integration.UserServiceClient;
import com.yazilimsistemtasarim.auth_service.repository.UserRepository;
import com.yazilimsistemtasarim.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserServiceClient userServiceClient;

    public AuthResponse register(RegisterRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(Role.USER);

        userRepository.save(user);

        try {
            userServiceClient.createUserProfile(user.getUsername(), user.getEmail(), user.getRole().name());
        } catch (Exception ignored) {
            // If user-service is temporarily unavailable, don't block auth registration
        }

        // Generate token
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUsername()));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername());
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    public void updateUserRole(String username, Role role) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        user.setRole(role);
        userRepository.save(user);

        try {
            userServiceClient.syncUserRole(username, role.name());
        } catch (Exception ignored) {
            // If user-service is temporarily unavailable, don't block role update in auth
        }
    }

    public void adminCreateUser(AdminCreateUserRequest request, Role role) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(role == null ? Role.USER : role);
        userRepository.save(user);

        try {
            userServiceClient.createUserProfile(user.getUsername(), user.getEmail(), user.getRole().name());
        } catch (Exception ignored) {
            // If user-service is temporarily unavailable, don't block auth admin create
        }
    }

    public void adminDeleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        userRepository.delete(user);

        try {
            userServiceClient.deleteUserProfileByUsername(username);
        } catch (Exception ignored) {
            // If user-service is temporarily unavailable, don't block auth delete
        }
    }
}
