package com.simulator.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "experiment_events")
public class ExperimentEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiment_id", nullable = false)
    @JsonIgnore
    private Experiment experiment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType;

    @Column(nullable = false)
    private String service;

    private String details;

    @CreationTimestamp
    private LocalDateTime occurredAt;

    public enum EventType {
        EXPERIMENT_STARTED, FAILURE_INJECTED, FAILURE_REMOVED, TRAFFIC_STARTED, TRAFFIC_STOPPED, METRIC_CHANGED, INCIDENT_DETECTED, INCIDENT_RESOLVED, EXPERIMENT_COMPLETED
    }

    public ExperimentEvent() {}

    public Experiment getExperiment() { return experiment; }
    public void setExperiment(Experiment experiment) { this.experiment = experiment; }
    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }
    public String getService() { return service; }
    public void setService(String service) { this.service = service; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(LocalDateTime occurredAt) { this.occurredAt = occurredAt; }
}
