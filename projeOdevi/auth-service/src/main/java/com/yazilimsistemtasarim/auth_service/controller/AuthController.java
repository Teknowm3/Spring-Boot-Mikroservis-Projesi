package com.yazilimsistemtasarim.auth_service.controller;

import com.yazilimsistemtasarim.auth_service.dto.AuthResponse;
import com.yazilimsistemtasarim.auth_service.dto.AdminCreateUserRequest;
import com.yazilimsistemtasarim.auth_service.dto.LoginRequest;
import com.yazilimsistemtasarim.auth_service.dto.RegisterRequest;
import com.yazilimsistemtasarim.auth_service.entity.Role;
import com.yazilimsistemtasarim.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register - Yeni kullanıcı kaydı
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/auth/login - Kullanıcı girişi ve JWT token alma
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }

    // GET /api/auth/validate - Token doğrulama
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Invalid token format"));
            }
            String token = authHeader.substring(7);
            boolean isValid = authService.validateToken(token);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false, "error", e.getMessage()));
        }
    }

    // GET /api/auth/health - Health check
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "auth-service"));
    }

    // GET /api/auth/me - Current user info (requires Bearer token)
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        List<String> roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return ResponseEntity.ok(Map.of(
                "username", authentication.getName(),
                "roles", roles
        ));
    }

    // PATCH /api/auth/users/{username}/role - Update role (admin only)
    @PatchMapping("/users/{username}/role")
    public ResponseEntity<?> updateRole(@PathVariable String username, @RequestBody Map<String, String> body, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a != null && "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
        }

        String roleValue = body == null ? null : body.get("role");
        if (roleValue == null || roleValue.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "role is required"));
        }

        Role role;
        try {
            role = Role.valueOf(roleValue.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }

        authService.updateUserRole(username, role);
        return ResponseEntity.ok(Map.of("message", "Role updated"));
    }

    // POST /api/auth/users - Create user (admin only)
    @PostMapping("/users")
    public ResponseEntity<?> adminCreateUser(@Valid @RequestBody AdminCreateUserRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a != null && "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
        }

        Role role = Role.USER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = Role.valueOf(request.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
            }
        }

        try {
            authService.adminCreateUser(request, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "User created",
                    "username", request.getUsername(),
                    "role", role.name()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/auth/users/{username} - Delete user (admin only)
    @DeleteMapping("/users/{username}")
    public ResponseEntity<?> adminDeleteUser(@PathVariable String username, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a != null && "ROLE_ADMIN".equals(a.getAuthority()));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
        }

        try {
            authService.adminDeleteUser(username);
            return ResponseEntity.ok(Map.of("message", "User deleted", "username", username));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
