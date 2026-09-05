package com.simulator.service.failure;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LatencyInjector implements FailureInjector {

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, Boolean> active = new ConcurrentHashMap<>();

    public LatencyInjector(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void inject(String targetService, Map<String, String> parameters) {
        String latencyMs = parameters.getOrDefault("latencyMs", "3000");
        active.put(targetService, true);
        redisTemplate.opsForHash().put("simulator:failures:" + targetService, "latency", latencyMs);
    }

    @Override
    public void remove(String targetService) {
        active.remove(targetService);
        redisTemplate.opsForHash().delete("simulator:failures:" + targetService, "latency");
    }

    @Override
    public String getType() { return "LATENCY"; }

    public boolean isActive(String targetService) {
        return active.getOrDefault(targetService, false);
    }
}
