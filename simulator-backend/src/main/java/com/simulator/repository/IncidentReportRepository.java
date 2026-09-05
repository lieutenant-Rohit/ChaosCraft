package com.simulator.repository;

import com.simulator.model.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, String> {
    List<IncidentReport> findByExperimentId(String experimentId);
}
