package com.simulator.controller;

import com.simulator.model.*;
import com.simulator.service.experiment.ExperimentEngine;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/experiments")
public class ExperimentController {

    private final ExperimentEngine experimentEngine;

    public ExperimentController(ExperimentEngine experimentEngine) {
        this.experimentEngine = experimentEngine;
    }

    @PostMapping
    public ResponseEntity<Experiment> createExperiment(@RequestBody CreateExperimentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(experimentEngine.createExperiment(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Experiment> getExperiment(@PathVariable String id) {
        return ResponseEntity.ok(experimentEngine.getExperiment(id));
    }

    @GetMapping
    public ResponseEntity<List<Experiment>> getAllExperiments() {
        return ResponseEntity.ok(experimentEngine.getAllExperiments());
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<String> startExperiment(@PathVariable String id) {
        experimentEngine.startExperiment(id);
        return ResponseEntity.accepted().body("Experiment started: " + id);
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<String> stopExperiment(@PathVariable String id) {
        experimentEngine.stopExperiment(id);
        return ResponseEntity.ok("Experiment stopped: " + id);
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<List<ExperimentEvent>> getExperimentEvents(@PathVariable String id) {
        return ResponseEntity.ok(experimentEngine.getExperimentEvents(id));
    }
}
