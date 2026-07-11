# Arquitectura del Sistema

## Track 3: Robo-Advisory y Automatización de Estrategias de Inversión

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USUARIO                                    │
│                (Inversionista / Asesor de Inversiones)               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        CANAL (Web)                                    │
│                   Next.js + Tailwind CSS                              │
│                                                                       │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│   │ Cuestionario  │  │  Propuesta   │  │ Panel de Revisión      │    │
│   │ Perfilamiento │  │  Portafolio  │  │ del Asesor             │    │
│   └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘    │
└──────────┼─────────────────┼──────────────────────┼──────────────────┘
           │                 │                      │
           ▼                 ▼                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (FastAPI)                             │
│                                                                       │
│   POST /api/perfil     POST /api/propuesta    POST /api/revisar     │
│   GET  /api/historial  POST /api/reglas       GET  /api/perfil/:id  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   ORQUESTADOR — LANGGRAPH                             │
│                                                                       │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │                    StateGraph                                   │  │
│   │                                                                  │  │
│   │   ┌────────────┐    ┌────────────┐    ┌────────────────┐       │  │
│   │   │  Nodo 1:   │    │  Nodo 2:   │    │  Nodo 3:       │       │  │
│   │   │ Profiling  │───▶│ Portfolio  │───▶│  Approval      │       │  │
│   │   │ Agent      │    │ Agent      │    │  Agent         │       │  │
│   │   └─────┬──────┘    └─────┬──────┘    └───────┬────────┘       │  │
│   │         │                 │                    │                │  │
│   │         ▼                 ▼                    ▼                │  │
│   │   ┌────────────┐    ┌────────────┐    ┌────────────────┐       │  │
│   │   │ Gemini LLM │    │ Gemini LLM │    │ Gemini LLM     │       │  │
│   │   │ (explica)  │    │ (explica)  │    │ (resume)       │       │  │
│   │   └────────────┘    └────────────┘    └────────────────┘       │  │
│   └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS                                      │
│                                                                       │
│   ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐      │
│   │ Vercel Postgres │  │   Vercel KV    │  │    ChromaDB       │      │
│   │ (Neon)          │  │  (Upstash Redis│  │  (Vector Store)   │      │
│   │                  │  │                │  │                   │      │
│   │ • perfiles      │  │ • sesiones     │  │ • documentos      │      │
│   │ • propuestas    │  │ • caché        │  │   financieros     │      │
│   │ • audit trail   │  │ • estado conv. │  │ • normativas      │      │
│   │ • reglas        │  │                │  │ • reglas          │      │
│   └────────────────┘  └────────────────┘  └──────────────────┘      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Flujo del Usuario (3 Historias de Usuario)

### HU1: Perfil de Inversionista Transparente

```
Inversionista                     Agente                           DB
     │                               │                               │
     ├── Responde cuestionario ──────▶│                               │
     │                               ├── Calcula perfil ────────────▶│
     │                               │   (reglas versionadas)        │
     │                               │◀──────── guarda perfil ───────│
     │◀── Muestra perfil + explicación ──────────────────────────────│
     │       (por qué ese riesgo,                                  │
     │        qué significa cada respuesta)                        │
```

**Reglas de perfilamiento (ejemplo):**
- Si horizonte < 3 años → perfil Conservador
- Si horizonte 3-7 años → perfil Moderado
- Si horizonte > 7 años + tolerancia alta → perfil Agresivo

### HU2: Propuesta Explicable de Portafolio

```
Inversionista                     Agente                           DB
     │                               │                               │
     ├── Solicita propuesta ─────────▶│                               │
     │                               ├── Consulta perfil ───────────▶│
     │                               │◀──────── perfil ──────────────│
     │                               ├── Consulta catálogo ─────────▶│
     │                               │   de instrumentos             │
     │                               ├── Calcula asignación          │
     │                               │   (reglas de portafolio)      │
     │                               ├── Guarda propuesta ──────────▶│
     │◀── Muestra portafolio ────────────────────────────────────────│
     │       • 60% Renta Fija                                        │
     │       • 30% Renta Variable                                    │
     │       • 10% Liquidez                                          │
     │       • Riesgo esperado: Bajo                                 │
     │       • Explicación: "Porque tu perfil es Conservador..."     │
```

**Reglas de portafolio (ejemplo):**
- Conservador → 60% RF, 30% RV, 10% Liquidez
- Moderado → 40% RF, 50% RV, 10% Liquidez
- Agresivo → 20% RF, 70% RV, 10% Liquidez

### HU3: Revisión por Asesor Autorizado

```
Asesor                            Agente                           DB
  │                                 │                               │
  ├── Recibe resumen ───────────────▶│                               │
  │   (perfil + propuesta +         │                               │
  │    justificación)               │                               │
  │                                 │                               │
  ├── Aprueba / Edita / Rechaza ────▶│                               │
  │                                 ├── Registra decisión ─────────▶│
  │                                 │   • fecha                     │
  │                                 │   • versión de reglas         │
  │                                 │   • responsable               │
  │                                 │   • acción                    │
```

---

## Integración con Sistema Empresarial Existente

El sistema está diseñado como una **capa agéntica** que se integra sobre infraestructura existente:

### APIs de integración
- **Catálogo de instrumentos financieros** → API REST externa (simulada con datos ficticios)
- **Sistema de órdenes / ejecución** → NO ejecuta órdenes. Emite propuestas para revisión humana.
- **Sistema CRM del asesor** → Exporta perfil y decisiones vía webhook

### Modelo de despliegue
- **Frontend:** Widget embebible en portal bancario existente (iframe o micro-frontend)
- **Backend:** API que cualquier sistema interno puede consumir
- **Datos:** Base de datos independiente que puede replicarse al data warehouse corporativo

### Cumplimiento regulatorio
- Acciones sensibles quedan como propuesta/alerta (no ejecuta)
- Audit trail completo para regulatorio
- Reglas versionadas y visibles (no caja negra)

---

## Mitigación de Riesgos / Anti-alucinación

| Riesgo | Mitigación |
|--------|-----------|
| El LLM inventa datos financieros | NO se usa LLM para cálculos. Motor de reglas determinístico |
| El LLM da consejos no regulados | Prompt engineering + RAG con documentos autorizados |
| El LLM alucina instrumentos | Catálogo ficticio aprobado, consultado vía base de datos |
| Recomendación sin fundamento | Cada explicación cita las reglas que la generaron |

---

## Canales

| Canal | Implementación | Estado |
|-------|---------------|--------|
| Web | Next.js (responsive) | Principal |
| API | FastAPI endpoints | Para integración empresarial |

---

## Tipo de Negocio

**Banca de inversión / Wealth Management / Fintech de asesoría financiera.**

Aplica a:
- Bancos que quieren digitalizar su servicio de asesoría
- Fintech que ofrecen inversión automatizada
- Sociedades agentes de bolsa
- Cualquier entidad regulada que necesite un asesor financiero IA con supervisión humana
