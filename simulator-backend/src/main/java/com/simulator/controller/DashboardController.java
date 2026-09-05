package com.simulator.controller;

import com.simulator.model.Experiment;
import com.simulator.model.Experiment.ExperimentStatus;
import com.simulator.repository.ExperimentRepository;
import com.simulator.service.failure.FailureInjectionEngine;
import com.simulator.service.traffic.TrafficGenerator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ExperimentRepository experimentRepository;
    private final FailureInjectionEngine failureEngine;
    private final TrafficGenerator trafficGenerator;

    public DashboardController(ExperimentRepository experimentRepository, FailureInjectionEngine failureEngine,
                               TrafficGenerator trafficGenerator) {
        this.experimentRepository = experimentRepository;
        this.failureEngine = failureEngine;
        this.trafficGenerator = trafficGenerator;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        var all = experimentRepository.findAll();
        dashboard.put("totalExperiments", all.size());
        dashboard.put("runningExperiments", all.stream().filter(e -> e.getStatus() == ExperimentStatus.RUNNING).count());
        dashboard.put("completedExperiments", all.stream().filter(e -> e.getStatus() == ExperimentStatus.COMPLETED).count());
        dashboard.put("activeFailures", failureEngine.getActiveFailures());
        dashboard.put("trafficRunning", trafficGenerator.isRunning());
        dashboard.put("trafficStats", trafficGenerator.getStats());
        return ResponseEntity.ok(dashboard);
    }
}
