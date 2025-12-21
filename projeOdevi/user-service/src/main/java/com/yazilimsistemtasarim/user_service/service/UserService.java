package com.yazilimsistemtasarim.user_service.service;

import com.yazilimsistemtasarim.user_service.dto.UserProfileDTO;
import com.yazilimsistemtasarim.user_service.entity.UserProfile;
import com.yazilimsistemtasarim.user_service.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserProfileRepository userRepository;

    // GET all users
    public List<UserProfile> getAllUsers() {
        return userRepository.findAll();
    }

    // GET user by ID
    public UserProfile getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // GET user by username
    public UserProfile getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    // POST - Create new user
    public UserProfile createUser(UserProfileDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        UserProfile user = new UserProfile();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());

        return userRepository.save(user);
    }

    // PUT - Update user
    public UserProfile updateUser(Long id, UserProfileDTO dto) {
        UserProfile user = getUserById(id);

        // Check if new username/email conflicts with other users
        if (!user.getUsername().equals(dto.getUsername()) && userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());

        return userRepository.save(user);
    }

    // DELETE - Delete user
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
