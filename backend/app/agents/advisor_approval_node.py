from datetime import datetime

from backend.app.agents.graph import AgentState


def run_advisor_approval(state: AgentState) -> dict:
    decision = state.get("advisor_decision")

    if not decision:
        return {
            "step": "awaiting_approval",
            "error": "El asesor debe aprobar, editar o rechazar la propuesta",
        }

    return {
        "step": "approval_done",
        "advisor_decision": decision,
    }
