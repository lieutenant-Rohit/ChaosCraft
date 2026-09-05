package com.simulator.service.failure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class FailureInjectionEngine {

    private static final Logger log = LoggerFactory.getLogger(FailureInjectionEngine.class);
    private final Map<String, FailureInjector> injectors = new HashMap<>();
    private final Map<String, ActiveFailure> activeFailures = new HashMap<>();

    public FailureInjectionEngine(List<FailureInjector> injectorList) {
        for (FailureInjector injector : injectorList) {
            injectors.put(injector.getType(), injector);
        }
        log.info("FailureInjectionEngine initialized with {} injectors: {}", injectors.size(), injectors.keySet());
    }

    public void injectFailure(String targetService, String failureType, Map<String, String> parameters) {
        FailureInjector injector = injectors.get(failureType);
        if (injector == null) {
            throw new IllegalArgumentException("Unknown failure type: " + failureType + ". Available: " + injectors.keySet());
        }
        String key = targetService + ":" + failureType;
        if (activeFailures.containsKey(key)) {
            removeFailure(targetService, failureType);
        }
        log.info("Injecting failure: type={}, service={}, params={}", failureType, targetService, parameters);
        injector.inject(targetService, parameters);
        activeFailures.put(key, new ActiveFailure(targetService, failureType, parameters, System.currentTimeMillis()));
    }

    public void removeFailure(String targetService, String failureType) {
        String key = targetService + ":" + failureType;
        ActiveFailure active = activeFailures.remove(key);
        if (active != null) {
            FailureInjector injector = injectors.get(failureType);
            if (injector != null) {
                log.info("Removing failure: type={}, service={}", failureType, targetService);
                injector.remove(targetService);
            }
        }
    }

    public void removeAllFailures(String targetService) {
        List<String> toRemove = new ArrayList<>();
        for (String key : activeFailures.keySet()) {
            if (key.startsWith(targetService + ":")) {
                toRemove.add(key);
            }
        }
        for (String key : toRemove) {
            String failureType = key.split(":", 2)[1];
            removeFailure(targetService, failureType);
        }
    }

    public Map<String, ActiveFailure> getActiveFailures() {
        return Map.copyOf(activeFailures);
    }

    public record ActiveFailure(String targetService, String failureType, Map<String, String> parameters, long injectedAt) {}
}
