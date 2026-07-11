# Stack Tecnológico

## Frontend — Next.js (React + Tailwind CSS)

Interfaz de usuario donde el inversionista interactúa con el agente. Incluye:

- Cuestionario interactivo de perfilamiento de riesgo
- Visualización de propuesta de portafolio (gráficos de asignación)
- Panel de revisión y aprobación para el asesor
- Diseño responsive, profesional y pulido para la demo

**Por qué:** Next.js es el framework nativo de Vercel, con despliegue zero-config. Tailwind permite UI atractiva en poco tiempo.

---

## Backend / API — FastAPI (Python serverless en Vercel)

API REST que orquesta toda la comunicación:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/perfil` | POST | Recibe respuestas del cuestionario, calcula perfil |
| `/api/propuesta` | POST | Genera propuesta de portafolio según perfil |
| `/api/revisar` | POST | Asesor revisa, aprueba o rechaza |
| `/api/historial` | GET | Obtiene audit trail de decisiones |

**Por qué:** FastAPI es rápido, tiene tipado automático con Pydantic (ideal para datos financieros), y Vercel soporta Python serverless functions nativamente.

---

## Agentes IA — LangGraph (Python)

Framework para construir agentes como un grafo de estados. Cada nodo del grafo es un "agente" especializado:

```
[Inicio] → [Perfilamiento] → [Portafolio] → [Revisión Asesor] → [Fin]
     ↑            |                |               |
     |      Reglas visibles  Catálogo ficticio  Audit trail
     |      y versionadas    de instrumentos    de decisión
     └───────────── Conversación multi-turno ────────────────┘
```

**Por qué:** Los criterios de evaluación mencionan explícitamente "grafos de estados (LangGraph)". Muestra arquitectura agéntica real, no solo un prompt.

---

## LLM — Gemini API (Google)

Modelo de lenguaje que:

- Conduce la conversación con el usuario
- Explica por qué se asignó cierto perfil de riesgo
- Justifica la distribución de activos en lenguaje natural
- Genera resúmenes legibles para el asesor

**Qué NO hace:** No calcula porcentajes, no genera datos financieros, no ejecuta órdenes. Solo explica y conversa.

**Por qué:** Gemini tiene free tier generoso (60 req/min), contexto largo (1M tokens), y SDK Python oficial.

---

## Base de Datos — Vercel Postgres (Neon)

Base de datos SQL serverless para datos persistentes:

| Tabla | Contenido |
|-------|-----------|
| `perfiles` | Respuestas del cuestionario + perfil calculado |
| `propuestas` | Asignación de activos generada |
| `decisiones` | Audit trail: quién, qué, cuándo, versión de reglas |
| `reglas` | Reglas de perfilamiento versionadas (HU1) |

**Por qué:** PostgreSQL serverless, 500MB gratis, integración 1-click con Vercel. Neon es el proveedor real detrás de Vercel Postgres.

---

## Memoria / Sesiones — Vercel KV (Upstash Redis)

Almacenamiento en memoria para datos temporales:

- Estado de la conversación entre mensajes del usuario
- Sesión activa del inversionista mientras completa el perfil
- Cache de respuestas del LLM para evitar llamadas repetidas

**Por qué:** Redis serverless, integración nativa con Vercel, latencia milisegundo.

---

## Vector Store — ChromaDB (embebido)

Base de datos vectorial local para RAG (Retrieval-Augmented Generation):

- Almacena documentos financieros (reglas, normativas, descripciones de instrumentos)
- Antes de responder, el agente consulta documentos relevantes
- **Anti-alucinación:** el LLM solo habla sobre información que existe en los documentos

**Por qué:** ChromaDB es ligero, corre embebido en Python, no necesita infraestructura externa. Perfecto para una hackathon.

---

## Testing — pytest + pytest-asyncio + mocks

Suite de pruebas automatizadas:

| Nivel | Qué probar |
|-------|------------|
| Unitarias | Reglas de perfilamiento, cálculo de portafolio, validación de datos |
| Agentes | Nodos del grafo LangGraph con inputs simulados |
| Integración | Flujo completo con LLM mockeado |

**Por qué:** Los criterios de evaluación piden explícitamente evidencia de pruebas automatizadas en carpeta `tests/`.

---

## Despliegue — Vercel

Todo corre en una plataforma:

- Frontend Next.js → Vercel (build automático)
- FastAPI → Serverless Functions en Vercel
- Base de datos → Vercel Postgres (Neon)
- Memoria → Vercel KV (Redis)
- Un solo `vercel deploy` y todo está arriba
