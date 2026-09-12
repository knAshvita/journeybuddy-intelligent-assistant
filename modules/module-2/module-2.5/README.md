cd D:\journey-buddy
New-Item -ItemType Directory -Force -Path "modules\module-2.5"

@'
# 🍃 Module 2.5: MongoDB Database & Atlas Vector Search

A unified document schema implementation and Approximate Nearest Neighbor (ANN) vector search retrieval pipeline using MongoDB Atlas.

---

## 1. Architectural Overview & Principle
MongoDB serves as a document database storing structured and semi-structured operational data as flexible BSON documents. MongoDB Atlas Vector Search natively embeds high-dimensional vector representations alongside relational metadata within a single document collection.

This unified approach removes separate database synchronization jobs between document storage and specialized vector databases, enabling hybrid retrieval pipelines combining categorical pre-filtering with semantic similarity ranking.

```text
Traveler Query: "cold snowy mountain chalets"
                      │
                      ▼
[ Dynamic Query Vectorization ]
  Vector: [0.85, 0.89, 0.08, 0.10, 0.01, 0.04, 0.12, 0.05]
                      │
                      ▼
[ MongoDB Atlas Aggregation Pipeline ($vectorSearch) ]
  ├── Target Index: "vector_index"
  ├── Path: "embedding" (8 Dimensions, Cosine Metric)
  └── ANN Search across candidate centroids
                      │
                      ▼
[ Ranked Similarity Output (Score Meta) ]
  1. Swiss Alps Alpine Sanctuary (Score: ~0.9995)
  2. Maldives Overwater Lagoon    (Score: ~0.5859)