# 🌍 JourneyBuddy — Intelligent Travel Planning Assistant

> **Dream It. Plan It. Live It.**

JourneyBuddy is an intelligent travel planning assistant designed to help travelers discover destinations, explore experiences, build personalized journeys, and interact with an AI-powered travel companion.

The platform combines a modern **Next.js frontend**, **Node.js/Express API gateway**, **FastAPI microservice**, **Firebase Authentication**, **MongoDB Atlas**, **Pinecone**, **Upstash Redis**, **LangChain**, **Google Gemini**, **Docker**, and **Google Cloud Run** into a complete end-to-end travel intelligence platform.

JourneyBuddy follows a hybrid architecture where traditional databases, vector search, caching, AI retrieval, agentic workflows, authentication, telemetry, and cloud infrastructure work together to provide a scalable and intelligent travel experience.

---

# ✨ Project Vision

JourneyBuddy aims to simplify travel planning by bringing destination discovery, personalized recommendations, itinerary planning, intelligent search, conversational assistance, and travel-related utilities into a single platform.

Instead of requiring users to search multiple websites and manually organize information, JourneyBuddy provides an intelligent travel companion capable of:

- 🗺️ Discovering destinations and attractions
- 🔎 Performing semantic travel searches
- 🤖 Generating personalized recommendations
- 🧠 Building travel plans based on user preferences
- 💬 Maintaining conversational context across multiple turns
- 💰 Calculating group travel budgets dynamically
- 🌐 Discovering new destinations when internal knowledge is insufficient
- 🚌 Providing external transit booking redirects
- 📸 Providing Google photo-search links for destinations
- 🔐 Protecting APIs from abusive traffic
- 📊 Recording operational and user-engagement telemetry
- 🧑‍💼 Providing administrators with an operations portal and customer query desk

---

# 🎯 Core Capabilities

| Capability | Description |
| :--- | :--- |
| 🗺️ **Destination Discovery** | Discover domestic and global destinations and attractions |
| 🔎 **Semantic Vector Search** | Search destinations using embedding-based similarity |
| 🤖 **AI Travel Assistant** | Conversational travel assistance powered by Google Gemini |
| 🧠 **Hybrid RAG** | Combines vector retrieval, document retrieval, and dynamic web discovery |
| 🔄 **Agentic AI Workflows** | Multi-step planning using Plan → Act → Observe → Iterate |
| 💬 **Conversational Memory** | Maintains context such as group size, budget, duration, and preferences |
| 💰 **Group Budget Calculator** | Calculates estimated stays, food, travel, and activity costs |
| 🔐 **Firebase Authentication** | Email/password and Google OAuth authentication |
| 👤 **Traveler & Admin Roles** | Separate traveler and administrative access |
| ⚡ **Redis State Management** | Rate limiting, temporary session state, and agent scratchpads |
| 🗄️ **MongoDB Storage** | Permanent storage for destinations and application data |
| 🧮 **Pinecone Search** | Fast semantic similarity search using vector embeddings |
| 🌐 **Knowledge Expansion** | Adds newly discovered destinations to the internal knowledge base |
| 📊 **Admin Telemetry** | Tracks latency, searches, dwell time, and engagement |
| ⭐ **Customer Reviews** | Traveler feedback and administrative review management |
| 🧑‍💼 **Query Solver Desk** | Allows administrators to manage traveler issues |
| 🐳 **Docker** | Containerized multi-service architecture |
| ☁️ **Google Cloud** | Serverless deployment through Cloud Run and Cloud Build |


---

# 🏗️ High-Level Architecture

JourneyBuddy is organized into multiple runtime layers.

