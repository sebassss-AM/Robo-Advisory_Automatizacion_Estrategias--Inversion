import json
import uuid

from fastapi import APIRouter, HTTPException

from backend.app.agents.investor_profiling_node import run_profiling
from backend.app.infrastructure.database import execute_insert, execute_query

router = APIRouter(prefix="/api/perfil", tags=["profiling"])


@router.post("")
async def create_profile(answers: dict):
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

    try:
        result = run_profiling(initial_state)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])

    profile_result = result["profile_result"]

    try:
        profile_id = execute_insert(
            """
            INSERT INTO profiles (answers, profile, score, rules_version, explanations)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                json.dumps(answers),
                profile_result["profile"],
                profile_result["score"],
                profile_result["rules_version"],
                profile_result["explanations"],
            ),
        )
    except Exception as e:
        profile_id = None

    if not profile_id:
        profile_id = str(uuid.uuid4())

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
