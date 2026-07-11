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


def init_db():
    drop_queries = [
        "DROP TABLE IF EXISTS decisions CASCADE",
        "DROP TABLE IF EXISTS proposals CASCADE",
        "DROP TABLE IF EXISTS profiles CASCADE",
    ]
    for q in drop_queries:
        try:
            execute_query(q)
        except Exception:
            pass

    create_queries = [
        """
        CREATE TABLE profiles (
            id TEXT PRIMARY KEY,
            answers JSONB NOT NULL,
            profile VARCHAR(20) NOT NULL,
            score INTEGER NOT NULL,
            rules_version VARCHAR(10) NOT NULL,
            explanations JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """,
        """
        CREATE TABLE proposals (
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
        CREATE TABLE decisions (
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
    ]
    for q in create_queries:
        try:
            execute_query(q)
        except Exception as e:
            print(f"[WARN] No se pudo crear tabla: {e}")


def close():
    global _connection
    if _connection and not _connection.closed:
        _connection.close()
        _connection = None
