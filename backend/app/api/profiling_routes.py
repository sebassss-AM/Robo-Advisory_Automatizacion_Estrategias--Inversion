from fastapi import APIRouter, HTTPException

from backend.app.agents.graph import build_graph
from backend.app.infrastructure.database import execute_insert, execute_query

router = APIRouter(prefix="/api/perfil", tags=["profiling"])


@router.post("")
async def create_profile(answers: dict):
    graph = build_graph()
    initial_state = {
        "session_id": "session_1",
        "step": "start",
        "answers": answers,
        "profile_id": None,
        "profile_result": None,
        "proposal_id": None,
        "proposal_result": None,
        "advisor_decision": None,
        "error": None,
    }

    result = await graph.ainvoke(initial_state)

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])

    profile_result = result["profile_result"]
    profile_id = execute_insert(
        """
        INSERT INTO profiles (answers, profile, score, rules_version, explanations)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            answers,
            profile_result["profile"],
            profile_result["score"],
            profile_result["rules_version"],
            profile_result["explanations"],
        ),
    )

    return {
        "profile_id": profile_id,
        "profile": profile_result["profile"],
        "score": profile_result["score"],
        "explanations": profile_result["explanations"],
        "llm_explanation": profile_result["llm_explanation"],
        "available_instruments": profile_result["instruments"],
    }


@router.get("/{profile_id}")
async def get_profile(profile_id: int):
    rows = execute_query("SELECT * FROM profiles WHERE id = %s", (profile_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return dict(rows[0])
