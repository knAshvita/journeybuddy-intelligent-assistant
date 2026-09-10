# 🧭 Module 2 — Backend Gateway, Middleware & Authentication

## JourneyBuddy — Intelligent Travel Assistant

This document presents the complete implementation and architectural integration of **Module 2.2 — Node.js & Middleware Architecture** and **Module 2.4 — Firebase Authentication** for the JourneyBuddy Intelligent Travel Assistant.

The implementation combines the **Next.js frontend**, **Firebase Authentication**, and **Node.js/Express backend gateway** into one end-to-end architecture.

The goal of this module is to establish a secure, observable, and authenticated communication layer between the JourneyBuddy user interface and its backend services.

---

# 1. Module Overview

Module 2 consists of two major capabilities:

### Module 2.2 — Node.js & Middleware Architecture

Establishes the backend gateway responsible for:

- HTTP request handling
- API routing
- Middleware execution
- Request telemetry
- Request latency measurement
- JSON request processing
- Frontend ↔ backend communication

### Module 2.4 — Firebase Authentication

Establishes the identity and authentication layer responsible for:

- User registration
- User login
- Google Sign-In
- Authentication state
- Firebase ID token generation
- Bearer-token transmission
- Backend token verification
- Protected API access
- Authenticated user identification

Together, these modules create the following pipeline:

```text
Next.js Frontend
       ↓
Firebase Authentication
       ↓
Firebase ID Token
       ↓
Node.js / Express Gateway
       ↓
Telemetry Middleware
       ↓
Firebase Admin Authentication
       ↓
Protected API Route
       ↓
Response

## 2. End-to-End System Architecture

The following architecture illustrates the complete integration between the JourneyBuddy Next.js frontend, Firebase Authentication, Node.js/Express backend gateway, telemetry middleware, authentication middleware, and protected API routes.

```text
                         JOURNEYBUDDY 
                              │ 
                              ▼ 
                ┌──────────────────────────┐ 
                │    Next.js Frontend      │ 
                │        Port 3000         │ 
                └────────────┬─────────────┘ 
                             │ 
                ┌────────────┴────────────┐ 
                │                         │ 
                │ Authentication          │ API Requests 
                ▼                         ▼ 
       ┌──────────────────┐      ┌────────────────────────┐ 
       │ Firebase         │      │ Node.js / Express      │ 
       │ Authentication   │      │ Gateway :5000          │ 
       └────────┬─────────┘      └───────────┬────────────┘ 
                │                            │ 
                │ Firebase ID Token          ▼ 
                │                  ┌──────────────────────┐ 
                │                  │ Telemetry Middleware  │ 
                │                  └──────────┬───────────┘ 
                │                             │ 
                │                             ▼ 
                │                  ┌──────────────────────┐ 
                │                  │ Authentication       │ 
                │                  │ Middleware            │ 
                │                  │ verifyToken           │ 
                │                  └──────────┬───────────┘ 
                │                             │ 
                │                             ▼ 
                │                  ┌──────────────────────┐ 
                │                  │ Firebase Admin SDK   │ 
                │                  │ Token Verification   │ 
                │                  └──────────┬───────────┘ 
                │                             │ 
                └─────────────────────────────┤ 
                                              ▼ 
                                  ┌──────────────────────┐ 
                                  │ API Route Handlers   │ 
                                  └──────────┬───────────┘ 
                                             │ 
                                             ▼ 
                                  ┌──────────────────────┐ 
                                  │ HTTP Response         │ 
                                  └──────────┬───────────┘ 
                                             │ 
                                             ▼ 
                                  res.on("finish") 
                                             │ 
                                             ▼ 
                                  Telemetry Logging