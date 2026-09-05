package com.simulator.repository;

import com.simulator.model.ExperimentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExperimentEventRepository extends JpaRepository<ExperimentEvent, String> {
    List<ExperimentEvent> findByExperimentId(String experimentId);
}
