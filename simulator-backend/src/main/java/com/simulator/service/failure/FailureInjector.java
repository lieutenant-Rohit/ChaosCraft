package com.simulator.service.failure;

import java.util.Map;

public interface FailureInjector {
    void inject(String targetService, Map<String, String> parameters);
    void remove(String targetService);
    String getType();
}
