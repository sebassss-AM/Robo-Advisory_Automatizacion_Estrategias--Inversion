import json
import uuid

from fastapi import APIRouter, HTTPException, Body

from backend.app.models.investor_profile import RiskProfile
from backend.app.domain.asset_allocation_policies import build_allocations
from backend.app.infrastructure.database import execute_insert, execute_query
from backend.app.llm.gemini_client import generate_portfolio_explanation

router = APIRouter(prefix="/api/propuesta", tags=["portfolio"])


@router.post("")
async def create_proposal(
    profile_id: str = Body(...),
    profile: str = Body(None),
):
    resolved_profile: RiskProfile | None = None

    if profile:
        try:
            resolved_profile = RiskProfile(profile)
        except ValueError:
            pass

    if not resolved_profile:
        profile_rows = execute_query(
            "SELECT * FROM profiles WHERE id = %s", (profile_id,)
        )
        if profile_rows:
            resolved_profile = RiskProfile(profile_rows[0]["profile"])

    if not resolved_profile:
        raise HTTPException(
            status_code=400,
            detail="No se pudo determinar el perfil de riesgo. Proporciona 'profile' o asegúrate de que el perfil exista en la base de datos.",
        )

    proposal = build_allocations(resolved_profile, profile_id)
    proposal_id = str(uuid.uuid4())

    allocs_dict = [a.model_dump() for a in proposal.allocations]

    llm_explanation = generate_portfolio_explanation(
        profile_name=resolved_profile.value,
        allocations=allocs_dict,
        risk_metrics=proposal.risk_metrics.model_dump(),
    )
    final_explanation = llm_explanation if llm_explanation else proposal.explanation

    execute_insert(
        """
        INSERT INTO proposals (id, profile_id, allocations, risk_metrics, explanation, status)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            proposal_id,
            profile_id,
            json.dumps(allocs_dict),
            json.dumps(proposal.risk_metrics.model_dump()),
            final_explanation,
            "pending",
        ),
    )

    return {
        "proposal_id": proposal_id,
        "profile_id": profile_id,
        "profile": resolved_profile.value,
        "allocations": allocs_dict,
        "risk_metrics": proposal.risk_metrics.model_dump(),
        "explanation": final_explanation,
    }


@router.get("/{proposal_id}")
async def get_proposal(proposal_id: str):
    rows = execute_query("SELECT * FROM proposals WHERE id = %s", (proposal_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Propuesta no encontrada")
    return dict(rows[0])
