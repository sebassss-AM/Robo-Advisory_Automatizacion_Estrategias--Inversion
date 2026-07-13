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
| `/api/revisar/historial` | GET | Obtiene audit trail de decisiones |
| `/api/notificaciones` | GET | Obtiene notificaciones del usuario |
| `/api/chat` | POST | Chat con el agente financiero IA |
| `/api/demo/procesar` | POST | Procesa cuestionario en modo demo (sin LLM) |

**Por qué:** FastAPI es rápido, tiene tipado automático con Pydantic (ideal para datos financieros), y Vercel soporta Python serverless functions nativamente.

---

## LLM — Groq (Llama 3.3 70B)

Modelo de lenguaje que:

- Explica por qué se asignó cierto perfil de riesgo
- Justifica la distribución de activos en lenguaje natural
- Responde preguntas del usuario sobre su propuesta

**Qué NO hace:** No calcula porcentajes, no genera datos financieros, no ejecuta órdenes. Solo explica y conversa.

**Por qué:** Groq ofrece inferencia ultrarrápida con free tier generoso.

---

## Base de Datos — Neon (PostgreSQL)

Base de datos SQL serverless para datos persistentes:

| Tabla | Contenido |
|-------|-----------|
| `profiles` | Respuestas del cuestionario + perfil calculado |
| `proposals` | Asignación de activos generada |
| `decisions` | Audit trail: quién, qué, cuándo, versión de reglas |
| `rules` | Reglas de perfilamiento versionadas |
| `users` | Usuarios (clientes y asesores) |

**Por qué:** PostgreSQL serverless, 500MB gratis. Neon es el proveedor real.

---

## Testing — pytest + mocks

Suite de pruebas automatizadas:

| Nivel | Qué probar |
|-------|------------|
| Unitarias | Reglas de perfilamiento, cálculo de portafolio, validación de datos |
| Integración | Flujo completo con LLM mockeado |

---

## Despliegue — Vercel

Todo corre en una plataforma:

- Frontend Next.js → Vercel (build automático)
- FastAPI → Serverless Functions en Vercel
- Base de datos → Neon (PostgreSQL)
- Un solo `vercel deploy` y todo está arriba
