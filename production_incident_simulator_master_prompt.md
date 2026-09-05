# Production Incident Simulator — Master Project Prompt

## Overview

Design and build a production-grade **Production Incident Simulator**: a developer-focused platform that allows users to run a realistic distributed application, inject controlled failures into its infrastructure/services, observe the resulting behavior through metrics, logs, and distributed traces, and generate an incident report explaining what happened.

The goal is **not** to create a fake dashboard. The platform must run a real distributed demo application whose behavior changes when failures are injected.

## Core Concept

The platform should simulate a small production environment containing multiple independently running services.

Initial demo application:

```text
Client
   |
API Gateway
   |
Order Service
   |
   +----------+-------------+
   |          |             |
   v          v             v
Payment    Inventory    Notification
Service     Service       Service
   |          |
   v          v
Payment DB  Inventory DB
```

Infrastructure should also include:

- PostgreSQL
- Redis
- Kafka
- Docker containers

The simulator itself should have a separate control plane responsible for managing experiments and injecting failures.

## Major Components

### 1. Simulator UI

Provide a dashboard showing:

- overall system health
- individual service health
- requests per second
- throughput
- error rate
- P50/P95/P99 latency
- CPU usage
- memory usage
- database connections
- Redis status
- Kafka consumer lag
- active incidents
- active experiments

Users should be able to visually understand how an incident propagates through the system.

### 2. Traffic Generator

Allow users to generate controlled traffic against the demo application.

Configuration:

- target endpoint
- requests per second
- duration
- request distribution
- concurrent users

Example:

```text
Endpoint: POST /orders
Traffic: 500 req/s
Duration: 60 seconds
```

The traffic generator should be able to run continuously while an experiment is active.

### 3. Failure Injection Engine

Users should be able to select a target service/resource and inject failures.

Initial failure types:

#### Service failures

- kill service
- restart service
- pause service

#### Network failures

- add latency
- packet/request loss
- temporary network partition

#### Resource failures

- CPU stress
- memory pressure
- connection pool exhaustion

#### Database failures

- database unavailable
- artificial query latency
- connection exhaustion

#### Redis failures

- Redis unavailable
- artificial latency

#### Kafka failures

- consumer shutdown
- consumer delay
- message backlog

Every injected failure must be tracked as an experiment event.

### 4. Experiment Engine

Users should create experiments rather than manually triggering arbitrary actions.

An experiment should contain:

```text
Experiment Name
Target
Failure Type
Failure Parameters
Traffic Configuration
Duration
Expected Behavior
```

Example:

```text
Experiment:
Payment Service Latency

Target:
Payment Service

Failure:
+3000ms latency

Traffic:
500 requests/sec

Duration:
60 seconds

Expected:
Circuit breaker should open
```

The system should record:

- experiment start time
- failure injection time
- affected components
- metric changes
- experiment end time
- recovery time

### 5. Observability

The platform must provide real observability rather than fabricated metrics.

Collect:

#### Metrics

- request count
- request rate
- error rate
- latency
- CPU
- memory
- database connections
- Kafka consumer lag
- queue depth

#### Logs

Capture structured logs from services.

Example:

```text
timestamp
service
level
requestId
traceId
message
exception
```

#### Distributed Tracing

A request such as:

```text
POST /orders
```

should be traceable through:

```text
API Gateway
    ↓
Order Service
    ↓
Inventory Service
    ↓
Payment Service
```

The UI should make it possible to identify which downstream service caused increased latency or failure.

## Failure Propagation

The most important feature is showing how one failure can affect other components.

Example:

```text
Payment Service
      ↓
High latency
      ↓
Order Service retries
      ↓
Retry amplification
      ↓
Thread pool exhaustion
      ↓
Order Service latency increases
      ↓
Client requests timeout
      ↓
Clients retry
      ↓
Cascading failure
```

The system should visualize this propagation when possible.

## Resilience Mechanisms

The demo application should support configurable resilience mechanisms:

- retries
- exponential backoff
- jitter
- circuit breaker
- timeout
- fallback
- bulkhead
- rate limiting

Users should be able to compare system behavior with and without resilience mechanisms.

Example:

```text
Experiment A:
No circuit breaker

Error Rate: 42%

Experiment B:
Circuit breaker enabled

Error Rate: 8%
```

The simulator should allow the same experiment to be repeated under different configurations.

## Incident Timeline

Automatically construct an incident timeline.

Example:

```text
14:30:00  Normal traffic
14:32:00  Payment latency injected
14:32:10  Payment latency increases
14:32:20  Order retries increase
14:33:00  Error rate increases
14:33:30  Circuit breaker opens
14:34:00  Failure removed
14:34:10  System begins recovery
14:35:00  System returns to baseline
```

## Incident Report

When an experiment ends, generate a report containing:

- incident name
- duration
- affected services
- traffic volume
- error rate
- latency before/during/after incident
- peak resource utilization
- failed requests
- retry count
- circuit breaker state
- Kafka lag
- recovery time
- incident timeline
- likely root cause
- observed impact
- resilience mechanisms triggered

The report should distinguish between:

**Observed facts**

and

**Inferred root cause**

Do not claim a root cause unless there is sufficient evidence.

## Predefined Scenarios

Provide predefined experiments such as:

### Payment Outage

Kill Payment Service.

Expected learning:

- retries
- timeout
- circuit breaker
- cascading failures

### Slow Database

Add database latency.

Expected learning:

- latency propagation
- connection pool pressure
- timeout behavior

### Redis Failure

Disable Redis.

Expected learning:

- cache miss amplification
- database load

### Kafka Consumer Failure

Stop a Kafka consumer.

Expected learning:

- consumer lag
- message accumulation
- recovery

### Retry Storm

Cause downstream failures while aggressive retries are enabled.

Expected learning:

- retry amplification
- exponential backoff
- jitter

### Cascading Failure

Combine multiple failures.

Expected learning:

- dependency chains
- resource exhaustion
- resilience mechanisms
- cascading failures

## Technology Direction

Preferred backend:

- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- PostgreSQL

Infrastructure:

- Docker
- Docker Compose initially
- Redis
- Kafka

Observability:

Use an appropriate open-source observability stack for:

- metrics
- logs
- distributed tracing

The exact technology choices should be evaluated rather than blindly added.

## Architecture Requirements

Keep the simulator/control plane separate from the demo application.

Conceptually:

```text
                  Simulator UI
                       |
                       v
              Simulator Backend
                       |
          +------------+-------------+
          |            |             |
          v            v             v
     Experiment    Failure        Traffic
       Engine       Engine         Engine
          |            |             |
          +------------+-------------+
                       |
                       v
             Demo Distributed System
                       |
          +------------+-------------+
          |            |             |
          v            v             v
      PostgreSQL     Redis          Kafka
          |
          v
     Observability
          |
    +-----+-----+
    |     |     |
  Logs Metrics Traces
    |     |     |
    +-----+-----+
          |
          v
    Incident Engine
          |
          v
    Incident Report
```

## Important Engineering Principles

Do not over-engineer the first version.

Build the system incrementally.

Prioritize:

1. Real distributed demo application
2. Traffic generation
3. Basic failure injection
4. Metrics/logging/tracing
5. Experiment management
6. Incident timeline
7. Incident reporting
8. Advanced failures
9. Advanced resilience analysis

Do not create microservices simply to increase the service count.

Every service should have a clear responsibility.

Use clean architecture and well-defined APIs.

Use asynchronous communication where it provides a meaningful benefit.

Make failures reproducible.

Make experiments repeatable.

Store experiment and incident history.

Design the system so additional failure types can be added without rewriting the existing failure engine.

## Development Approach

Before writing implementation code:

1. Define functional requirements.
2. Define non-functional requirements.
3. Define user journeys.
4. Define the system architecture.
5. Define service boundaries.
6. Define database schemas.
7. Define APIs.
8. Define event contracts.
9. Define experiment lifecycle.
10. Define failure-injection abstraction.
11. Define observability architecture.
12. Define the V1 scope.

Then implement V1 incrementally.

For every architectural decision, explain:

- why it is needed
- alternatives considered
- trade-offs
- scalability implications
- failure implications

## Interview Value

The final system should be something that can be demonstrated during a software-engineering interview and should provide strong discussion topics around:

- distributed systems
- fault tolerance
- concurrency
- retries
- circuit breakers
- eventual consistency
- Kafka
- Redis
- PostgreSQL
- Docker
- observability
- system design
- failure propagation
- resilience engineering
