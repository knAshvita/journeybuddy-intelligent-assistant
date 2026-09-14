# 🤖 Module 2.12: Skills Agentic AI & Integration Project

An autonomous multi-step decision-making loop (Plan → Act → Observe → Iterate) orchestrating dynamic tool execution, state management, and travel itinerary synthesis for JourneyBuddy.

---

## 1. Agent Decision Loop Topology

```text
               Traveler Goal / Complex Query
                             │
                             ▼
                    ┌──────────────────┐
               ┌───►│  1. PLAN / THINK │
               │    └────────┬─────────┘
               │             │ Chooses Tool (SEARCH_PLACES / CALCULATE_BUDGET)
               │             ▼
               │    ┌──────────────────┐
               │    │   2. ACT / TOOL  │
               │    └────────┬─────────┘
               │             │ Executes Tool & collects data
               │             ▼
               │    ┌──────────────────┐
               │    │   3. OBSERVE     │
               │    └────────┬─────────┘
               │             │ Records scratchpad to Redis state
               │             ▼
          Iterate   [ Information Complete? ]
               │         /            \
               └─────── NO            YES
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │ 4. FINALIZE & GUIDE │
                            │ Synthesis (Gemini)  │
                            └─────────────────────┘