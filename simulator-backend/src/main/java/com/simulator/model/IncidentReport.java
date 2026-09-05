package com.simulator.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_reports")
public class IncidentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id", nullable = false)
    @JsonIgnore
    private Experiment experiment;

    @Column(nullable = false)
    private String incidentName;

    private Integer durationSeconds;

    @Column(columnDefinition = "TEXT")
    private String affectedServices;

    private Long totalRequests;

    private Long failedRequests;

    private Double errorRate;

    private Double p50Latency;

    private Double p95Latency;

    private Double p99Latency;

    @Column(columnDefinition = "TEXT")
    private String circuitBreakerState;

    private Integer retryCount;

    private Integer recoveryTimeSeconds;

    @Column(columnDefinition = "TEXT")
    private String incidentTimeline;

    @Column(columnDefinition = "TEXT")
    private String likelyRootCause;

    @Column(columnDefinition = "TEXT")
    private String observedImpact;

    @Column(columnDefinition = "TEXT")
    private String resilienceMechanismsTriggered;

    @CreationTimestamp
    private LocalDateTime generatedAt;

    public IncidentReport() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Experiment getExperiment() { return experiment; }
    public void setExperiment(Experiment experiment) { this.experiment = experiment; }
    public String getIncidentName() { return incidentName; }
    public void setIncidentName(String incidentName) { this.incidentName = incidentName; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getAffectedServices() { return affectedServices; }
    public void setAffectedServices(String affectedServices) { this.affectedServices = affectedServices; }
    public Long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(Long totalRequests) { this.totalRequests = totalRequests; }
    public Long getFailedRequests() { return failedRequests; }
    public void setFailedRequests(Long failedRequests) { this.failedRequests = failedRequests; }
    public Double getErrorRate() { return errorRate; }
    public void setErrorRate(Double errorRate) { this.errorRate = errorRate; }
    public Double getP50Latency() { return p50Latency; }
    public void setP50Latency(Double p50Latency) { this.p50Latency = p50Latency; }
    public Double getP95Latency() { return p95Latency; }
    public void setP95Latency(Double p95Latency) { this.p95Latency = p95Latency; }
    public Double getP99Latency() { return p99Latency; }
    public void setP99Latency(Double p99Latency) { this.p99Latency = p99Latency; }
    public String getCircuitBreakerState() { return circuitBreakerState; }
    public void setCircuitBreakerState(String circuitBreakerState) { this.circuitBreakerState = circuitBreakerState; }
    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }
    public Integer getRecoveryTimeSeconds() { return recoveryTimeSeconds; }
    public void setRecoveryTimeSeconds(Integer recoveryTimeSeconds) { this.recoveryTimeSeconds = recoveryTimeSeconds; }
    public String getIncidentTimeline() { return incidentTimeline; }
    public void setIncidentTimeline(String incidentTimeline) { this.incidentTimeline = incidentTimeline; }
    public String getLikelyRootCause() { return likelyRootCause; }
    public void setLikelyRootCause(String likelyRootCause) { this.likelyRootCause = likelyRootCause; }
    public String getObservedImpact() { return observedImpact; }
    public void setObservedImpact(String observedImpact) { this.observedImpact = observedImpact; }
    public String getResilienceMechanismsTriggered() { return resilienceMechanismsTriggered; }
    public void setResilienceMechanismsTriggered(String resilienceMechanismsTriggered) { this.resilienceMechanismsTriggered = resilienceMechanismsTriggered; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
