# ⚡ JourneyBuddy FastAPI Microservice

A high-throughput asynchronous Python microservice handling parametric data validation, automated schema serialization, and API contract specifications for JourneyBuddy.

---

## 1. Overview & Purpose
FastAPI is an asynchronous Python web framework engineered for building high-throughput APIs. In modern AI architectures, Python serves as the primary environment for machine learning models, vector retrieval, and agent frameworks (such as LangChain). 

This microservice acts as an inference and schema-enforcing data microservice positioned alongside the Node.js API gateway. It utilizes standard Python type hints via Pydantic to enforce strict data contracts, automate request validation, and dynamically generate interactive OpenAPI documentation.

---

## 2. Architecture & Data Flow

```text
Incoming HTTP Request
         │
         ▼
[ Uvicorn ASGI Server (Port 8000) ]
         │
         ▼
[ FastAPI / Pydantic Validation Engine ]
         │
         ├── Validate Path Parameter (`entity_id`: int, 1 <= id <= 99999)
         ├── Validate Query Parameter (`category`: str, pattern="^[a-zA-Z_-]+$")
         └── Validate Query Parameter (`max_budget`: float, 0.0 < budget <= 50000.0)
         │
    ┌────┴───────────────────────────────────────┐
    │                                            │
[Payload Valid]                         [Payload Malformed]
    │                                            │
    ▼                                            ▼
Route Handler Execution                 Automated Error Serialization Path
(HTTP 200 OK)                           (HTTP 422 Unprocessable Entity)
    │                                            │
    ▼                                            ▼
Serialized JSON Response                RFC-Compliant Structured Error JSON
(Matches DestinationRecord Schema)       (Identifies Field, Type & Input)