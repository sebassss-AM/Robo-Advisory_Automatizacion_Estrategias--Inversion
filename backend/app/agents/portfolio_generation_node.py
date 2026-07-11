from backend.app.agents.graph import AgentState
from backend.app.domain.asset_allocation_policies import build_allocations
from backend.app.domain.instrument_catalog import INSTRUMENTS
from backend.app.llm.gemini_client import generate_portfolio_explanation
from backend.app.models.investor_profile import RiskProfile


def run_portfolio_generation(state: AgentState) -> dict:
    profile_result = state.get("profile_result")
    if not profile_result:
        return {"error": "No hay perfil de riesgo calculado"}

    profile = RiskProfile(profile_result["profile"])
    profile_id = state.get("profile_id", "unknown")

    proposal = build_allocations(profile, profile_id)

    llm_explanation = generate_portfolio_explanation(
        profile_name=profile.value,
        allocations=[a.model_dump() for a in proposal.allocations],
        risk_metrics=proposal.risk_metrics.model_dump(),
    )

    return {
        "proposal_result": {
            "allocations": [a.model_dump() for a in proposal.allocations],
            "risk_metrics": proposal.risk_metrics.model_dump(),
            "explanation": proposal.explanation,
            "llm_explanation": llm_explanation,
        },
        "step": "portfolio_done",
    }
