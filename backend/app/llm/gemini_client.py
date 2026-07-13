import os
from openai import OpenAI

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """
Eres un asesor financiero IA especializado en robo-advisory.

Tus funciones son:
- Explicar el perfil de riesgo de un inversionista en lenguaje claro y cercano
- Justificar propuestas de portafolio con datos de mercado reales que se te proporcionan
- Responder dudas sobre conceptos financieros básicos

REGLAS ESTRICTAS (violarlas hará que los inversores pierdan dinero):
1. NUNCA inventes datos financieros. Usa SOLO la información que se te proporciona en el prompt.
2. NUNCA prometas rentabilidades garantizadas. "Rendimiento pasado no garantiza rendimiento futuro."
3. NUNCA recomiendes compra/venta de instrumentos específicos. Es solo una propuesta informativa.
4. Si no se te proporciona un dato, NO LO INVENTES. Decí: "No tengo ese dato disponible."
5. Siempre aclara que es una propuesta informativa y no una recomendación de inversión.
6. No uses frases como "podría rendir X%" o "esperamos un retorno de". Limítate a los datos entregados.
"""


def get_client() -> OpenAI | None:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    return OpenAI(base_url=GROQ_BASE_URL, api_key=api_key)


def generate_response(prompt: str) -> str:
    client = get_client()
    if not client:
        return ""
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=512,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        return f"[No se pudo generar explicación: {e}]"


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

IMPORTANTE: Usá SOLO los datos de arriba. No inventes nada.
Genera una explicación clara y amigable para el usuario de por qué se le asignó este perfil.
Menciona cómo cada respuesta influyó en el resultado.
"""
    return generate_response(prompt)



