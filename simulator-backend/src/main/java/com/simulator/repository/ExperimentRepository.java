package com.simulator.repository;

import com.simulator.model.Experiment;
import com.simulator.model.Experiment.ExperimentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExperimentRepository extends JpaRepository<Experiment, String> {
    List<Experiment> findByStatus(ExperimentStatus status);
}
