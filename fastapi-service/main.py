from fastapi import FastAPI, Path, Query, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

app = FastAPI(
    title="JourneyBuddy FastAPI Validation Service",
    description="Microservice providing strict parametric validation and automated schema serialization for JourneyBuddy.",
    version="1.0.0"
)

# Pydantic Schema for Parametric Response
class DestinationRecord(BaseModel):
    destination_id: int = Field(..., description="Unique numeric destination ID", ge=1)
    name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., description="Travel category filter")
    max_budget_usd: float = Field(..., gt=0)
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# In-memory Mock Destination Repository
MOCK_DESTINATIONS = {
    101: {
        "destination_id": 101,
        "name": "Swiss Alps Retreat",
        "category": "mountain",
        "max_budget_usd": 2500.0,
        "tags": ["hiking", "luxury", "snow"]
    },
    102: {
        "destination_id": 102,
        "name": "Maldives Overwater Villas",
        "category": "beach",
        "max_budget_usd": 4200.0,
        "tags": ["ocean", "resort", "diving"]
    }
}

# Health Check Route
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "service": "JourneyBuddy FastAPI Microservice",
        "timestamp": datetime.utcnow().isoformat()
    }

# Parametric Data Endpoint with Strict Path & Query Validation
@app.get(
    "/api/destinations/{entity_id}",
    response_model=DestinationRecord,
    tags=["Destinations"]
)
async def get_destination(
    entity_id: int = Path(
        ...,
        title="Entity ID",
        description="Unique numeric identifier for the destination (must be >= 1)",
        ge=1,
        le=99999
    ),
    category: Optional[str] = Query(
        None,
        title="Category Filter",
        min_length=3,
        max_length=30,
        pattern="^[a-zA-Z_-]+$",
        description="Optional category filter (alphabetic characters only)"
    ),
    max_budget: Optional[float] = Query(
        None,
        title="Budget Ceiling",
        gt=0.0,
        le=50000.0,
        description="Maximum budget threshold in USD"
    )
):
    record = MOCK_DESTINATIONS.get(entity_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination entity with ID '{entity_id}' not found."
        )

    if category and record["category"].lower() != category.lower():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination '{record['name']}' does not match category filter '{category}'."
        )

    if max_budget is not None and record["max_budget_usd"] > max_budget:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Destination pricing (${record['max_budget_usd']}) exceeds query ceiling (${max_budget})."
        )

    return record