```text
                              ┌──────────────────────┐
                              │        USER          │
                              │   Traveler / Admin   │
                              └──────────┬───────────┘
                                         │
                                         ▼
                         ┌──────────────────────────────┐
                         │       NEXT.JS FRONTEND       │
                         │          Port 3000           │
                         │                              │
                         │  Landing Page & Hero         │
                         │  Travel Portal               │
                         │  Search Bar                  │
                         │  AI Travel Assistant         │
                         │  Feedback Section            │
                         │  Admin Command Center        │
                         └──────────────┬───────────────┘
                                        │
                              Firebase Authentication
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │     EXPRESS API GATEWAY      │
                         │          Port 5000           │
                         │                              │
                         │  CORS                        │
                         │  JWT Verification            │
                         │  Rate Limiting               │
                         │  Telemetry                   │
                         │  Search / RAG Routes         │
                         └──────────────┬───────────────┘
                                        │
                     ┌──────────────────┼──────────────────┐
                     │                  │                  │
                     ▼                  ▼                  ▼
             ┌─────────────┐    ┌──────────────┐   ┌─────────────┐
             │    REDIS    │    │   PINECONE   │   │   FASTAPI   │
             │             │    │              │   │             │
             │ Rate Limit  │    │ Vector Search│   │ Validation  │
             │ Session     │    │ 8D Embeddings│   │ Pydantic    │
             │ Scratchpad  │    │ Cosine Search│   │ Port 8000   │
             └─────────────┘    └──────┬───────┘   └─────────────┘
                                        │
                                  Document IDs
                                        │
                                        ▼
                              ┌──────────────────┐
                              │     MONGODB      │
                              │      ATLAS       │
                              │                  │
                              │ Full Documents   │
                              │ Destinations     │
                              │ User Activities  │
                              │ Reviews / Logs   │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │    LANGCHAIN     │
                              │    + GEMINI AI   │
                              │                  │
                              │ Hybrid RAG       │
                              │ AI Assistant     │
                              │ Agentic Logic    │
                              │ Web Discovery    │
                              └──────────────────┘


```

# 🔄 Complete Request Flow
## A typical JourneyBuddy travel search follows this flow:

User
 │
 │ "Places to visit in Karkala"
 ▼
Next.js Frontend
 │
 ▼
Express API Gateway
 │
 ▼
Redis
 │
 │ Check API rate limit
 │
 ├── Too many requests → HTTP 429
 │
 └── Request allowed
       │
       ▼
   Query Embedding
       │
       ▼
   Pinecone
       │
       │ Semantic Vector Search
       │ Cosine Similarity
       ▼
   Matching Document IDs
       │
       ▼
   MongoDB Atlas
       │
       │ Retrieve complete destination documents
       ▼
   LangChain + Gemini
       │
       ▼
   AI Travel Response
       │
       ▼
   Next.js UI




# 🔄 Complete Request Flow
## A typical JourneyBuddy travel search follows this flow:

| Layer                  | Technology                  | Purpose                                   |
| ---------------------- | --------------------------- | ----------------------------------------- |
| Frontend               | Next.js                     | User interface and application shell      |
| UI                     | React + Tailwind CSS        | Interactive user interface                |
| Backend Gateway        | Node.js + Express           | API routing and middleware                |
| Microservice           | FastAPI + Python            | Validation and Python services            |
| Authentication         | Firebase Authentication     | User login and identity                   |
| Backend Auth           | Firebase Admin SDK          | JWT verification                          |
| Database               | MongoDB Atlas               | Permanent document storage                |
| Vector Database        | Pinecone                    | Semantic vector search                    |
| Database Vector Search | MongoDB Atlas Vector Search | Database-level vector retrieval           |
| Cache / State          | Upstash Redis               | Rate limiting and temporary state         |
| AI Framework           | LangChain                   | AI and retrieval orchestration            |
| AI Model               | Google Gemini               | Conversational AI and knowledge discovery |
| Containers             | Docker                      | Application containerization              |
| Local Orchestration    | Docker Compose              | Multi-container execution                 |
| Cloud                  | Google Cloud Platform       | Cloud infrastructure                      |
| Deployment             | Google Cloud Run            | Serverless container deployment           |
| CI/CD                  | Google Cloud Build          | Automated container builds                |


# 📚 Engineering Curriculum Overview
## JourneyBuddy was implemented systematically across 12 engineering modules, covering frontend architecture, backend services, authentication, databases, vector search, caching, containerization, cloud infrastructure, RAG, agentic AI, and system integration.

| Module   | Title                         | Primary Technologies                        | Core Implemented Functionality                                                                                                               |
| -------- | ----------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **2.1**  | **Frontend Architecture**     | Next.js App Router, React, Tailwind CSS     | Server/Client component boundaries, interactive travel UI, animated hero, search interface, category chips, dark/light theme switching       |
| **2.2**  | **Middleware Gateway**        | Node.js, Express                            | Port 5000 API Gateway, CORS, request telemetry, execution-duration logging, query ingestion routes                                           |
| **2.3**  | **Schema Validation**         | FastAPI, Pydantic, Python 3.11              | Port 8000 microservice, path/query validation, budget constraints, automated HTTP 422 validation responses, Swagger/OpenAPI                  |
| **2.4**  | **Authentication Layer**      | Firebase Auth, Firebase Admin SDK           | Email/password authentication, Google OAuth, Firebase JWT verification, Traveler/Admin role separation                                       |
| **2.5**  | **Persistent Store**          | MongoDB Atlas, Native Node Driver           | `journeybuddy` database, destination documents, metadata storage, 8D vectors, MongoDB `$vectorSearch`                                        |
| **2.6**  | **Dedicated Vector Database** | Pinecone Serverless                         | `journeybuddy-destinations` index, 8D embeddings, cosine similarity, ANN search, MongoDB-to-Pinecone synchronization                         |
| **2.7**  | **In-Memory Data Store**      | Upstash Redis                               | API rate limiting, temporary session state, TTL-based storage, agent scratchpads                                                             |
| **2.8**  | **Containerization**          | Docker, Docker Compose                      | Multi-stage Dockerfiles, isolated service containers, internal bridge network, multi-service orchestration                                   |
| **2.9**  | **Cloud Infrastructure**      | Google Cloud Run, Cloud Build               | Automated image builds, serverless container deployment, `cloudbuild.yaml`, scalable cloud topology                                          |
| **2.10** | **Hybrid RAG Engine**         | LangChain, Google Gemini, Pinecone, MongoDB | Three-tier retrieval, Pinecone → MongoDB → Web/Gemini fallback, anti-hallucination policies, dynamic knowledge expansion                     |
| **2.11** | **Conversational Agent**      | React Context, LangChain, Gemini, Web APIs  | AI assistant modal, multi-turn conversation, contextual destination information, Google photo links, RedBus routing, budget calculations     |
| **2.12** | **Systems Integration**       | Full-Stack Systems, Agentic AI, Telemetry   | Admin telemetry, dwell-time analytics, review synchronization, customer query solver, agentic workflow integration, final system integration |


# 📁 Project Directory Structure

```text
journey-buddy/
│
├── .github/
│   └── workflows/
│
├── backend/
│   ├── agents/
│   │   └── tools/
│   │       └── transportTool.js
│   │
│   ├── langchain/
│   │   ├── llm.js
│   │   ├── ragPipeline.js
│   │   └── retriever.js
│   │
│   ├── lib/
│   │   └── redis.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── rateLimiter.js
│   │
│   ├── queryDestinations.js
│   ├── queryPinecone.js
│   ├── seedDestinations.js
│   ├── server.js
│   ├── syncToPinecone.js
│   ├── testRetriever.js
│   ├── Dockerfile
│   └── package.json
│
├── fastapi-service/
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── AdminPortal.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── BrandLogo.tsx
│   │   │   ├── ChatModal.tsx
│   │   │   ├── FeedbackSection.tsx
│   │   │   ├── LandingHero.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── StatusCard.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── TravelPortal.tsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   └── lib/
│   │       └── firebase.ts
│   │
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── modules/
│   ├── module-2.1/
│   ├── module-2.2/
│   ├── module-2.3/
│   ├── module-2.4/
│   ├── module-2.5/
│   ├── module-2.6/
│   ├── module-2.7/
│   ├── module-2.8/
│   ├── module-2.9/
│   ├── module-2.10/
│   ├── module-2.11/
│   └── module-2.12/
│
├── cloudbuild.yaml
├── docker-compose.yml
└── README.md
└── requirements.txt

```

# 🚀 Getting Started

## Prerequisites

Before running JourneyBuddy locally, make sure the following are installed or configured:

- Node.js v18+
- Python 3.10+
- Docker & Docker Compose
- MongoDB Atlas
- Pinecone
- Firebase
- Upstash Redis
- Google AI Studio / Gemini API

---

## Environment Configuration

### Backend

Create:

`backend/.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=journeybuddy-destinations
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
GEMINI_API_KEY=your_gemini_api_key

```

# Local Installation & Startup

## JourneyBuddy consists of three primary local services:

| Service            | Technology        | Port |
| ------------------ | ----------------- | ---: |
| Frontend           | Next.js           | 3000 |
| Backend Gateway    | Node.js + Express | 5000 |
| Validation Service | FastAPI + Python  | 8000 |

# 1. Start the Backend API Gateway
## Open a terminal

cd backend
npm install
npm run dev

# 2. Start the Next.js Frontend
## Open a second terminal:

cd frontend
npm install
npm run dev

# 3. Start the FastAPI Microservice
## Open a third terminal:

cd fastapi-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Docker Deployment
## From the project root:

docker compose up --build

## To stop the containers:
docker compose down

# 🛡️ Security & Authentication
## JourneyBuddy implements multiple layers of application security.

1. Firebase Authentication provides Email/Password and Google OAuth authentication.
2. Firebase Admin SDK verifies Firebase JWT tokens on protected backend routes.
3. Role-Based Access Control (RBAC) separates Traveler and Admin functionality.
4. Redis Rate Limiting protects APIs and downstream services from excessive requests.
5. Environment Variables are used to store API keys, database credentials, and service configuration.
6. Sensitive files such as .env, .env.local, and Firebase service-account credentials must not be committed to Git.
7. Administrative secrets must be stored securely and should never be exposed in the frontend or public source code.

# 🔐 Recommended Git Protection
## Make sure sensitive configuration files are included in .gitignore:

.env
.env.local
.env.*.local
serviceAccountKey.json
node_modules/
.venv/
__pycache__/


# ☁️ Cloud Deployment
## JourneyBuddy is designed for containerized deployment using Google Cloud Build and Google Cloud Run.
## The project contains:

```text 
Source Code
     │
     ▼
Google Cloud Build
     │
     ├── Next.js Image
     ├── Express Image
     └── FastAPI Image
     │
     ▼
Google Cloud Run
     │
     ├── Frontend Service
     ├── Backend API Service
     └── FastAPI Service
```

# 🏆 Final Project Summary
## JourneyBuddy combines modern full-stack development, cloud infrastructure, vector databases, Retrieval-Augmented Generation, conversational AI, and agentic workflows into a unified intelligent travel planning platform.

```text
Next.js
   ↓
User Interface

Express
   ↓
API Gateway & Backend Coordination

FastAPI
   ↓
Schema Validation

Firebase
   ↓
Authentication

Redis
   ↓
Temporary State & Rate Limiting

Pinecone
   ↓
Semantic Vector Search

MongoDB
   ↓
Persistent Application Data

LangChain
   ↓
AI & RAG Orchestration

Gemini
   ↓
AI Reasoning & Knowledge Discovery

Docker
   ↓
Containerization

Google Cloud Run
   ↓
Cloud Deployment
```

# 📄 License
## This project is developed as part of an applied engineering curriculum exploring modern full-stack development, vector databases, Retrieval-Augmented Generation, and agentic AI architectures.

All rights reserved © 2026 JourneyBuddy.

---

**Developed & Engineered by N Ashvita P Kini**  
*JourneyBuddy — Dream It. Plan It. Live It.*


