import os
from google import genai
from google.genai import types

SYSTEM_PROMPT = """
Eres un asesor financiero IA especializado en robo-advisory.

Tus funciones son:
- Explicar el perfil de riesgo de un inversionista en lenguaje claro
- Justificar propuestas de portafolio según el perfil calculado
- Responder dudas sobre conceptos financieros básicos

Reglas estrictas:
- NUNCA inventes datos financieros. Usa solo la información proporcionada.
- NUNCA prometas rentabilidades garantizadas.
- NUNCA recomiendes compra/venta de instrumentos específicos.
- Siempre aclara que es una propuesta informativa y no una recomendación de inversión.
- Si no sabes algo, dilo.
"""


def get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY no configurada")
    return genai.Client(api_key=api_key)


def generate_response(
    prompt: str, model: str = "gemini-2.0-flash"
) -> str:
    client = get_client()
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.3,
            max_output_tokens=1024,
        ),
    )
    return response.text


def generate_profile_explanation(
    profile_name: str,
    score: int,
    answers: dict,
    rules: list[str],
) -> str:
    prompt = f"""
Perfil calculado: {profile_name}
Puntuación: {score}/100

Respuestas del usuario:
- Edad: {answers.get('age')}
- Horizonte: {answers.get('investment_horizon')}
- Tolerancia: {answers.get('risk_tolerance')}
- Objetivo: {answers.get('goal')}
- Experiencia: {answers.get('investment_experience')}/5

Reglas aplicadas:
{chr(10).join(f'- {r}' for r in rules)}

Genera una explicación clara y amigable para el usuario de por qué se le asignó este perfil.
"""

    return generate_response(prompt)


def generate_portfolio_explanation(
    profile_name: str,
    allocations: list[dict],
    risk_metrics: dict,
) -> str:
    allocations_text = "\n".join(
        f"- {a['percentage']}% en {a['instrument_name']} ({a['category']})"
        for a in allocations
    )

    prompt = f"""
Perfil del inversionista: {profile_name}
Asignación propuesta:
{allocations_text}

Métricas de riesgo:
- Volatilidad esperada: {risk_metrics.get('expected_volatility')}
- Diversificación: {risk_metrics.get('diversification_score')}/100
- Drawdown máximo estimado: {risk_metrics.get('max_drawdown_estimate')}

Genera una explicación clara para el usuario sobre esta propuesta de portafolio.
Debes incluir:
1. Por qué esta asignación es adecuada para su perfil
2. Qué significa cada métrica de riesgo
3. Un mensaje responsable indicando que es solo una propuesta informativa
"""

    return generate_response(prompt)
