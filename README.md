# InversIA — Robo-Advisory con IA

**Hackathon Guide Financial Agents IA — Track 3**

Sistema de asesoría financiera automatizada con IA. Realiza perfilamiento de riesgo, genera propuestas de portafolio con datos de mercado reales, y permite revisión por un asesor humano antes de cualquier acción.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 (App Router + Tailwind v4) |
| Backend | FastAPI (Python serverless en Vercel) |
| LLM | Groq (Llama 3.3 70B) — OpenAI-compatible |
| Base de datos | Neon (PostgreSQL serverless) |
| Datos de mercado | yfinance (Yahoo Finance, sin API key) |
| Testing | pytest |
| Despliegue | Vercel |

---

## Funcionalidades

- **Dos roles**: `cliente` y `asesor` — registro con selector de rol
- **Perfilamiento de riesgo**: cuestionario interactivo que calcula perfil (conservador, moderado, agresivo) con reglas visibles
- **Propuesta de portafolio**: asignación de activos con datos de mercado reales (precio, P/E, dividendos), rentabilidad estimada ponderada y proyección de crecimiento
- **Revisión por asesor**: flujo completo pendiente → en revisión → completado, con edición de distribución antes de aprobar
- **Modo demo**: `/demo` permite probar el cuestionario sin registro (sin LLM, sin guardar en DB)
- **Chat IA**: agente financiero flotante en la propuesta que responde preguntas sobre el portafolio
- **Notificaciones**: polling cada 60s con badge, toast y dropdown de historial
- **Datos reales de mercado**: precios actuales, P/E, dividend yield y retorno YTD vía yfinance para SPY, VTI, QQQ, BND, VXUS, SHY, SGOV (caché de 5 min)

---

## Roles

| Rol | Acceso | Funcionalidad |
|-----|--------|---------------|
| `cliente` | Registro/login | Cuestionario → ver mis perfilamientos → esperar revisión |
| `asesor` | Registro/login | Ver pendientes → reclamar → revisar/editar propuesta → aprobar/rechazar |

---

## Autenticación

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/auth/register` | Registro con rol (`cliente` o `asesor`) |
| `POST /api/auth/login` | Inicio de sesión (devuelve JWT + datos del usuario) |
| `GET /api/auth/me` | Verificar token activo |

- Contraseñas hasheadas con **bcrypt**
- Tokens **JWT** expiran a las 24 horas
- Sesión persiste en `localStorage`

---

## API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/perfil` | POST | Enviar respuestas del cuestionario → crear perfil |
| `/api/perfil/{id}` | GET | Obtener perfil por ID |
| `/api/perfil/{id}` | DELETE | Eliminar perfil (solo dueño) |
| `/api/perfil/mis-perfilamientos` | GET | Historial de perfiles del cliente |
| `/api/perfil/pendientes` | GET | Perfiles pendientes (asesor) |
| `/api/perfil/en-revision` | GET | Perfiles en revisión del asesor |
| `/api/perfil/{id}/reclamar` | POST | Asesor reclama un perfil pendiente |
| `/api/propuesta` | POST | Generar propuesta de portafolio |
| `/api/propuesta/{id}` | GET | Obtener propuesta por ID |
| `/api/revisar` | POST | Aprobar/rechazar/editado |
| `/api/revisar/historial` | GET | Historial de decisiones |
| `/api/chat` | POST | Chat con el agente financiero IA |
| `/api/notificaciones` | GET | Notificaciones del usuario |
| `/api/demo/procesar` | POST | Procesar cuestionario en modo demo |
| `/api/health` | GET | Health check |
| `/api/db-check` | GET | Diagnóstico Neon |

---

## Estructura del Proyecto

