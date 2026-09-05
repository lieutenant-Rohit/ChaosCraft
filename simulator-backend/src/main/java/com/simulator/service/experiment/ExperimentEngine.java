package com.simulator.service.experiment;

import com.simulator.model.*;
import com.simulator.model.Experiment.ExperimentStatus;
import com.simulator.model.ExperimentEvent.EventType;
import com.simulator.repository.ExperimentEventRepository;
import com.simulator.repository.ExperimentRepository;
import com.simulator.service.failure.FailureInjectionEngine;
import com.simulator.service.incident.IncidentReportEngine;
import com.simulator.service.traffic.TrafficGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Service
public class ExperimentEngine {

    private static final Logger log = LoggerFactory.getLogger(ExperimentEngine.class);
    private final ExperimentRepository experimentRepository;
    private final ExperimentEventRepository eventRepository;
    private final FailureInjectionEngine failureEngine;
    private final TrafficGenerator trafficGenerator;
    private final IncidentReportEngine incidentReportEngine;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final ConcurrentHashMap<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    public ExperimentEngine(ExperimentRepository experimentRepository, ExperimentEventRepository eventRepository,
                            FailureInjectionEngine failureEngine, TrafficGenerator trafficGenerator,
                            IncidentReportEngine incidentReportEngine) {
        this.experimentRepository = experimentRepository;
        this.eventRepository = eventRepository;
        this.failureEngine = failureEngine;
        this.trafficGenerator = trafficGenerator;
        this.incidentReportEngine = incidentReportEngine;
    }

    public Experiment createExperiment(CreateExperimentRequest request) {
        Experiment experiment = new Experiment();
        experiment.setName(request.name());
        experiment.setDescription(request.description());
        experiment.setTargetService(request.targetService());
        experiment.setFailureType(request.failureType());
        experiment.setFailureParameters(request.failureParameters());
        experiment.setTrafficRps(request.trafficRps());
        experiment.setDurationSeconds(request.durationSeconds());
        experiment.setExpectedBehavior(request.expectedBehavior());
        experiment.setStatus(ExperimentStatus.CREATED);
        experiment = experimentRepository.save(experiment);
        log.info("Created experiment: {} ({})", experiment.getName(), experiment.getId());
        return experiment;
    }

    @Async
    public void startExperiment(String experimentId) {
        Experiment experiment = experimentRepository.findById(experimentId)
                .orElseThrow(() -> new RuntimeException("Experiment not found: " + experimentId));
        if (experiment.getStatus() != ExperimentStatus.CREATED) {
            throw new IllegalStateException("Experiment not in CREATED state: " + experiment.getStatus());
        }
        experiment.setStatus(ExperimentStatus.RUNNING);
        experiment.setStartedAt(LocalDateTime.now());
        experimentRepository.save(experiment);
        recordEvent(experiment, EventType.EXPERIMENT_STARTED, experiment.getTargetService(), "Experiment started");

        try {
            Map<String, String> failureParams = parseParameters(experiment.getFailureParameters());
            failureEngine.injectFailure(experiment.getTargetService(), experiment.getFailureType(), failureParams);
            recordEvent(experiment, EventType.FAILURE_INJECTED, experiment.getTargetService(),
                    "Injected " + experiment.getFailureType() + " failure");

            if (experiment.getTrafficRps() != null && experiment.getTrafficRps() > 0) {
                String targetUrl = "http://demo-app:8085";
                int concurrency = Math.min(experiment.getTrafficRps(), 200);
                TrafficConfig config = new TrafficConfig("/api/orders", experiment.getTrafficRps(),
                        experiment.getDurationSeconds(), concurrency, "GET", null, targetUrl);
                trafficGenerator.startTraffic(config);
                recordEvent(experiment, EventType.TRAFFIC_STARTED, "traffic-generator",
                        "Started traffic at " + experiment.getTrafficRps() + " req/s");
            }

            int duration = experiment.getDurationSeconds() != null ? experiment.getDurationSeconds() : 60;
            ScheduledFuture<?> task = scheduler.schedule(() -> stopExperiment(experimentId), duration, TimeUnit.SECONDS);
            scheduledTasks.put(experimentId, task);
        } catch (Exception e) {
            log.error("Failed to start experiment: {}", experimentId, e);
            experiment.setStatus(ExperimentStatus.FAILED);
            experimentRepository.save(experiment);
        }
    }

    public void stopExperiment(String experimentId) {
        Experiment experiment = experimentRepository.findById(experimentId)
                .orElseThrow(() -> new RuntimeException("Experiment not found: " + experimentId));
        ScheduledFuture<?> task = scheduledTasks.remove(experimentId);
        if (task != null) task.cancel(false);

        failureEngine.removeAllFailures(experiment.getTargetService());
        recordEvent(experiment, EventType.FAILURE_REMOVED, experiment.getTargetService(), "All failures removed");

        trafficGenerator.stopTraffic();
        recordEvent(experiment, EventType.TRAFFIC_STOPPED, "traffic-generator", "Traffic stopped");

        experiment.setStatus(ExperimentStatus.COMPLETED);
        experiment.setCompletedAt(LocalDateTime.now());
        experimentRepository.save(experiment);
        recordEvent(experiment, EventType.EXPERIMENT_COMPLETED, experiment.getTargetService(), "Experiment completed");

        try { incidentReportEngine.generateReport(experiment); } catch (Exception e) { log.error("Failed to generate report", e); }
        log.info("Experiment completed: {}", experiment.getName());
    }

    public Experiment getExperiment(String id) {
        return experimentRepository.findById(id).orElseThrow(() -> new RuntimeException("Experiment not found: " + id));
    }

    public List<Experiment> getAllExperiments() { return experimentRepository.findAll(); }

    public List<ExperimentEvent> getExperimentEvents(String experimentId) {
        return eventRepository.findByExperimentId(experimentId);
    }

    private void recordEvent(Experiment experiment, EventType eventType, String service, String details) {
        ExperimentEvent event = new ExperimentEvent();
        event.setExperiment(experiment);
        event.setEventType(eventType);
        event.setService(service);
        event.setDetails(details);
        eventRepository.save(event);
    }

    private Map<String, String> parseParameters(String paramString) {
        Map<String, String> params = new HashMap<>();
        if (paramString == null || paramString.isBlank()) return params;
        for (String pair : paramString.split(",")) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) params.put(kv[0].trim(), kv[1].trim());
        }
        return params;
    }
}
