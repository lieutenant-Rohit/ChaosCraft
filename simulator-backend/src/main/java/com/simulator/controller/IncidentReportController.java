package com.simulator.controller;

import com.simulator.model.IncidentReport;
import com.simulator.repository.IncidentReportRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentReportController {

    private final IncidentReportRepository reportRepository;

    public IncidentReportController(IncidentReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping
    public ResponseEntity<List<IncidentReport>> getAllReports() {
        return ResponseEntity.ok(reportRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentReport> getReport(@PathVariable String id) {
        return reportRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/experiment/{experimentId}")
    public ResponseEntity<List<IncidentReport>> getReportsByExperiment(@PathVariable String experimentId) {
        return ResponseEntity.ok(reportRepository.findByExperimentId(experimentId));
    }
}