```
/
├── frontend/                          # Next.js App Router
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing page (dual audience)
│   │   ├── globals.css                # Design system (glass, premium, animaciones)
│   │   ├── login/page.tsx             # Inicio de sesión
│   │   ├── register/page.tsx          # Registro con selector de rol
│   │   ├── cuestionario/page.tsx      # Perfilamiento de riesgo
│   │   ├── propuesta/page.tsx         # Dashboard de portafolio + ChatBot + ApprovalPanel
│   │   ├── mis-perfilamientos/page.tsx # Historial del cliente
│   │   ├── asesor/page.tsx            # Panel del asesor
│   │   ├── dashboard/page.tsx         # Dashboard cliente (stats, actividad)
│   │   └── demo/page.tsx              # Modo demo sin registro
│   ├── components/
│   │   ├── RiskQuestionnaire.tsx      # Cuestionario paso a paso
│   │   ├── PortfolioChart.tsx         # Gráfico de torta SVG
│   │   ├── ApprovalPanel.tsx          # Panel de aprobación del asesor
│   │   ├── ChatBot.tsx                # Chat flotante IA
│   │   └── NotificationBell.tsx       # Notificaciones con badge + toast
│   └── services/
│       ├── api-client.ts              # Cliente HTTP tipado
│       └── auth.ts                    # Auth service (JWT + localStorage)
│
├── api/index.py                       # Vercel serverless entry
│
├── backend/app/
│   ├── main.py                        # FastAPI app
│   ├── api/                           # Routes
│   │   ├── auth_routes.py
│   │   ├── profiling_routes.py
│   │   ├── portfolio_routes.py
│   │   ├── approval_routes.py
│   │   ├── chat_routes.py
│   │   ├── notifications_routes.py
│   │   └── demo_routes.py
│   ├── agents/
│   │   ├── state.py
│   │   └── investor_profiling_node.py
│   ├── domain/
│   │   ├── risk_profiling_rules.py
│   │   ├── asset_allocation_policies.py
│   │   └── instrument_catalog.py
│   ├── models/
│   │   ├── investor_profile.py
│   │   ├── portfolio_proposal.py
│   │   └── audit_decision.py
│   ├── services/
│   │   └── market_data.py             # yfinance wrapper con caché
│   ├── infrastructure/
│   │   ├── database.py                # PostgreSQL conexión
│   │   └── schema.sql
│   └── llm/
│       └── groq_client.py             # Cliente Groq (OpenAI compat)
│
├── tests/
│   ├── conftest.py
│   └── test_profiling.py
├── docs/
│   ├── stack.md
│   └── arquitectura.md
├── .env.example
├── vercel.json
├── requirements.txt
└── README.md
```

---

## Variables de Entorno

```
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_tu_key_aqui          # https://console.groq.com
JWT_SECRET=tu_secreto                 # Opcional, default para desarrollo
```

---

## Desarrollo Local

### Linux / macOS

```bash
# Terminal 1 — Backend (FastAPI)
source .venv/bin/activate
uvicorn backend.app.main:app --reload --port 8000

# Terminal 2 — Frontend (Next.js)
cd frontend
npm run dev -- --port 3000
```

Luego abrir http://localhost:3000

### Windows (PowerShell)

```powershell
# Terminal 1 — Backend (FastAPI)
.venv\Scripts\activate
uvicorn backend.app.main:app --reload --port 8000

# Terminal 2 — Frontend (Next.js)
cd frontend
npm run dev -- --port 3000
```

Luego abrir http://localhost:3000

> ⚠️ El frontend necesita el backend corriendo para que funcionen las APIs.
> La base de datos está en Neon (nube), no requiere instalación local.
> El proxy `/api/*` → `localhost:8000` está configurado en `next.config.js`.

---

## Despliegue (Vercel)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel Dashboard: `DATABASE_URL`, `GROQ_API_KEY`, `JWT_SECRET`
3. Vercel detecta automáticamente Next.js en `frontend/` y Python en `api/`
4. El `vercel.json` en la raíz configura las rutas

---

## Licencia

Proyecto académico — Hackathon Guide Financial Agents IA 2026
