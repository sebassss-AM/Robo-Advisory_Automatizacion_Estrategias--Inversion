import os
from typing import Optional

import psycopg2
from psycopg2.extras import RealDictCursor

_connection: Optional[psycopg2.extensions.connection] = None


def get_connection() -> psycopg2.extensions.connection:
    global _connection
    if _connection is None or _connection.closed:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL no configurada")
        _connection = psycopg2.connect(database_url)
        _connection.autocommit = True
    return _connection


def execute_query(query: str, params: tuple = ()) -> list[dict]:
    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params)
        if cur.description:
            return cur.fetchall()
        return []


def execute_insert(query: str, params: tuple = ()) -> Optional[str]:
    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, params)
        if cur.description:
            result = cur.fetchone()
            return str(result["id"]) if result else None
    return None


def init_db():
    queries = [
        """
        CREATE TABLE IF NOT EXISTS profiles (
            id SERIAL PRIMARY KEY,
            answers JSONB NOT NULL,
            profile VARCHAR(20) NOT NULL,
            score INTEGER NOT NULL,
            rules_version VARCHAR(10) NOT NULL,
            explanations JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS proposals (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER REFERENCES profiles(id),
            allocations JSONB NOT NULL,
            risk_metrics JSONB NOT NULL,
            explanation TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS decisions (
            id SERIAL PRIMARY KEY,
            proposal_id INTEGER REFERENCES proposals(id),
            advisor_id VARCHAR(100) NOT NULL,
            action VARCHAR(20) NOT NULL,
            comments TEXT,
            edited_allocations JSONB,
            rules_version VARCHAR(10) NOT NULL,
            decided_at TIMESTAMP DEFAULT NOW()
        )
        """,
    ]
    for query in queries:
        execute_query(query)


def close():
    global _connection
    if _connection and not _connection.closed:
        _connection.close()
        _connection = None
