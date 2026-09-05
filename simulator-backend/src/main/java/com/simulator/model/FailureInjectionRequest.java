package com.simulator.model;

public record FailureInjectionRequest(
    String targetService,
    String failureType,
    String parameters,
    Integer durationSeconds
) {}
