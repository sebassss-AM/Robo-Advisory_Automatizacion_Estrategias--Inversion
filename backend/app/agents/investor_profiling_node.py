from backend.app.agents.state import AgentState
from backend.app.domain.risk_profiling_rules import calculate_profile
from backend.app.domain.instrument_catalog import INSTRUMENTS
from backend.app.llm.groq_client import generate_profile_explanation
from backend.app.models.investor_profile import QuestionnaireAnswers


def run_profiling(state: AgentState) -> dict:
    answers_data = state.get("answers")
    if not answers_data:
        return {"error": "No se recibieron respuestas del cuestionario"}

    answers = QuestionnaireAnswers(**answers_data)
    result = calculate_profile(answers)

    llm_explanation = generate_profile_explanation(
        profile_name=result.profile.value,
        score=result.score,
        answers=answers_data,
        rules=result.explanations,
    )

    instruments_info = [
        {"name": i.name, "category": i.category.value, "risk": i.risk_level}
        for i in INSTRUMENTS
    ]

    return {
        "profile_result": {
            "profile": result.profile.value,
            "score": result.score,
            "rules_version": result.rules_version,
            "explanations": result.explanations,
            "llm_explanation": llm_explanation,
            "instruments": instruments_info,
        },
        "step": "profiling_done",
    }
