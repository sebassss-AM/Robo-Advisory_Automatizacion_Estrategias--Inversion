import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv()

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

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    if not isinstance(detail, str):
        detail = str(detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": detail})


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error interno: {str(exc)}"},
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
