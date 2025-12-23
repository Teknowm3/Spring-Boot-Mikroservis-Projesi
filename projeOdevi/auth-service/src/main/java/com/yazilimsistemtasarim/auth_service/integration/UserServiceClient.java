package com.yazilimsistemtasarim.auth_service.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${user-service.base-url:http://localhost:8082}")
    private String userServiceBaseUrl;

    @Value("${internal.signature.secret}")
    private String internalSignatureSecret;

    public UserServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void createUserProfile(String username, String email, String role) {
        String path = "/api/users";
        String url = userServiceBaseUrl + path;

        String rolesHeader = role == null || role.isBlank() ? "" : (role.startsWith("ROLE_") ? role : "ROLE_" + role);
        String timestamp = String.valueOf(System.currentTimeMillis());
        String signature = InternalRequestSigner.sign(
                internalSignatureSecret,
                "POST",
                path,
                "",
                "auth-service",
                rolesHeader,
                timestamp
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-User-Id", "auth-service");
        headers.set("X-Roles", rolesHeader);
        headers.set("X-Internal-Timestamp", timestamp);
        headers.set("X-Internal-Signature", signature == null ? "" : signature);

        Map<String, Object> body = Map.of(
                "username", username,
                "email", email,
                "role", role,
                "firstName", "",
                "lastName", "",
                "phone", "",
                "address", ""
        );

        restTemplate.postForEntity(url, new HttpEntity<>(body, headers), String.class);
    }

    public void syncUserRole(String username, String role) {
        String path = "/api/users/username/" + username + "/role";
        String url = userServiceBaseUrl + path;

        String timestamp = String.valueOf(System.currentTimeMillis());
        String signature = InternalRequestSigner.sign(
                internalSignatureSecret,
                "PUT",
                path,
                "",
                "auth-service",
                "",
                timestamp
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-User-Id", "auth-service");
        headers.set("X-Internal-Timestamp", timestamp);
        headers.set("X-Internal-Signature", signature == null ? "" : signature);

        Map<String, String> body = Map.of("role", role);
        restTemplate.exchange(url, org.springframework.http.HttpMethod.PUT, new HttpEntity<>(body, headers), String.class);
    }

    public void deleteUserProfileByUsername(String username) {
        String path = "/api/users/username/" + username;
        String url = userServiceBaseUrl + path;

        String timestamp = String.valueOf(System.currentTimeMillis());
        String signature = InternalRequestSigner.sign(
                internalSignatureSecret,
                "DELETE",
                path,
                "",
                "auth-service",
                "",
                timestamp
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", "auth-service");
        headers.set("X-Internal-Timestamp", timestamp);
        headers.set("X-Internal-Signature", signature == null ? "" : signature);

        restTemplate.exchange(url, org.springframework.http.HttpMethod.DELETE, new HttpEntity<>(headers), String.class);
    }
}
