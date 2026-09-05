package com.simulator.service.traffic;

import com.simulator.model.TrafficConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

@Service
public class TrafficGenerator {

    private static final Logger log = LoggerFactory.getLogger(TrafficGenerator.class);

    private volatile boolean running = false;
    private volatile TrafficConfig currentConfig;
    private ExecutorService workerPool;

    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong successfulRequests = new AtomicLong(0);
    private final AtomicLong failedRequests = new AtomicLong(0);
    private final List<Long> latencySamples = Collections.synchronizedList(new ArrayList<>());
    private final AtomicLong totalLatencyMs = new AtomicLong(0);

    private HttpClient httpClient;

    public void startTraffic(TrafficConfig config) {
        if (running) stopTraffic();
        this.currentConfig = config;
        this.running = true;
        this.totalRequests.set(0);
        this.successfulRequests.set(0);
        this.failedRequests.set(0);
        this.latencySamples.clear();
        this.totalLatencyMs.set(0);

        int rps = config.requestsPerSecond() != null ? config.requestsPerSecond() : 10;
        int duration = config.durationSeconds() != null ? config.durationSeconds() : 30;
        int concurrency = config.concurrentUsers() != null ? config.concurrentUsers() : 50;

        httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .executor(Executors.newVirtualThreadPerTaskExecutor())
                .build();

        workerPool = new ThreadPoolExecutor(
                concurrency, concurrency * 2, 60L, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(rps * 10),
                Thread.ofVirtual().name("traffic-worker-", 0).factory(),
                new ThreadPoolExecutor.CallerRunsPolicy()
        );

        log.info("Starting traffic to {} at {} req/s for {}s (concurrency: {})",
                config.targetEndpoint(), rps, duration, concurrency);

        long intervalMs = Math.max(1, 1000 / rps);
        int batchSize = Math.max(1, (int)(rps / (1000 / intervalMs)));

        Thread schedulerThread = Thread.ofVirtual().name("traffic-scheduler").start(() -> {
            long endTime = System.nanoTime() + TimeUnit.SECONDS.toNanos(duration);
            long sendIntervalNanos = TimeUnit.MILLISECONDS.toNanos(intervalMs);

            while (running && System.nanoTime() < endTime) {
                long cycleStart = System.nanoTime();

                for (int i = 0; i < batchSize; i++) {
                    if (!running) break;
                    workerPool.submit(this::sendRequest);
                }

                long elapsed = System.nanoTime() - cycleStart;
                long sleepNanos = sendIntervalNanos - elapsed;
                if (sleepNanos > 0) {
                    try {
                        TimeUnit.NANOSECONDS.sleep(sleepNanos);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }

            log.info("Traffic duration reached. Shutting down...");
            running = false;
            workerPool.shutdown();
            try {
                workerPool.awaitTermination(30, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                workerPool.shutdownNow();
            }
            log.info("Traffic completed. Total: {}, Success: {}, Failed: {}",
                    totalRequests.get(), successfulRequests.get(), failedRequests.get());
        });
    }

    public void stopTraffic() {
        running = false;
        if (workerPool != null) workerPool.shutdownNow();
    }

    private void sendRequest() {
        if (!running) return;
        totalRequests.incrementAndGet();
        long start = System.nanoTime();
        try {
            String method = currentConfig.httpMethod() != null ? currentConfig.httpMethod() : "GET";
            String baseUrl = currentConfig.targetUrl() != null ? currentConfig.targetUrl() : "http://demo-app:8085";
            String endpoint = currentConfig.targetEndpoint() != null ? currentConfig.targetEndpoint() : "/api/orders";
            String url = baseUrl + endpoint;

            HttpRequest.Builder req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15));

            switch (method.toUpperCase()) {
                case "POST" -> {
                    req.header("Content-Type", "application/json");
                    req.POST(HttpRequest.BodyPublishers.ofString(
                            currentConfig.requestBody() != null ? currentConfig.requestBody() : "{}"));
                }
                case "PUT" -> {
                    req.header("Content-Type", "application/json");
                    req.PUT(HttpRequest.BodyPublishers.ofString(
                            currentConfig.requestBody() != null ? currentConfig.requestBody() : "{}"));
                }
                case "DELETE" -> req.DELETE();
                default -> req.GET();
            }

            HttpResponse<String> resp = httpClient.send(req.build(), HttpResponse.BodyHandlers.ofString());
            long latencyMs = (System.nanoTime() - start) / 1_000_000;
            latencySamples.add(latencyMs);
            totalLatencyMs.addAndGet(latencyMs);

            if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                successfulRequests.incrementAndGet();
            } else {
                failedRequests.incrementAndGet();
            }
        } catch (Exception e) {
            long latencyMs = (System.nanoTime() - start) / 1_000_000;
            latencySamples.add(latencyMs);
            totalLatencyMs.addAndGet(latencyMs);
            failedRequests.incrementAndGet();
        }
    }

    public boolean isRunning() { return running; }

    public TrafficStats getStats() {
        List<Long> sorted = new ArrayList<>(latencySamples);
        Collections.sort(sorted);
        long p50 = percentile(sorted, 50);
        long p95 = percentile(sorted, 95);
        long p99 = percentile(sorted, 99);
        double avgLatency = sorted.isEmpty() ? 0 : (double) totalLatencyMs.get() / sorted.size();
        return new TrafficStats(totalRequests.get(), successfulRequests.get(), failedRequests.get(),
                running, p50, p95, p99, Math.round(avgLatency * 10.0) / 10.0);
    }

    private long percentile(List<Long> sorted, int p) {
        if (sorted.isEmpty()) return 0;
        int index = (int) Math.ceil(p / 100.0 * sorted.size()) - 1;
        return sorted.get(Math.max(0, index));
    }

    public record TrafficStats(long totalRequests, long successfulRequests, long failedRequests,
                               boolean running, long p50Latency, long p95Latency, long p99Latency,
                               double avgLatency) {}
}
