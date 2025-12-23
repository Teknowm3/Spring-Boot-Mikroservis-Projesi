package com.yazilimsistemtasarim.api_gateway.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    @Value("${internal.signature.secret}")
    private String internalSignatureSecret;

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (request.getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }
            
            // Skip JWT check for public endpoints
            if (isPublicEndpoint(request.getPath().toString())) {
                return chain.filter(exchange);
            }

            // Get the authorization header
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "No valid authorization header", HttpStatus.UNAUTHORIZED);
            }

            // Extract the JWT token
            String token = authHeader.substring(7);

            try {
                // Validate the token
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                Jws<Claims> claimsJws = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token);

                // Check token expiration
                Claims claims = claimsJws.getBody();
                if (isTokenExpired(claims)) {
                    return onError(exchange, "Token has expired", HttpStatus.UNAUTHORIZED);
                }

                // Add user details to the request headers
                String username = claims.getSubject();
                Object rolesClaim = claims.get("roles");
                if (rolesClaim == null) {
                    rolesClaim = claims.get("authorities");
                }

                String rolesHeaderValue = null;
                if (rolesClaim instanceof String s) {
                    rolesHeaderValue = s;
                } else if (rolesClaim instanceof Iterable<?> it) {
                    StringBuilder sb = new StringBuilder();
                    for (Object v : it) {
                        if (v == null) {
                            continue;
                        }
                        if (!sb.isEmpty()) {
                            sb.append(',');
                        }
                        sb.append(v);
                    }
                    rolesHeaderValue = sb.isEmpty() ? null : sb.toString();
                }

                ServerHttpRequest modifiedRequest = request.mutate()
                        .headers(headers -> {
                            headers.remove("X-User-Id");
                            headers.remove("X-Roles");
                            headers.remove("X-Internal-Timestamp");
                            headers.remove("X-Internal-Signature");
                        })
                        .header("X-User-Id", username)
                        .build();

                if (rolesHeaderValue != null && !rolesHeaderValue.isBlank()) {
                    modifiedRequest = modifiedRequest.mutate()
                            .header("X-Roles", rolesHeaderValue)
                            .build();
                }

                String timestamp = String.valueOf(System.currentTimeMillis());
                String signature = sign(modifiedRequest, username, rolesHeaderValue, timestamp);

                modifiedRequest = modifiedRequest.mutate()
                        .header("X-Internal-Timestamp", timestamp)
                        .header("X-Internal-Signature", signature)
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (ExpiredJwtException ex) {
                return onError(exchange, "Token has expired", HttpStatus.UNAUTHORIZED);
            } catch (JwtException | IllegalArgumentException e) {
                return onError(exchange, "Invalid token: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            } catch (Exception e) {
                log.error("Unexpected error in JwtAuthenticationFilter", e);
                return onError(exchange, "Authentication failed", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        };
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration() != null && claims.getExpiration().getTime() < System.currentTimeMillis();
    }

    private Mono<Void> onError(ServerWebExchange exchange, String error, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        if (httpStatus == HttpStatus.UNAUTHORIZED) {
            exchange.getResponse().getHeaders().add(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        }
        return exchange.getResponse().setComplete();
    }

    private boolean isPublicEndpoint(String path) {
        if (path == null) {
            return false;
        }
        // Add public endpoints that don't require authentication
        List<String> publicEndpoints = List.of(
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/refresh",
                "/actuator/health",
                "/eureka"
        );
        return publicEndpoints.stream().anyMatch(path::startsWith);
    }

    private String sign(ServerHttpRequest request, String userId, String roles, String timestamp) {
        String method = request.getMethod() == null ? "" : request.getMethod().name();
        String path = request.getURI().getRawPath() == null ? "" : request.getURI().getRawPath();
        String query = request.getURI().getRawQuery() == null ? "" : request.getURI().getRawQuery();
        String rolesValue = roles == null ? "" : roles;

        String payload = method + "\n" + path + "\n" + query + "\n" + userId + "\n" + rolesValue + "\n" + timestamp;

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(internalSignatureSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(raw);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to sign internal request", e);
        }
    }

    public static class Config {
        // Configuration properties can be added here
        // For example: private boolean enabled = true;
        // With getters and setters
    }
}
