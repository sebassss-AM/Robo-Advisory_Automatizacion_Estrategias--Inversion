import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.app.main import app as fastapi_app


async def handler(scope, receive, send):
    if scope["type"] == "http":
        path = scope.get("path", "")
        if path == "/api/ping":
            body = json.dumps({"ok": True, "path": path}).encode()
            await send(
                {
                    "type": "http.response.start",
                    "status": 200,
                    "headers": [
                        [b"content-type", b"application/json"],
                    ],
                }
            )
            await send(
                {
                    "type": "http.response.body",
                    "body": body,
                }
            )
            return
    await fastapi_app(scope, receive, send)
