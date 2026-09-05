package com.simulator.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "experiments")
public class Experiment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String targetService;

    @Column(nullable = false)
    private String failureType;

    @Column(columnDefinition = "TEXT")
    private String failureParameters;

    private Integer trafficRps;

    private Integer durationSeconds;

    @Column(columnDefinition = "TEXT")
    private String expectedBehavior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExperimentStatus status;

    @OneToMany(mappedBy = "experiment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExperimentEvent> events = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    public enum ExperimentStatus {
        CREATED, RUNNING, COMPLETED, FAILED, STOPPED
    }

    public Experiment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTargetService() { return targetService; }
    public void setTargetService(String targetService) { this.targetService = targetService; }
    public String getFailureType() { return failureType; }
    public void setFailureType(String failureType) { this.failureType = failureType; }
    public String getFailureParameters() { return failureParameters; }
    public void setFailureParameters(String failureParameters) { this.failureParameters = failureParameters; }
    public Integer getTrafficRps() { return trafficRps; }
    public void setTrafficRps(Integer trafficRps) { this.trafficRps = trafficRps; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getExpectedBehavior() { return expectedBehavior; }
    public void setExpectedBehavior(String expectedBehavior) { this.expectedBehavior = expectedBehavior; }
    public ExperimentStatus getStatus() { return status; }
    public void setStatus(ExperimentStatus status) { this.status = status; }
    public List<ExperimentEvent> getEvents() { return events; }
    public void setEvents(List<ExperimentEvent> events) { this.events = events; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
