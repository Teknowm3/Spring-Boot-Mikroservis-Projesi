package com.yazilimsistemtasarim.api_gateway.config;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class LoginRateLimitFilter extends AbstractGatewayFilterFactory<LoginRateLimitFilter.Config> {

    private static final int LIMIT = 3;
    private static final long WINDOW_MS = 60_000L;
    private static final ConcurrentHashMap<String, Counter> COUNTERS = new ConcurrentHashMap<>();

    public LoginRateLimitFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String ip = resolveClientIp(request);
            String normalizedIp = (ip == null || ip.isBlank()) ? "unknown" : ip;
            long now = System.currentTimeMillis();
            long windowId = now / WINDOW_MS;
            String key = "login:" + normalizedIp + ":" + windowId;

            cleanupOldCounters(windowId);

            int current = COUNTERS.computeIfAbsent(key, k -> new Counter()).count.incrementAndGet();
            if (current > LIMIT) {
                exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                exchange.getResponse().getHeaders().set(HttpHeaders.RETRY_AFTER, "60");
                return exchange.getResponse().setComplete();
            }

            return chain.filter(exchange);
        };
    }

    private void cleanupOldCounters(long currentWindowId) {
        if (COUNTERS.size() < 10_000) {
            return;
        }
        long minWindowId = currentWindowId - 2;
        Iterator<Map.Entry<String, Counter>> it = COUNTERS.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, Counter> e = it.next();
            String k = e.getKey();
            int idx = k.lastIndexOf(':');
            if (idx < 0 || idx + 1 >= k.length()) {
                continue;
            }
            try {
                long win = Long.parseLong(k.substring(idx + 1));
                if (win < minWindowId) {
                    it.remove();
                }
            } catch (NumberFormatException ignored) {
            }
        }
    }

    private String resolveClientIp(ServerHttpRequest request) {
        String xff = request.getHeaders().getFirst("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            String first = xff.split(",")[0].trim();
            if (!first.isBlank()) {
                return first;
            }
        }

        InetSocketAddress remote = request.getRemoteAddress();
        if (remote != null && remote.getAddress() != null) {
            return remote.getAddress().getHostAddress();
        }

        return "unknown";
    }

    public static class Config {
    }

    private static final class Counter {
        private final AtomicInteger count = new AtomicInteger(0);
    }
}
