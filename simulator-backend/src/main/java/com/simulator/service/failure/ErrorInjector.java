package com.simulator.service.failure;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ErrorInjector implements FailureInjector {

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, Boolean> active = new ConcurrentHashMap<>();

    public ErrorInjector(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void inject(String targetService, Map<String, String> parameters) {
        String errorRate = parameters.getOrDefault("errorRate", "100");
        active.put(targetService, true);
        redisTemplate.opsForHash().put("simulator:failures:" + targetService, "error", errorRate);
    }

    @Override
    public void remove(String targetService) {
        active.remove(targetService);
        redisTemplate.opsForHash().delete("simulator:failures:" + targetService, "error");
    }

    @Override
    public String getType() { return "ERROR"; }

    public boolean isActive(String targetService) {
        return active.getOrDefault(targetService, false);
    }
}
