package com.yazilimsistemtasarim.auth_service.config;

import com.yazilimsistemtasarim.auth_service.entity.Role;
import com.yazilimsistemtasarim.auth_service.entity.User;
import com.yazilimsistemtasarim.auth_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository,
                                       PasswordEncoder passwordEncoder,
                                       @Value("${admin.seed.username:}") String username,
                                       @Value("${admin.seed.password:}") String password,
                                       @Value("${admin.seed.email:}") String email) {
        return args -> {
            if (username == null || username.isBlank() || password == null || password.isBlank()) {
                return;
            }

            if (userRepository.existsByUsername(username)) {
                return;
            }

            User admin = new User();
            admin.setUsername(username);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setEmail((email == null || email.isBlank()) ? (username + "@admin.local") : email);
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
        };
    }
}
