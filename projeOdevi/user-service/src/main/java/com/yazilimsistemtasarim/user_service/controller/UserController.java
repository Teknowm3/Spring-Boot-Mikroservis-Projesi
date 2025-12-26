package com.yazilimsistemtasarim.user_service.controller;

import com.yazilimsistemtasarim.user_service.dto.UserProfileDTO;
import com.yazilimsistemtasarim.user_service.entity.UserProfile;
import com.yazilimsistemtasarim.user_service.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private boolean isAdmin(HttpServletRequest request) {
        String roles = request.getHeader("X-Roles");
        if (roles == null || roles.isBlank()) {
            return false;
        }
        return roles.contains("ROLE_ADMIN");
    }

    private String currentUsername(HttpServletRequest request) {
        return request.getHeader("X-User-Id");
    }

    private boolean isAuthServiceInternal(HttpServletRequest request) {
        String caller = currentUsername(request);
        return caller != null && caller.equals("auth-service");
    }

    private String currentRoleOrDefault(HttpServletRequest request) {
        String roles = request.getHeader("X-Roles");
        if (roles != null && roles.contains("ROLE_ADMIN")) {
            return "ADMIN";
        }
        return "USER";
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
    }

    // GET /api/users - Tüm kullanıcıları listele
    @GetMapping
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return forbidden();
        }
        List<UserProfile> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // GET /api/users/me - Kendi profilini getir
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        try {
            String username = currentUsername(request);
            if (username == null || username.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }
            UserProfile user = userService.getUserByUsername(username);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/users/{id} - Tekil kullanıcı getir
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, HttpServletRequest request) {
        try {
            UserProfile user = userService.getUserById(id);
            if (!isAdmin(request)) {
                String me = currentUsername(request);
                if (me == null || me.isBlank() || !me.equals(user.getUsername())) {
                    return forbidden();
                }
            }
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/users/username/{username} - Username ile kullanıcı getir
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username, HttpServletRequest request) {
        try {
            if (!isAdmin(request)) {
                String me = currentUsername(request);
                if (me == null || me.isBlank() || !me.equals(username)) {
                    return forbidden();
                }
            }
            UserProfile user = userService.getUserByUsername(username);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // POST /api/users - Yeni kullanıcı ekle
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserProfileDTO dto, HttpServletRequest request) {
        try {
            if (isAuthServiceInternal(request)) {
                // role comes from auth-service (source of truth)
                if (dto.getRole() == null || dto.getRole().isBlank()) {
                    dto.setRole("USER");
                }
            } else if (!isAdmin(request)) {
                String me = currentUsername(request);
                if (me == null || me.isBlank() || dto.getUsername() == null || !me.equals(dto.getUsername())) {
                    return forbidden();
                }
            } else {
                // admin callers still cannot set arbitrary roles here; role comes from auth-service
            }

            if (!isAuthServiceInternal(request)) {
                dto.setRole("USER");
            }

            UserProfile user = userService.createUser(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/users/{id} - Kullanıcı güncelle (tam güncelleme)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UserProfileDTO dto, HttpServletRequest request) {
        try {
            if (!isAdmin(request)) {
                UserProfile existing = userService.getUserById(id);
                String me = currentUsername(request);
                if (me == null || me.isBlank() || !me.equals(existing.getUsername())) {
                    return forbidden();
                }
                if (dto.getUsername() != null && !me.equals(dto.getUsername())) {
                    return forbidden();
                }
            }

            dto.setRole(null);
            UserProfile user = userService.updateUser(id, dto);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/users/{id} - Kullanıcı sil
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletRequest request) {
        try {
            if (!isAdmin(request)) {
                return forbidden();
            }
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/users/health - Health check
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "user-service"));
    }

    // DELETE /api/users/username/{username} - Internal delete from auth-service
    @DeleteMapping("/username/{username}")
    public ResponseEntity<?> deleteByUsername(@PathVariable String username, HttpServletRequest request) {
        String caller = currentUsername(request);
        if (caller == null || caller.isBlank() || !caller.equals("auth-service")) {
            return forbidden();
        }

        try {
            userService.deleteByUsername(username);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PATCH /api/users/username/{username}/role - Internal role sync from auth-service
    @PatchMapping("/username/{username}/role")
    public ResponseEntity<?> syncRole(@PathVariable String username, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String caller = currentUsername(request);
        if (caller == null || caller.isBlank() || !caller.equals("auth-service")) {
            return forbidden();
        }

        String role = body == null ? null : body.get("role");
        if (role == null || role.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "role is required"));
        }

        UserProfile saved = userService.updateRoleByUsername(username, role);
        return ResponseEntity.ok(saved);
    }
}
