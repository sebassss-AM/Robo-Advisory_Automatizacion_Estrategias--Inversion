from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.app.api.auth_routes import get_current_user
from backend.app.llm.gemini_client import generate_response

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    profile: str = ""
    score: int = 0
    monthly_investment: float = 0.0
    allocations: list[dict] = []
    risk_metrics: dict = {}
    explanation: str = ""
    history: list[dict] = []


@router.post("")
async def chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")

    allocations_text = "\n".join(
        f"- {a.get('instrument_name', '?')} ({a.get('instrument_id', '?')}): "
        f"{a.get('percentage', 0)}% | Retorno est.: {a.get('expected_return', 'N/A')}"
        for a in req.allocations
    )

    metrics_text = (
        f"Volatilidad esperada: {req.risk_metrics.get('expected_volatility', 'N/A')}\n"
        f"Diversificación: {req.risk_metrics.get('diversification_score', 0)}/100\n"
        f"Máxima caída est.: {req.risk_metrics.get('max_drawdown_estimate', 'N/A')}\n"
        f"Retorno anual est.: {req.risk_metrics.get('expected_return_range', 'N/A')}"
    )

    system = """Eres InversIA, un agente financiero de IA especializado en robo-advisory.

Reglas estrictas:
1. Respondé SOLO con la información proporcionada en el contexto de abajo. No inventes datos.
2. Nunca prometas rentabilidades. Decí "según los datos disponibles" o "basado en estimaciones".
3. Aclará siempre que es una propuesta informativa, no una recomendación de inversión.
4. Sé claro, amigable, usá "vos". Mantené respuestas concisas (máx 3-4 párrafos).
5. Si te preguntan algo fuera del contexto, decí que no tenés esa información.

Contexto del portafolio del usuario:
- Perfil: {profile} (score: {score}/100)
- Aporte mensual: ${monthly_investment:.0f}
- Asignación actual:
{allocations}
- Métricas de riesgo:
{metrics}
"""

    if req.explanation:
        system += f"\nExplicación original:\n{req.explanation}"

    history_msgs = []
    for h in req.history[-6:]:
        role = "user" if h.get("role") == "user" else "assistant"
        history_msgs.append({"role": role, "content": h.get("content", "")})

    prompt = f"""Contexto actual del portafolio:
Perfil: {req.profile} (score: {req.score}/100)
Aporte mensual: ${req.monthly_investment:.0f}

Asignación:
{allocations_text}

Métricas de riesgo:
{metrics_text}

Pregunta del usuario: {req.message}

Respondé de forma clara y amigable, usando SOLO los datos proporcionados arriba."""

    try:
        response = generate_response(prompt)
        if not response:
            response = "Disculpá, en este momento no puedo procesar tu consulta. Probá de nuevo más tarde."
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar respuesta: {e}")
