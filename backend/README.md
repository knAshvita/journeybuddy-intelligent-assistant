# JourneyBuddy Backend Gateway

## Module 2 — Node.js & Middleware Architecture

The JourneyBuddy backend is an independent Node.js and Express gateway service
that acts as the communication layer between the Next.js frontend and the
future backend services of the JourneyBuddy Intelligent Travel Assistant.

The gateway currently provides:

- HTTP request routing
- Custom telemetry middleware
- Request latency measurement
- Gateway health monitoring
- Dynamic query ingestion
- JSON request parsing
- CORS support
- Development-time hot reloading with Nodemon

---

## 1. Purpose

The purpose of Module 2 is to establish the backend gateway architecture
required for JourneyBuddy.

The frontend and backend are intentionally decoupled and communicate over
HTTP.

```text
Next.js Frontend
localhost:3000
       |
       | HTTP + CORS
       v
Node.js Express Gateway
localhost:5000
       |
       +---- Telemetry Middleware
       |
       +---- GET /api/telemetry
       |
       +---- POST /api/query

### Request Flow

All incoming requests pass through the telemetry middleware before reaching
their respective route handlers.

```text
Request
   ↓
Telemetry Middleware
   ↓
Route Handler
   ↓
Response
   ↓
Telemetry Logging
   




