package com.simulator.service.failure;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ServiceKiller implements FailureInjector {

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, Boolean> killed = new ConcurrentHashMap<>();

    public ServiceKiller(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void inject(String targetService, Map<String, String> parameters) {
        killed.put(targetService, true);
        redisTemplate.opsForHash().put("simulator:failures:" + targetService, "killed", "true");
    }

    @Override
    public void remove(String targetService) {
        killed.remove(targetService);
        redisTemplate.opsForHash().delete("simulator:failures:" + targetService, "killed");
    }

    @Override
    public String getType() { return "SERVICE_KILL"; }

    public boolean isKilled(String targetService) {
        return killed.getOrDefault(targetService, false);
    }
}
