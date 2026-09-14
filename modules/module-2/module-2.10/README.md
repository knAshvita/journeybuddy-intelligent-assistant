# 🦜 Module 2.10: LangChain Framework & Hybrid RAG Architecture

Implementation of an enterprise-grade Retrieval-Augmented Generation (RAG) system synthesizing responses using Google Gemini (`gemini-3.6-flash`), LangChain orchestration, MongoDB Atlas long-term storage, and Pinecone vector search.

---

## 1. System Architecture & Information Flow

```text
                  Traveler Query (Next.js SearchBar)
                                 │
                                 ▼
                     Express Gateway (/api/chat/rag)
                                 │
                                 ▼
                   LangChain Hybrid Retriever Engine
                   (Pinecone ANN + MongoDB Enriched)
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Sufficient Internal Data?        Below Target Count (<10)?
       (Relevance Score >= 0.75)                 │
                 │                               ▼
                 │                    Dynamic Discovery Service
                 │                   (Verified Regional Catalogs /
                 │                    Gemini Structured Extraction)
                 │                               │
                 │                  ┌────────────┴────────────┐
                 │                  ▼                         ▼
                 │            MongoDB Atlas               Pinecone
                 │            (Full Document)          (8D Vector Hash)
                 │                  │                         │
                 └──────────────┬───┴─────────────────────────┘
                                ▼
                   Combined Verified Context
                                │
                                ▼
                     Prompt Template Assembly
                  (System Instructions + Truth Policy)
                                │
                                ▼
                     Gemini 3.6 Flash Engine
                                │
                                ▼
                 Structured Markdown Travel Guide
                                │
                                ▼
                     Frontend React Cards UI