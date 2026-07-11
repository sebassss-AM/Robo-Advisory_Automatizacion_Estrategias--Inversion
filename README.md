# Robo-Advisory y Automatización de Estrategias de Inversión

**Hackathon Guide Financial Agents IA — Track 3**

Sistema de asesoría financiera automatizada basado en agentes IA. Realiza perfilamiento de riesgo, genera propuestas de portafolio explicables, y permite revisión por un asesor humano antes de cualquier acción.

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

## Funcionalidades

- **Perfilamiento de riesgo** — Cuestionario interactivo con reglas visibles y versionadas
- **Propuesta de portafolio** — Asignación de activos explicada en lenguaje natural
- **Revisión por asesor** — Aprobación, edición o rechazo con audit trail completo

## Documentación

- [`docs/stack.md`](docs/stack.md) — Descripción detallada del stack tecnológico
- [`docs/arquitectura.md`](docs/arquitectura.md) — Diagrama de arquitectura, flujos y decisiones técnicas

## Desarrollo

```bash
# Próximamente...
```

## Licencia

Proyecto académico — Hackathon Guide Financial Agents IA 2026
