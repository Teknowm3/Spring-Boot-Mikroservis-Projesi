package com.yazilimsistemtasarim.auth_service.integration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public final class InternalRequestSigner {

    private InternalRequestSigner() {
    }

    public static String sign(String secret, String method, String path, String query, String userId, String roles, String timestamp) {
        String methodValue = method == null ? "" : method;
        String pathValue = path == null ? "" : path;
        String queryValue = query == null ? "" : query;
        String userIdValue = userId == null ? "" : userId;
        String rolesValue = roles == null ? "" : roles;
        String timestampValue = timestamp == null ? "" : timestamp;

        String payload = methodValue + "\n" + pathValue + "\n" + queryValue + "\n" + userIdValue + "\n" + rolesValue + "\n" + timestampValue;

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(raw);
        } catch (Exception e) {
            return null;
        }
    }
}
