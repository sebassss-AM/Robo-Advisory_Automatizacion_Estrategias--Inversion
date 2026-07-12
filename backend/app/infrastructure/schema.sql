-- Esquema para Neon (Postgres)
-- 1. Ir a https://console.neon.tech -> SQL Editor
-- 2. Copiar y pegar todo esto
-- 3. Ejecutar

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    answers JSONB NOT NULL,
    profile VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL,
    rules_version VARCHAR(10) NOT NULL,
    explanations JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    profile_id TEXT REFERENCES profiles(id),
    allocations JSONB NOT NULL,
    risk_metrics JSONB NOT NULL,
    explanation TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    proposal_id TEXT REFERENCES proposals(id),
    advisor_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    comments TEXT,
    edited_allocations JSONB,
    rules_version VARCHAR(10) NOT NULL,
    decided_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'cliente',
    created_at TIMESTAMP DEFAULT NOW()
);
