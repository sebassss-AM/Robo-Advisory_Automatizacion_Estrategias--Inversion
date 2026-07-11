import json
import uuid

from fastapi import APIRouter, HTTPException

from backend.app.infrastructure.database import execute_insert, execute_query
from backend.app.models.audit_decision import AdvisorDecision, DecisionAction

router = APIRouter(prefix="/api/revisar", tags=["approval"])

_in_memory_decisions: list[dict] = []


@router.post("")
async def review_proposal(decision: AdvisorDecision):
    decision_id = str(uuid.uuid4())

    try:
        execute_insert(
            """
            INSERT INTO decisions (id, proposal_id, advisor_id, action, comments, edited_allocations, rules_version)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                decision_id,
                decision.proposal_id,
                decision.advisor_id,
                decision.action.value,
                decision.comments,
                json.dumps(decision.edited_allocations) if decision.edited_allocations else None,
                decision.rules_version,
            ),
        )
    except Exception:
        pass

    try:
        execute_query(
            "UPDATE proposals SET status = %s WHERE id = %s",
            (decision.action.value, decision.proposal_id),
        )
    except Exception:
        pass

    _in_memory_decisions.insert(
        0,
        {
            "id": decision_id,
            "proposal_id": decision.proposal_id,
            "advisor_id": decision.advisor_id,
            "action": decision.action.value,
            "comments": decision.comments,
            "rules_version": decision.rules_version,
            "decided_at": None,
            "profile": None,
        },
    )

    return {
        "decision_id": decision_id,
        "proposal_id": decision.proposal_id,
        "action": decision.action.value,
        "message": f"Propuesta {decision.action.value} exitosamente",
    }


@router.get("/historial")
async def get_history():
    try:
        rows = execute_query(
            """
            SELECT d.id, d.proposal_id, d.advisor_id, d.action, d.comments,
                   d.rules_version, d.decided_at, p.profile
            FROM decisions d
            JOIN proposals p ON p.id = d.proposal_id
            ORDER BY d.decided_at DESC
            """
        )
        if rows:
            return [dict(row) for row in rows]
    except Exception:
        pass

    return _in_memory_decisions
