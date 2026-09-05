# ChaosCraft

A chaos engineering platform for simulating production incidents, injecting faults into microservices, and generating incident reports with root cause analysis.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────┐
│  Simulator   │────▶│  Simulator       │────▶│  Redis   │
│  UI (React)  │     │  Backend (Java)  │     │          │
└─────────────┘     └──────────────────┘     └────┬────┘
                                                   │
                     ┌──────────────────┐          │
                     │  Demo App        │◀─────────┘
                     │  (Spring Boot)   │
                     └──────────────────┘
                            │
                     ┌──────▼──────┐
                     │  Prometheus  │──▶ Grafana
                     └─────────────┘
```

**How it works:** The simulator backend writes failure state to Redis. The demo-app reads that state on every request and behaves accordingly (latency, errors, crashes). A built-in traffic generator sends load while experiments run.

## Services

| Service | Port | Description |
|---------|------|-------------|
| Simulator UI | [localhost:13000](http://localhost:13000) | React dashboard for managing experiments |
| Simulator Backend | localhost:18090 | Control plane API (experiments, failures, traffic) |
| Demo App | localhost:18085 | Target microservice with mock e-commerce endpoints |
| Redis | localhost:16379 | State store for failure injection |
| Grafana | [localhost:13001](http://localhost:13001) | Monitoring dashboards (admin/admin) |
| Prometheus | [localhost:9091](http://localhost:9091) | Metrics collection |

## Quick Start

### Prerequisites

- Docker and Docker Compose

### Run

```bash
docker-compose up -d
```

Open [http://localhost:13000](http://localhost:13000) to access the dashboard.

### Stop

```bash
docker-compose down
```

## Features

### Experiment Management
Create and run chaos experiments with configurable parameters — target service, failure type, duration, and traffic load.

### Fault Injection
- **Latency** — Add configurable delays (default: 3000ms)
- **Error Injection** — Return HTTP 500/503 at a specified error rate
- **Service Kill** — Crash the target service entirely

### Traffic Generation
Controlled load generation with configurable RPS, duration, and concurrency. Real-time stats include P50/P95/P99 latency percentiles.

### Incident Reports
Auto-generated after each experiment with root cause analysis, affected services, error rates, latency breakdown, and resilience mechanism findings.

## API Endpoints

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | System overview (experiment counts, active failures, traffic stats) |

### Experiments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/experiments` | Create a new experiment |
| GET | `/api/experiments` | List all experiments |
| GET | `/api/experiments/{id}` | Get experiment details |
| POST | `/api/experiments/{id}/start` | Start an experiment |
| POST | `/api/experiments/{id}/stop` | Stop a running experiment |
| GET | `/api/experiments/{id}/events` | Get experiment event timeline |

### Failure Injection
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/failures/inject` | Inject a fault |
| DELETE | `/api/failures/{service}/{type}` | Remove a specific failure |
| DELETE | `/api/failures/{service}` | Remove all failures from a service |
| GET | `/api/failures/active` | List active failures |

### Traffic
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/traffic/start` | Start traffic generator |
| POST | `/api/traffic/stop` | Stop traffic generator |
| GET | `/api/traffic/stats` | Get traffic statistics |

### Incidents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | List all incident reports |
| GET | `/api/incidents/{id}` | Get incident report by ID |
| GET | `/api/incidents/experiment/{id}` | Get reports by experiment |

### Demo App
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List mock orders |
| POST | `/api/orders` | Create a mock order |
| GET | `/api/payments` | List mock payments |
| GET | `/api/inventory` | List mock inventory |
| GET | `/api/health` | Health check with pool stats |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.2.5, Spring Data JPA |
| Frontend | React 18, Vite, Tailwind CSS, React Router 6 |
| Database | H2 (in-memory), Redis 7 |
| Monitoring | Prometheus, Grafana |
| Containers | Docker, Docker Compose |

## Project Structure

```
Product-Incident-Simulator/
├── docker-compose.yml
├── infrastructure/
│   └── prometheus.yml
├── demo-app/                    # Target microservice (Spring Boot)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/demo/
├── simulator-backend/           # Control plane API (Spring Boot)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/simulator/
└── simulator-ui/                # Dashboard (React + Vite)
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
```

## License

MIT
