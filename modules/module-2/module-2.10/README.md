# 🦜 Module 2.10: LangChain Framework & Hybrid RAG Assistant

Enterprise-grade Retrieval-Augmented Generation (RAG) assistant integrating **Google Gemini** (`gemini-2.5-flash`), **LangChain orchestration**, **MongoDB Atlas**, **Pinecone vector retrieval**, and an interactive client assistant.

---

## 1. System Architecture & Context Flow

```text
                  Traveler Query / Destination Click
                                  │
                                  ▼
                Next.js Client (SearchBar & ChatModal)
                                  │
                                  ▼
                    Express Gateway (/api/chat/rag)
                                  │
                                  ▼
                   LangChain Hybrid Retriever Engine
                   (Pinecone 8D Hash + MongoDB Atlas)
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
       Sufficient Internal Data?         Below Target (<10)?
       (Similarity Match >= 0.75)                  │
                 │                                 ▼
                 │                     Dynamic Discovery Service
                 │                   (Verified Regional Catalogs /
                 │                    Gemini Structured Ingestion)
                 │                                 │
                 │                   ┌─────────────┴─────────────┐
                 │                   ▼                           ▼
                 │             MongoDB Atlas                 Pinecone
                 │             (Full Document)            (8D Vector Hash)
                 │                   │                           │
                 └───────────────┬───┴───────────────────────────┘
                                 ▼
                    Combined Verified Knowledge
                                 │
                                 ▼
                     ChatPromptTemplate Assembly
                   (System Prompt + Truth Boundaries)
                                 │
                                 ▼
                      Gemini 2.5 Flash Engine
                                 │
                                 ▼
                 Structured Markdown / JSON Guide
                                 │
                                 ▼
                 Next.js Frontend Reactive Cards UI
                   • Per-card "Know More ✨"
                   • Photo Search Redirect
                   • Interactive Group Budget Planner
                   • RedBus Direct Ticketing Route