from fastapi import APIRouter, Depends, Query

from backend.app.api.auth_routes import get_current_user
from backend.app.infrastructure.database import execute_query

router = APIRouter(prefix="/api/notificaciones", tags=["notifications"])


@router.get("")
async def get_notifications(
    since: str = Query(default=""),
    user: dict = Depends(get_current_user),
):
    if since:
        rows = execute_query(
            """SELECT d.id, d.action, d.comments, d.decided_at, p.id as profile_id,
                      pr.profile, pr.score
               FROM decisions d
               JOIN proposals p ON p.id = d.proposal_id
               JOIN profiles pr ON pr.id = p.profile_id
               WHERE pr.user_id = %s AND d.decided_at > %s
               ORDER BY d.decided_at DESC""",
            (user["id"], since),
        )
    else:
        rows = execute_query(
            """SELECT d.id, d.action, d.comments, d.decided_at, p.id as profile_id,
                      pr.profile, pr.score
               FROM decisions d
               JOIN proposals p ON p.id = d.proposal_id
               JOIN profiles pr ON pr.id = p.profile_id
               WHERE pr.user_id = %s
               ORDER BY d.decided_at DESC
               LIMIT 20""",
            (user["id"],),
        )
    items = []
    for r in rows:
        items.append({
            "id": r["id"],
            "action": r["action"],
            "comments": r["comments"],
            "decided_at": str(r["decided_at"]),
            "profile_id": r["profile_id"],
            "profile": r["profile"],
            "score": r["score"],
            "message": _build_message(r),
        })
    return {"notifications": items, "count": len(items)}


def _build_message(row: dict) -> str:
    profile = row.get("profile", "")
    action = row.get("action", "")
    if action == "aprobado":
        return f"Tu perfil {profile} fue aprobado por el asesor"
    elif action == "rechazado":
        return f"Tu perfil {profile} fue rechazado. Revisa los comentarios del asesor."
    elif action == "editado":
        return f"Tu perfil {profile} fue aprobado con modificaciones"
    return f"Tu perfil {profile} tiene una actualización"
