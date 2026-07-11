import json
import os
from typing import Optional

import redis.asyncio as aioredis

_client: Optional[aioredis.Redis] = None


def get_client():
    global _client
    kv_url = os.getenv("KV_URL")
    if not kv_url:
        return None
    if _client is None:
        _client = aioredis.from_url(kv_url, decode_responses=True)
    return _client


async def set_session(session_id: str, data: dict, ttl: int = 1800):
    client = get_client()
    await client.setex(f"session:{session_id}", ttl, json.dumps(data))


async def get_session(session_id: str) -> Optional[dict]:
    client = get_client()
    data = await client.get(f"session:{session_id}")
    if data:
        return json.loads(data)
    return None


async def delete_session(session_id: str):
    client = get_client()
    await client.delete(f"session:{session_id}")


async def close():
    global _client
    if _client:
        await _client.close()
        _client = None
