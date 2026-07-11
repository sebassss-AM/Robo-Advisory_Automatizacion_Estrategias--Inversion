# Robo-Advisory y Automatización de Estrategias de Inversión

**Hackathon Guide Financial Agents IA — Track 3**

Sistema de asesoría financiera automatizada basado en agentes IA. Realiza perfilamiento de riesgo, genera propuestas de portafolio explicables, y permite revisión por un asesor humano antes de cualquier acción.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js (React + Tailwind) |
| Backend / API | FastAPI (Python serverless en Vercel) |
| Agentes IA | LangGraph (Python) |
| LLM | Gemini API (Google) |
| Base de datos | Vercel Postgres (Neon) |
| Memoria / Sesiones | Vercel KV (Upstash Redis) |
| Vector Store | ChromaDB (RAG anti-alucinación) |
| Testing | pytest + mocks |
| Despliegue | Vercel |

---

## Funcionalidades

- **Perfilamiento de riesgo** — Cuestionario interactivo con reglas visibles y versionadas
- **Propuesta de portafolio** — Asignación de activos explicada en lenguaje natural
- **Revisión por asesor** — Aprobación, edición o rechazo con audit trail completo

---

## Documentación

- [`docs/stack.md`](docs/stack.md) — Descripción detallada del stack tecnológico
- [`docs/arquitectura.md`](docs/arquitectura.md) — Diagrama de arquitectura, flujos y decisiones técnicas

---

## Estructura del Proyecto

```
/
├── frontend/                          # Next.js
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing page
│   │   ├── cuestionario/
│   │   │   └── page.tsx               # Perfilamiento de riesgo
│   │   ├── propuesta/
│   │   │   └── page.tsx               # Visualizar portafolio
│   │   └── asesor/
│   │       └── page.tsx               # Panel de revisión
│   ├── components/
│   │   ├── RiskQuestionnaire.tsx
│   │   ├── PortfolioChart.tsx
│   │   └── ApprovalPanel.tsx
│   ├── services/
│   │   └── api-client.ts              # Cliente HTTP al backend
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── next.config.js
│
├── backend/                           # FastAPI + LangGraph
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app + startup
│   │   │
│   │   ├── api/                       # Capa de entrada (routes)
│   │   │   ├── __init__.py
│   │   │   ├── profiling_routes.py    # POST /perfil, GET /perfil/{id}
│   │   │   ├── portfolio_routes.py    # POST /propuesta
│   │   │   └── approval_routes.py     # POST /revisar, GET /historial
│   │   │
│   │   ├── agents/                    # LangGraph state graph
│   │   │   ├── __init__.py
│   │   │   ├── graph.py              # StateGraph definition
│   │   │   ├── investor_profiling_node.py
│   │   │   ├── portfolio_generation_node.py
│   │   │   └── advisor_approval_node.py
│   │   │
│   │   ├── domain/                    # Lógica de negocio pura
│   │   │   ├── __init__.py
│   │   │   ├── risk_profiling_rules.py
│   │   │   ├── asset_allocation_policies.py
│   │   │   └── instrument_catalog.py
│   │   │
│   │   ├── models/                    # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── investor_profile.py
│   │   │   ├── portfolio_proposal.py
│   │   │   └── audit_decision.py
│   │   │
│   │   ├── infrastructure/            # Conexiones externas
│   │   │   ├── __init__.py
│   │   │   ├── database.py            # Vercel Postgres (Neon)
│   │   │   ├── redis_session.py       # Vercel KV
│   │   │   └── chroma_vector_store.py # RAG
│   │   │
│   │   └── llm/                       # Gemini integration
│   │       ├── __init__.py
│   │       └── gemini_client.py
│   │
│   └── requirements.txt
│
├── tests/
│   ├── test_risk_profiling_rules.py
│   ├── test_asset_allocation_policies.py
│   └── test_profiling_node.py
│
├── docs/
│   ├── stack.md
│   └── arquitectura.md
│
├── vercel.json                        # Monorepo routing config
├── parametros_del_proyecto.md
├── track3.md
└── README.md
```

---

## Configuración de Despliegue (Vercel)

El `vercel.json` en la raíz define cómo se construye y enruta cada parte del proyecto:

```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/next" },
    { "src": "backend/**/*.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/$1" },
    { "src": "/(.*)", "dest": "frontend/$1" }
  ]
}
```

- **Frontend** → Next.js build automático, sirve en todas las rutas que no empiecen con `/api`
- **Backend** → FastAPI corre como serverless function Python, sirve en `/api/*`

---

## Desarrollo

```bash
# Frontend
cd frontend
pnpm install
pnpm dev

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Licencia

Proyecto académico — Hackathon Guide Financial Agents IA 2026
