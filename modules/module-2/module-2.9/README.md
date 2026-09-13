# ☁️ Module 2.9: Google Cloud Platform (GCP) Deployment Architecture

Serverless multi-service container hosting and automated deployment specification for JourneyBuddy using Google Cloud Build, Artifact Registry, and Google Cloud Run.

---

## 1. Cloud Architectural Topology

In Module 2.9, JourneyBuddy transitions from local execution to a distributed, serverless cloud architecture on Google Cloud Platform (GCP).

Using **Google Cloud Run**, each microservice runs as a stateless, independently scalable containerized service behind managed HTTPS ingress:

```text
                           INTERNET TRAFFIC
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │        Cloud Run Services         │
                │        (Managed HTTPS, Auto-Scale)│
                └─────────────────┬─────────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────────┐
│   frontend   │ ───────► │   backend    │ ───────► │ fastapi-service  │
│  (Next.js)   │  Client  │  (Express)   │ Internal │    (FastAPI)     │
│  Port: 3000  │  Reqs    │  Port: 5000  │ RPC      │    Port: 8000    │
└──────────────┘          └───────┬──────┘          └──────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
      ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
      │MongoDB Atlas │    │   Pinecone   │    │Upstash Redis │
      │(Collections) │    │(Vector Index)│    │(Rate / State)│
      └──────────────┘    └──────────────┘    └──────────────┘