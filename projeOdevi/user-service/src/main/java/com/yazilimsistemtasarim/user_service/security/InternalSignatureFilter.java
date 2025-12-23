package com.yazilimsistemtasarim.user_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Component
public class InternalSignatureFilter extends OncePerRequestFilter {

    private static final long MAX_SKEW_MS = 5 * 60 * 1000L;

    @Value("${internal.signature.secret}")
    private String internalSignatureSecret;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null) {
            return true;
        }

        if (!path.startsWith("/api/users")) {
            return true;
        }

        return path.startsWith("/api/users/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader("X-User-Id");
        String roles = request.getHeader("X-Roles");
        String timestamp = request.getHeader("X-Internal-Timestamp");
        String signature = request.getHeader("X-Internal-Signature");

        if (isBlank(userId) || isBlank(timestamp) || isBlank(signature)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        long ts;
        try {
            ts = Long.parseLong(timestamp);
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        long now = System.currentTimeMillis();
        if (Math.abs(now - ts) > MAX_SKEW_MS) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String expected;
        try {
            expected = sign(request, userId, roles, timestamp);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        if (expected == null || !MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8))) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String sign(HttpServletRequest request, String userId, String roles, String timestamp) {
        String method = request.getMethod() == null ? "" : request.getMethod();
        String path = request.getRequestURI() == null ? "" : request.getRequestURI();
        String query = request.getQueryString() == null ? "" : request.getQueryString();
        String rolesValue = roles == null ? "" : roles;

        String payload = method + "\n" + path + "\n" + query + "\n" + userId + "\n" + rolesValue + "\n" + timestamp;

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(internalSignatureSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(raw);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
