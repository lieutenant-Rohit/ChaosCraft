package com.simulator.service.incident;

import com.simulator.model.Experiment;
import com.simulator.model.Experiment.ExperimentStatus;
import com.simulator.model.ExperimentEvent;
import com.simulator.model.IncidentReport;
import com.simulator.repository.ExperimentEventRepository;
import com.simulator.repository.IncidentReportRepository;
import com.simulator.service.traffic.TrafficGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class IncidentReportEngine {

    private static final Logger log = LoggerFactory.getLogger(IncidentReportEngine.class);
    private final IncidentReportRepository reportRepository;
    private final ExperimentEventRepository eventRepository;
    private final TrafficGenerator trafficGenerator;

    public IncidentReportEngine(IncidentReportRepository reportRepository,
                                 ExperimentEventRepository eventRepository,
                                 TrafficGenerator trafficGenerator) {
        this.reportRepository = reportRepository;
        this.eventRepository = eventRepository;
        this.trafficGenerator = trafficGenerator;
    }

    public IncidentReport generateReport(Experiment experiment) {
        List<ExperimentEvent> events = eventRepository.findByExperimentId(experiment.getId());
        TrafficGenerator.TrafficStats stats = trafficGenerator.getStats();

        int durationSeconds = 0;
        if (experiment.getStartedAt() != null && experiment.getCompletedAt() != null) {
            durationSeconds = (int) Duration.between(experiment.getStartedAt(), experiment.getCompletedAt()).getSeconds();
        }

        double errorRate = 0.0;
        if (stats.totalRequests() > 0) {
            errorRate = (double) stats.failedRequests() / stats.totalRequests() * 100;
        }

        String timeline = buildTimeline(events);
        String rootCause = determineRootCause(experiment, stats);
        String impact = determineImpact(experiment, stats, errorRate);
        String resilience = determineResilienceMechanisms(experiment, stats);

        int recoveryTime = calculateRecoveryTime(events, experiment);

        IncidentReport report = new IncidentReport();
        report.setExperiment(experiment);
        report.setIncidentName(experiment.getName() + " Incident");
        report.setDurationSeconds(durationSeconds);
        report.setAffectedServices(experiment.getTargetService());
        report.setErrorRate(Math.round(errorRate * 10.0) / 10.0);
        report.setTotalRequests(stats.totalRequests());
        report.setFailedRequests(stats.failedRequests());
        report.setP50Latency((double) stats.p50Latency());
        report.setP95Latency((double) stats.p95Latency());
        report.setP99Latency((double) stats.p99Latency());
        report.setRecoveryTimeSeconds(recoveryTime);
        report.setIncidentTimeline(timeline);
        report.setLikelyRootCause(rootCause);
        report.setObservedImpact(impact);
        report.setResilienceMechanismsTriggered(resilience);

        report = reportRepository.save(report);
        log.info("Generated incident report for {}: errorRate={}%, total={}, failed={}",
                experiment.getName(), report.getErrorRate(), stats.totalRequests(), stats.failedRequests());
        return report;
    }

    private String determineRootCause(Experiment experiment, TrafficGenerator.TrafficStats stats) {
        String failureType = experiment.getFailureType();
        String service = experiment.getTargetService();

        return switch (failureType) {
            case "SERVICE_KILL" -> "Service " + service + " was completely shut down, causing all requests to fail with connection errors";
            case "LATENCY" -> {
                long injectedLatency = parseLatencyParam(experiment);
                yield "Injected " + injectedLatency + "ms latency on " + service
                        + ", causing request timeouts and connection pool exhaustion under load";
            }
            case "ERROR" -> {
                int errorRate = parseErrorRateParam(experiment);
                yield "Error rate of " + errorRate + "% injected on " + service
                        + ", causing " + stats.failedRequests() + " requests to fail with 5xx responses";
            }
            default -> "Injected failure: " + failureType + " on " + service;
        };
    }

    private String determineImpact(Experiment experiment, TrafficGenerator.TrafficStats stats, double errorRate) {
        String failureType = experiment.getFailureType();
        StringBuilder impact = new StringBuilder();

        impact.append("Failure type ").append(failureType).append(" was injected on ")
              .append(experiment.getTargetService()).append(". ");

        if (stats.totalRequests() > 0) {
            impact.append("Total requests: ").append(stats.totalRequests())
                  .append(", Successful: ").append(stats.successfulRequests())
                  .append(", Failed: ").append(stats.failedRequests())
                  .append(", Error rate: ").append(String.format("%.1f%%", errorRate)).append(". ");
        }

        if (stats.totalRequests() > 0 && stats.p99Latency() > 0) {
            impact.append("Latency impact - P50: ").append(stats.p50Latency()).append("ms, ")
                  .append("P95: ").append(stats.p95Latency()).append("ms, ")
                  .append("P99: ").append(stats.p99Latency()).append("ms.");
        }

        if ("LATENCY".equals(failureType) && stats.failedRequests() > 0) {
            impact.append(" The injected latency caused thread buildup, leading to connection pool exhaustion and cascading failures.");
        }

        return impact.toString();
    }

    private String determineResilienceMechanisms(Experiment experiment, TrafficGenerator.TrafficStats stats) {
        String failureType = experiment.getFailureType();
        StringBuilder mechanisms = new StringBuilder();

        if ("SERVICE_KILL".equals(failureType)) {
            mechanisms.append("No resilience mechanisms triggered - service was completely unavailable");
        } else if ("LATENCY".equals(failureType)) {
            if (stats.failedRequests() > 0) {
                mechanisms.append("Connection pool backpressure active, request timeouts applied");
            } else {
                mechanisms.append("Requests completed with elevated latency but no failures");
            }
        } else if ("ERROR".equals(failureType)) {
            mechanisms.append("Client received error responses, no automatic retry mechanism available");
        } else {
            mechanisms.append("Standard request processing");
        }

        return mechanisms.toString();
    }

    private int calculateRecoveryTime(List<ExperimentEvent> events, Experiment experiment) {
        if (ExperimentStatus.COMPLETED.equals(experiment.getStatus())) {
            return experiment.getDurationSeconds() != null ? experiment.getDurationSeconds() : 0;
        }
        return 0;
    }

    private long parseLatencyParam(Experiment experiment) {
        try {
            String params = experiment.getFailureParameters();
            if (params != null && params.contains("latencyMs")) {
                String value = params.replaceAll(".*latencyMs\\s*:\\s*(\\d+).*", "$1");
                return Long.parseLong(value);
            }
        } catch (Exception e) {
            log.debug("Failed to parse latency param", e);
        }
        return 3000;
    }

    private int parseErrorRateParam(Experiment experiment) {
        try {
            String params = experiment.getFailureParameters();
            if (params != null && params.contains("errorRate")) {
                String value = params.replaceAll(".*errorRate\\s*:\\s*(\\d+).*", "$1");
                return Integer.parseInt(value);
            }
        } catch (Exception e) {
            log.debug("Failed to parse error rate param", e);
        }
        return 100;
    }

    private String buildTimeline(List<ExperimentEvent> events) {
        StringBuilder sb = new StringBuilder();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm:ss");
        for (ExperimentEvent event : events) {
            sb.append(event.getOccurredAt().format(fmt))
              .append("  ").append(event.getEventType())
              .append(" - ").append(event.getService())
              .append(": ").append(event.getDetails()).append("\n");
        }
        return sb.toString();
    }
}
