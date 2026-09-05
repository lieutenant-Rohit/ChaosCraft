package com.demo.controller;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api")
public class DemoController {

    private final StringRedisTemplate redisTemplate;
    private final Random random = new Random();

    private final Semaphore dbConnectionPool = new Semaphore(50, true);
    private final AtomicLong requestCount = new AtomicLong(0);
    private final AtomicLong timeoutCount = new AtomicLong(0);

    public DemoController(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getOrders() {
        if (isKilled("demo-app")) throw new RuntimeException("Service is down");
        simulateLatency("demo-app");
        if (!acquireDbConnection()) {
            timeoutCount.incrementAndGet();
            return ResponseEntity.status(503).body(Map.of(
                    "error", "Connection pool exhausted",
                    "timestamp", LocalDateTime.now().toString()));
        }
        try {
            simulateWork(5);
            return ResponseEntity.ok(Map.of(
                    "orders", List.of(Map.of("id", "1", "product", "Widget", "quantity", 5)),
                    "requestCount", requestCount.incrementAndGet(),
                    "timestamp", LocalDateTime.now().toString()));
        } finally {
            releaseDbConnection();
        }
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody(required = false) Map<String, Object> body) {
        if (isKilled("demo-app")) throw new RuntimeException("Service is down");
        simulateLatency("demo-app");
        if (shouldError("demo-app")) {
            return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error", "timestamp", LocalDateTime.now().toString()));
        }
        if (!acquireDbConnection()) {
            timeoutCount.incrementAndGet();
            return ResponseEntity.status(503).body(Map.of(
                    "error", "Connection pool exhausted",
                    "timestamp", LocalDateTime.now().toString()));
        }
        try {
            simulateWork(10);
            return ResponseEntity.ok(Map.of(
                    "orderId", "ORD-" + System.currentTimeMillis(),
                    "status", "CREATED",
                    "requestCount", requestCount.incrementAndGet(),
                    "timestamp", LocalDateTime.now().toString()));
        } finally {
            releaseDbConnection();
        }
    }

    @GetMapping("/payments")
    public ResponseEntity<Map<String, Object>> getPayments() {
        if (isKilled("payment-service")) throw new RuntimeException("Payment service is down");
        simulateLatency("payment-service");
        if (shouldError("payment-service")) {
            return ResponseEntity.status(503).body(Map.of("error", "Payment Service Unavailable", "timestamp", LocalDateTime.now().toString()));
        }
        if (!acquireDbConnection()) {
            timeoutCount.incrementAndGet();
            return ResponseEntity.status(503).body(Map.of(
                    "error", "Connection pool exhausted",
                    "timestamp", LocalDateTime.now().toString()));
        }
        try {
            simulateWork(3);
            return ResponseEntity.ok(Map.of("payments", List.of(Map.of("id", "PAY-1", "amount", 99.99)), "timestamp", LocalDateTime.now().toString()));
        } finally {
            releaseDbConnection();
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventory() {
        if (isKilled("inventory-service")) throw new RuntimeException("Inventory service is down");
        simulateLatency("inventory-service");
        if (!acquireDbConnection()) {
            timeoutCount.incrementAndGet();
            return ResponseEntity.status(503).body(Map.of(
                    "error", "Connection pool exhausted",
                    "timestamp", LocalDateTime.now().toString()));
        }
        try {
            simulateWork(2);
            return ResponseEntity.ok(Map.of("inventory", List.of(Map.of("productId", "WIDGET-1", "stock", 100)), "timestamp", LocalDateTime.now().toString()));
        } finally {
            releaseDbConnection();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "demo-app",
                "dbPoolAvailable", dbConnectionPool.availablePermits(),
                "totalRequests", requestCount.get(),
                "poolTimeouts", timeoutCount.get(),
                "timestamp", LocalDateTime.now().toString()));
    }

    private boolean acquireDbConnection() {
        try {
            return dbConnectionPool.tryAcquire(100, java.util.concurrent.TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    private void releaseDbConnection() {
        dbConnectionPool.release();
    }

    private void simulateWork(int microseconds) {
        long end = System.nanoTime() + microseconds * 1000L;
        while (System.nanoTime() < end) {
            Math.random();
        }
    }

    private boolean isKilled(String service) {
        Object val = redisTemplate.opsForHash().get("simulator:failures:" + service, "killed");
        return "true".equals(val);
    }

    private void simulateLatency(String service) {
        Object val = redisTemplate.opsForHash().get("simulator:failures:" + service, "latency");
        if (val != null) {
            try {
                long ms = Long.parseLong(val.toString());
                if (ms > 0) Thread.sleep(ms);
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }
    }

    private boolean shouldError(String service) {
        Object val = redisTemplate.opsForHash().get("simulator:failures:" + service, "error");
        if (val != null) {
            try { return random.nextInt(100) < Integer.parseInt(val.toString()); }
            catch (NumberFormatException e) { return false; }
        }
        return false;
    }
}
