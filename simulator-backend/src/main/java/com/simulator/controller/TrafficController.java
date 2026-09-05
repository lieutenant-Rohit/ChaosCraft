package com.simulator.controller;

import com.simulator.model.TrafficConfig;
import com.simulator.service.traffic.TrafficGenerator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/traffic")
public class TrafficController {

    private final TrafficGenerator trafficGenerator;

    public TrafficController(TrafficGenerator trafficGenerator) {
        this.trafficGenerator = trafficGenerator;
    }

    @PostMapping("/start")
    public ResponseEntity<String> startTraffic(@RequestBody TrafficConfig config) {
        trafficGenerator.startTraffic(config);
        return ResponseEntity.ok("Traffic started");
    }

    @PostMapping("/stop")
    public ResponseEntity<String> stopTraffic() {
        trafficGenerator.stopTraffic();
        return ResponseEntity.ok("Traffic stopped");
    }

    @GetMapping("/stats")
    public ResponseEntity<TrafficGenerator.TrafficStats> getStats() {
        return ResponseEntity.ok(trafficGenerator.getStats());
    }
}
