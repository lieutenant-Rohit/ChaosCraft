package com.simulator.model;

public record CreateExperimentRequest(
    String name,
    String description,
    String targetService,
    String failureType,
    String failureParameters,
    Integer trafficRps,
    Integer durationSeconds,
    String expectedBehavior
) {}
