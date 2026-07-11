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

- **Autenticación de asesores** — Registro e inicio de sesión con JWT, datos persistentes en Neon
- **Perfilamiento de riesgo** — Cuestionario interactivo con reglas visibles y versionadas
- **Propuesta de portafolio** — Asignación de activos explicada en lenguaje natural
- **Revisión por asesor** — Aprobación, edición o rechazo con audit trail completo

---

## Autenticación

El sistema requiere **inicio de sesión obligatorio** para usar cualquier funcionalidad:

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/auth/register` | Registro de nuevo asesor |
| `POST /api/auth/login` | Inicio de sesión (devuelve JWT) |
| `GET /api/auth/me` | Verificar token activo |

- Las contraseñas se guardan hasheadas con **bcrypt**
- Los tokens **JWT** expiran a las 24 horas
- La sesión persiste en `localStorage` (solo el token)
- Todos los datos se almacenan en **Neon** (PostgreSQL serverless)

## Documentación

- [`docs/stack.md`](docs/stack.md) — Descripción detallada del stack tecnológico
- [`docs/arquitectura.md`](docs/arquitectura.md) — Diagrama de arquitectura, flujos y decisiones técnicas

---

## Estructura del Proyecto

```
/
├── frontend/                          # Next.js App Router
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing page
│   │   ├── login/
│   │   │   └── page.tsx               # Inicio de sesión
│   │   ├── register/
│   │   │   └── page.tsx               # Registro de asesor
│   │   ├── cuestionario/
│   │   │   └── page.tsx               # Perfilamiento de riesgo
│   │   ├── propuesta/
│   │   │   └── page.tsx               # Visualizar portafolio
│   │   └── asesor/
│   │       └── page.tsx               # Panel de revisión
│   ├── components/                    # Componentes React
│   │   ├── RiskQuestionnaire.tsx
│   │   ├── PortfolioChart.tsx
│   │   └── ApprovalPanel.tsx
│   └── services/
│       ├── api-client.ts              # Cliente HTTP al backend
│       └── auth.ts                    # Auth service (JWT)
│
├── api/                               # Vercel Python serverless
│   └── index.py                       # FastAPI entry point
│
├── backend/                           # FastAPI + LangGraph
│   └── app/
│       ├── main.py
│       ├── api/                       # Routes
│       │   ├── auth_routes.py         # Registro, login JWT
│       │   ├── profiling_routes.py
│       │   ├── portfolio_routes.py
│       │   └── approval_routes.py
│       ├── agents/                    # LangGraph state graph
│       ├── domain/                    # Lógica de negocio
│       ├── models/                    # Pydantic schemas
│       ├── infrastructure/            # DB, Redis, ChromaDB
│       │   ├── database.py
│       │   ├── schema.sql
│       │   └── ...
│       └── llm/                       # Gemini integration
│
├── tests/
├── docs/
├── parametros_del_proyecto.md
├── track3.md
├── .env.example
├── vercel.json
└── README.md
```

---

## Despliegue (Vercel)

Vercel detecta automáticamente:
- **Next.js** en `frontend/` → frontend
- **Python** en `api/` → backend serverless functions

> Nota: el `vercel.json` en la raíz configura las rutas porque el frontend está dentro de `frontend/`.

---

## Desarrollo

```bash
# Backend
source venv/bin/activate
uvicorn backend.app.main:app --reload

# Frontend (desde frontend/)
cd frontend && pnpm dev
```

> Asegurate de tener las variables de entorno configuradas en Vercel Dashboard:
> `DATABASE_URL`, `GEMINI_API_KEY` y opcionalmente `JWT_SECRET`.

---

## Licencia

Proyecto académico — Hackathon Guide Financial Agents IA 2026
