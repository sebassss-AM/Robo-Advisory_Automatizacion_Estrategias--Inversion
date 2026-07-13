import uuid

from fastapi import APIRouter, HTTPException

from backend.app.domain.asset_allocation_policies import build_allocations
from backend.app.domain.instrument_catalog import INSTRUMENTS
from backend.app.domain.risk_profiling_rules import calculate_profile
from backend.app.models.investor_profile import QuestionnaireAnswers, RiskProfile

router = APIRouter(prefix="/api/demo", tags=["demo"])


@router.post("/procesar")
async def demo_procesar(answers: dict):
    try:
        parsed = QuestionnaireAnswers(**answers)
        result = calculate_profile(parsed)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    profile_id = str(uuid.uuid4())
    profile_name = result.profile.value
    monthly_investment = float(answers.get("monthly_investment", 0))

    resolved_profile = RiskProfile(profile_name)
    proposal = build_allocations(resolved_profile, profile_id)
    allocs_dict = [a.model_dump() for a in proposal.allocations]

    instruments_info = [
        {"name": i.name, "category": i.category.value, "risk": i.risk_level}
        for i in INSTRUMENTS
    ]

    return {
        "profile_id": profile_id,
        "profile": profile_name,
        "score": result.score,
        "status": "completado",
        "explanations": result.explanations,
        "llm_explanation": "",
        "available_instruments": instruments_info,
        "proposal": {
            "proposal_id": str(uuid.uuid4()),
            "profile_id": profile_id,
            "profile": profile_name,
            "allocations": allocs_dict,
            "risk_metrics": proposal.risk_metrics.model_dump(),
            "explanation": proposal.explanation,
            "monthly_investment": monthly_investment,
        },
    }
