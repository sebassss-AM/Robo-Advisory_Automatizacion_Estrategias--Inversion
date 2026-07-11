from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.profiling_routes import router as profiling_router
from backend.app.api.portfolio_routes import router as portfolio_router
from backend.app.api.approval_routes import router as approval_router
from backend.app.infrastructure.database import init_db, close as close_db
from backend.app.infrastructure.redis_session import close as close_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as e:
        print(f"[WARN] Base de datos no disponible: {e}")
    yield
    try:
        close_db()
    except Exception:
        pass
    try:
        await close_redis()
    except Exception:
        pass


app = FastAPI(
    title="Robo-Advisory API",
    description="API de asesoría financiera automatizada con agentes IA",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profiling_router)
app.include_router(portfolio_router)
app.include_router(approval_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
