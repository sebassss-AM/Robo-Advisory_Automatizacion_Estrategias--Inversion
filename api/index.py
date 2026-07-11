import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

try:
    from backend.app.main import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()

    @app.get("/{path:path}")
    async def catch_all(path: str):
        return {"error": f"Error al cargar backend: {e}"}

handler = app
