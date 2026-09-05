package com.simulator.model;

public record TrafficConfig(
    String targetEndpoint,
    Integer requestsPerSecond,
    Integer durationSeconds,
    Integer concurrentUsers,
    String httpMethod,
    String requestBody,
    String targetUrl
) {}
