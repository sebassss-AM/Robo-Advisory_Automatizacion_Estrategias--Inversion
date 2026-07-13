from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class DecisionAction(str, Enum):
    APPROVED = "aprobado"
    EDITED = "editado"
    REJECTED = "rechazado"


class AdvisorDecision(BaseModel):
    id: str | None = None
    proposal_id: str
    advisor_id: str | None = None
    action: DecisionAction
    comments: str | None = None
    edited_allocations: list[dict] | None = None
    rules_version: str
    decided_at: datetime = Field(default_factory=datetime.now)
