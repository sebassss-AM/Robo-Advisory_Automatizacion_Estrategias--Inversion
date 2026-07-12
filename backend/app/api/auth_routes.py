import os
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from backend.app.infrastructure.database import execute_insert, execute_query

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "inversia-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


class RegisterRequest(BaseModel):
    username: str
    password: str
    display_name: str | None = None
    role: str = "cliente"


class LoginRequest(BaseModel):
    username: str
    password: str


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_token(user_id: str, username: str, role: str = "cliente") -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(
            credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM]
        )
        return {"id": payload["sub"], "username": payload["username"], "role": payload.get("role", "cliente")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


def get_current_advisor(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "asesor":
        raise HTTPException(status_code=403, detail="Se requiere rol de asesor")
    return user


@router.post("/register")
async def register(req: RegisterRequest):
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="El usuario debe tener al menos 3 caracteres")
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 4 caracteres")

    existing = execute_query(
        "SELECT id FROM users WHERE username = %s", (req.username,)
    )
    if existing:
        raise HTTPException(status_code=409, detail="El usuario ya existe")

    user_id = str(uuid.uuid4())
    password_hash = hash_password(req.password)

    role = req.role if req.role in ("cliente", "asesor") else "cliente"
    try:
        execute_insert(
            "INSERT INTO users (id, username, password_hash, display_name, role) VALUES (%s, %s, %s, %s, %s)",
            (user_id, req.username, password_hash, req.display_name, role),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar: {e}")

    token = create_token(user_id, req.username, role)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "username": req.username,
            "display_name": req.display_name or req.username,
            "role": role,
        },
    }


@router.post("/login")
async def login(req: LoginRequest):
    rows = execute_query(
        "SELECT id, username, password_hash, display_name, role FROM users WHERE username = %s",
        (req.username,),
    )
    if not rows:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    user = rows[0]
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    role = user.get("role", "cliente")
    token = create_token(user["id"], user["username"], role)
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "display_name": user["display_name"] or user["username"],
            "role": role,
        },
    }


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}


@router.get("/me/full")
async def get_me_full(user: dict = Depends(get_current_user)):
    rows = execute_query(
        "SELECT id, username, display_name, role FROM users WHERE id = %s",
        (user["id"],),
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"user": rows[0]}
