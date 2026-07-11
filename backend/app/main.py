import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
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

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = [f"{'.'.join(str(p) for p in e['loc'])}: {e['msg']}" for e in errors]
    return JSONResponse(
        status_code=422,
        content={"detail": "; ".join(messages)},
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


@app.get("/api/db-check")
async def db_check():
    from backend.app.infrastructure.database import get_connection, execute_query

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        return {
            "connected": False,
            "error": "DATABASE_URL no está configurada",
            "solution": "Agrega DATABASE_URL en Vercel Dashboard → Settings → Environment Variables",
        }

    try:
        conn = get_connection()
        if conn is None:
            return {
                "connected": False,
                "error": "get_connection() devolvió None",
                "solution": "Verifica que DATABASE_URL sea correcta",
            }
        result = execute_query("SELECT NOW() as now")
        tables = execute_query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
        )
        return {
            "connected": True,
            "db_time": str(result[0]["now"]) if result else None,
            "tables": [t["table_name"] for t in tables] if tables else [],
            "note": "Neon está funcionando correctamente",
        }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e),
            "solution": "Verifica que DATABASE_URL sea correcta y que Neon permita la conexión",
        }
