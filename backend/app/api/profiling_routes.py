import json
import uuid

from fastapi import APIRouter, HTTPException, Depends

from backend.app.agents.investor_profiling_node import run_profiling
from backend.app.infrastructure.database import execute_insert, execute_query
from backend.app.api.auth_routes import get_current_user, get_current_advisor

router = APIRouter(prefix="/api/perfil", tags=["profiling"])


@router.post("")
async def create_profile(answers: dict, user: dict = Depends(get_current_user)):
    profile_id = str(uuid.uuid4())

    initial_state = {
        "session_id": "session_1",
        "step": "start",
        "answers": answers,
        "profile_id": profile_id,
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

    execute_insert(
        """
        INSERT INTO profiles (id, user_id, answers, profile, score, rules_version, explanations, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            profile_id,
            user["id"],
            json.dumps(answers),
            profile_result["profile"],
            profile_result["score"],
            profile_result["rules_version"],
            json.dumps(profile_result["explanations"]),
            "pendiente",
        ),
    )

    return {
        "profile_id": profile_id,
        "profile": profile_result["profile"],
        "score": profile_result["score"],
        "status": "pendiente",
        "explanations": profile_result["explanations"],
        "llm_explanation": profile_result["llm_explanation"],
        "available_instruments": profile_result["instruments"],
    }


@router.get("/mis-perfilamientos")
async def get_mis_perfilamientos(user: dict = Depends(get_current_user)):
    rows = execute_query(
        """SELECT p.id, p.profile, p.score, p.status, p.created_at,
                  pr.allocations, pr.risk_metrics, pr.status as proposal_status,
                  d.action, d.comments, d.decided_at
           FROM profiles p
           LEFT JOIN proposals pr ON pr.profile_id = p.id
           LEFT JOIN decisions d ON d.proposal_id = pr.id
           WHERE p.user_id = %s
           ORDER BY p.created_at DESC""",
        (user["id"],),
    )
    return [dict(r) for r in rows]


@router.get("/pendientes")
async def get_pendientes(advisor: dict = Depends(get_current_advisor)):
    rows = execute_query(
        """SELECT p.id, p.profile, p.score, p.status, p.created_at,
                  u.display_name as user_name
           FROM profiles p
           JOIN users u ON u.id = p.user_id
           WHERE p.status = 'pendiente'
           ORDER BY p.created_at ASC""",
    )
    return [dict(r) for r in rows]


@router.post("/{profile_id}/reclamar")
async def reclamar_perfil(profile_id: str, advisor: dict = Depends(get_current_advisor)):
    rows = execute_query(
        "SELECT status FROM profiles WHERE id = %s", (profile_id,)
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    if rows[0]["status"] != "pendiente":
        raise HTTPException(status_code=409, detail="Este perfil ya no está disponible")

    execute_query(
        "UPDATE profiles SET status = 'en_revision', advisor_id = %s WHERE id = %s",
        (advisor["id"], profile_id),
    )
    return {"status": "en_revision", "profile_id": profile_id}


@router.get("/en-revision")
async def get_en_revision(advisor: dict = Depends(get_current_advisor)):
    rows = execute_query(
        """SELECT p.id, p.profile, p.score, p.status, p.created_at,
                  u.display_name as user_name
           FROM profiles p
           JOIN users u ON u.id = p.user_id
           WHERE p.status = 'en_revision' AND p.advisor_id = %s
           ORDER BY p.created_at DESC""",
        (advisor["id"],),
    )
    return [dict(r) for r in rows]


@router.get("/{profile_id}")
async def get_profile(profile_id: str):
    rows = execute_query("SELECT * FROM profiles WHERE id = %s", (profile_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return dict(rows[0])
