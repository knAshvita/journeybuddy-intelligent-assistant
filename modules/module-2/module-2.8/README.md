cd D:\journey-buddy
New-Item -ItemType Directory -Force -Path "modules\module-2.8"

@'
# 🐳 Module 2.8: Docker Multi-Stage Containerization

Production-grade multi-stage Docker container specifications and Docker Compose multi-service orchestration for the JourneyBuddy Intelligent Assistant architecture.

---

## 1. Architectural Purpose & Separation of Concerns

JourneyBuddy is a polyglot microservice system combining Node.js/Express (Gateway), Python/FastAPI (Schema & Inference), and Next.js (Web Client). Containerization provides:
* **Environment Parity:** Eliminates runtime, dependency, and operating system discrepancies between development and production.
* **Isolated Networking:** Microservices communicate across an internal private bridge network (`journeybuddy-network`).
* **Multi-Stage Optimization:** Separates build-time dependencies (compilers, npm cache, temporary artifacts) from the minimal production execution image to minimize security attack surfaces and memory footprint.

```text
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER HOST SYSTEM                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Bridge Network: journeybuddy-network          │  │
│  │                                                       │  │
│  │   ┌────────────────┐         ┌────────────────────┐   │  │
│  │   │   frontend     │ ──────► │     backend        │   │  │
│  │   │  (Port 3000)   │  HTTP   │   (Port 5000)      │   │  │
│  │   └────────────────┘         └─────────┬──────────┘   │  │
│  │                                        │              │  │
│  │                                        ▼              │  │
│  │                              ┌────────────────────┐   │  │
│  │                              │  fastapi-service   │   │  │
│  │                              │   (Port 8000)      │   │  │
│  │                              └────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