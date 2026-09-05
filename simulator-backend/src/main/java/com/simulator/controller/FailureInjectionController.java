package com.simulator.controller;

import com.simulator.model.FailureInjectionRequest;
import com.simulator.service.failure.FailureInjectionEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/failures")
public class FailureInjectionController {

    private final FailureInjectionEngine failureEngine;

    public FailureInjectionController(FailureInjectionEngine failureEngine) {
        this.failureEngine = failureEngine;
    }

    @PostMapping("/inject")
    public ResponseEntity<String> injectFailure(@RequestBody FailureInjectionRequest request) {
        Map<String, String> params = new HashMap<>();
        if (request.parameters() != null) {
            for (String pair : request.parameters().split(",")) {
                String[] kv = pair.split(":", 2);
                if (kv.length == 2) params.put(kv[0].trim(), kv[1].trim());
            }
        }
        failureEngine.injectFailure(request.targetService(), request.failureType(), params);
        return ResponseEntity.ok("Failure injected: " + request.failureType() + " on " + request.targetService());
    }

    @DeleteMapping("/{targetService}/{failureType}")
    public ResponseEntity<String> removeFailure(@PathVariable String targetService, @PathVariable String failureType) {
        failureEngine.removeFailure(targetService, failureType);
        return ResponseEntity.ok("Failure removed: " + failureType + " from " + targetService);
    }

    @DeleteMapping("/{targetService}")
    public ResponseEntity<String> removeAllFailures(@PathVariable String targetService) {
        failureEngine.removeAllFailures(targetService);
        return ResponseEntity.ok("All failures removed from " + targetService);
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, FailureInjectionEngine.ActiveFailure>> getActiveFailures() {
        return ResponseEntity.ok(failureEngine.getActiveFailures());
    }
}
