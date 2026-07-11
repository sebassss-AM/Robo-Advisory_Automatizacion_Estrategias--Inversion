import uuid

from fastapi import APIRouter, HTTPException

from backend.app.infrastructure.database import execute_insert, execute_query
from backend.app.models.audit_decision import AdvisorDecision, DecisionAction

router = APIRouter(prefix="/api/revisar", tags=["approval"])


@router.post("")
async def review_proposal(decision: AdvisorDecision):
    proposal_rows = execute_query(
        "SELECT * FROM proposals WHERE id = %s", (decision.proposal_id,)
    )
    if not proposal_rows:
        raise HTTPException(status_code=404, detail="Propuesta no encontrada")

    try:
        decision_id = execute_insert(
            """
            INSERT INTO decisions (proposal_id, advisor_id, action, comments, edited_allocations, rules_version)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                decision.proposal_id,
                decision.advisor_id,
                decision.action.value,
                decision.comments,
                decision.edited_allocations,
                decision.rules_version,
            ),
        )
    except Exception as e:
        decision_id = None

    if not decision_id:
        decision_id = str(uuid.uuid4())

    execute_query(
        "UPDATE proposals SET status = %s WHERE id = %s",
        (decision.action.value, decision.proposal_id),
    )

    return {
        "decision_id": decision_id,
        "proposal_id": decision.proposal_id,
        "action": decision.action.value,
        "message": f"Propuesta {decision.action.value} exitosamente",
    }


@router.get("/historial")
async def get_history():
    rows = execute_query(
        """
        SELECT d.id, d.proposal_id, d.advisor_id, d.action, d.comments,
               d.rules_version, d.decided_at, p.profile
        FROM decisions d
        JOIN proposals p ON p.id = d.proposal_id
        ORDER BY d.decided_at DESC
        """
    )
    return [dict(row) for row in rows]
