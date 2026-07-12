import os
from typing import Optional

import psycopg2
from psycopg2.extras import RealDictCursor

_connection: Optional[psycopg2.extensions.connection] = None


def get_connection():
    global _connection
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return None
    if _connection is None or _connection.closed:
        _connection = psycopg2.connect(database_url)
        _connection.autocommit = True
    return _connection


def execute_query(query: str, params: tuple = ()) -> list[dict]:
    conn = get_connection()
    if not conn:
        return []
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params)
        if cur.description:
            return cur.fetchall()
        return []


def execute_insert(query: str, params: tuple = ()) -> Optional[str]:
    conn = get_connection()
    if not conn:
        return None
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params)
        if cur.description:
            result = cur.fetchone()
            return str(result["id"]) if result else None
    return None


def _ensure_database():
    conn = get_connection()
    if not conn:
        return False
    queries = [
        """
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            answers JSONB NOT NULL,
            profile VARCHAR(20) NOT NULL,
            score INTEGER NOT NULL,
            rules_version VARCHAR(10) NOT NULL,
            explanations JSONB,
            status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
            advisor_id TEXT REFERENCES users(id),
            created_at TIMESTAMP DEFAULT NOW()
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS proposals (
            id TEXT PRIMARY KEY,
            profile_id TEXT REFERENCES profiles(id),
            allocations JSONB NOT NULL,
            risk_metrics JSONB NOT NULL,
            explanation TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS decisions (
            id TEXT PRIMARY KEY,
            proposal_id TEXT REFERENCES proposals(id),
            advisor_id VARCHAR(100) NOT NULL,
            action VARCHAR(20) NOT NULL,
            comments TEXT,
            edited_allocations JSONB,
            rules_version VARCHAR(10) NOT NULL,
            decided_at TIMESTAMP DEFAULT NOW()
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            display_name VARCHAR(100),
            role VARCHAR(20) NOT NULL DEFAULT 'cliente',
            created_at TIMESTAMP DEFAULT NOW()
        )
        """,
    ]
    for q in queries:
        with conn.cursor() as cur:
            cur.execute(q)

    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'cliente'",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id)",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pendiente'",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS advisor_id TEXT REFERENCES users(id)",
        "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS requires_review BOOLEAN NOT NULL DEFAULT true",
    ]
    for m in migrations:
        with conn.cursor() as cur:
            try:
                cur.execute(m)
            except Exception:
                pass
    return True


def init_db():
    ok = _ensure_database()
    if ok:
        print("[DB] Tablas verificadas/creadas correctamente en Neon")
    else:
        print("[DB] Neon no disponible, usando almacenamiento en memoria")


def close():
    global _connection
    if _connection and not _connection.closed:
        _connection.close()
        _connection = None
