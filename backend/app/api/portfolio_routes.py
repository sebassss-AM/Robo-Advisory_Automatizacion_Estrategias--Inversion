from fastapi import APIRouter, HTTPException, Body

from backend.app.models.investor_profile import RiskProfile
from backend.app.domain.asset_allocation_policies import build_allocations
from backend.app.infrastructure.database import execute_insert, execute_query

router = APIRouter(prefix="/api/propuesta", tags=["portfolio"])


@router.post("")
async def create_proposal(profile_id: int = Body(..., embed=True)):
    profile_rows = execute_query(
        "SELECT * FROM profiles WHERE id = %s", (profile_id,)
    )
    if not profile_rows:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    profile_data = profile_rows[0]
    profile = RiskProfile(profile_data["profile"])

    proposal = build_allocations(profile, str(profile_id))

    proposal_id = execute_insert(
        """
        INSERT INTO proposals (profile_id, allocations, risk_metrics, explanation, status)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            profile_id,
            [a.model_dump() for a in proposal.allocations],
            proposal.risk_metrics.model_dump(),
            proposal.explanation,
            "pending",
        ),
    )

    return {
        "proposal_id": proposal_id,
        "profile_id": profile_id,
        "profile": profile.value,
        "allocations": [a.model_dump() for a in proposal.allocations],
        "risk_metrics": proposal.risk_metrics.model_dump(),
        "explanation": proposal.explanation,
    }


@router.get("/{proposal_id}")
async def get_proposal(proposal_id: int):
    rows = execute_query("SELECT * FROM proposals WHERE id = %s", (proposal_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Propuesta no encontrada")
    return dict(rows[0])
