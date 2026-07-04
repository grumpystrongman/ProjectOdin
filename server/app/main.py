
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_SECRET = os.getenv("ODIN_TRUST_SECRET", "local-development-secret-change-before-hosting")
GITHUB_USER = os.getenv("ODIN_GITHUB_USER", "grumpystrongman")
CACHE_DIR = Path(__file__).resolve().parents[1] / "data"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
CACHE_FILE = CACHE_DIR / "github_repositories.json"

# Audit log file for contact and vault unlock events. This log
# intentionally avoids storing any sensitive visitor identifiers. Each
# entry contains the event name, issued timestamp, and minimal
# contextual metadata. During local development the file lives in
# the server data directory. When hosted, ensure the directory is
# writable by the service account.
AUDIT_FILE = CACHE_DIR / "unlock_audit.log"

def _log_audit(event: str, meta: dict[str, Any] | None = None) -> None:
    """Append a JSON entry to the audit log.

    The audit trail records high‑level events such as trust token
    issuance and contact verification. Only minimal metadata is
    captured to avoid collecting personally identifiable information.
    """
    try:
        AUDIT_FILE.parent.mkdir(parents=True, exist_ok=True)
        entry = {
            "event": event,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        if meta:
            entry.update(meta)
        with AUDIT_FILE.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, separators=(",", ":")) + "\n")
    except Exception:
        # Do not crash the request if audit logging fails.
        pass

app = FastAPI(title="Project ODIN Backend", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8501", "http://127.0.0.1:8501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrialPayload(BaseModel):
    score: int = Field(ge=1, le=99)
    turns: int = Field(ge=1, le=20)
    insight: int = Field(ge=0, le=40)
    stability: int = Field(ge=0, le=30)
    pressure: int = Field(ge=0, le=30)

class ContactVerifyPayload(BaseModel):
    token: str

class RepositoryRecord(BaseModel):
    repo: str
    title: str
    realm: str
    status: str
    signal: int
    language: str | None = None
    url: str
    updatedAt: str | None = None
    stars: int = 0
    forks: int = 0

@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "project-odin", "version": "0.4.0"}

@app.post("/api/trust-token")
def create_trust_token(payload: TrialPayload) -> dict[str, Any]:
    if payload.insight < 16 or payload.stability <= 0 or payload.pressure >= 11:
        raise HTTPException(status_code=422, detail="Trial is not balanced enough to unlock the vault.")
    issued_at = datetime.now(timezone.utc).isoformat()
    body = payload.model_dump() | {"scope": "project-odin-contact-reveal", "issuedAt": issued_at}
    packed = _b64(json.dumps(body, separators=(",", ":")).encode())
    signature = hmac.new(APP_SECRET.encode(), packed.encode(), hashlib.sha256).hexdigest()[:32]
    token = f"odin.{packed}.{signature}"
    # Record issuance in the audit trail. Only the score and timestamp are logged.
    _log_audit("trust-token-issued", {"score": payload.score, "issuedAt": issued_at})
    return {"token": token, "mode": "server", "issuedAt": issued_at, "score": payload.score}

@app.post("/api/contact/verify")
def verify_contact(payload: ContactVerifyPayload) -> dict[str, Any]:
    body = _verify_token(payload.token)
    # Record verification in the audit trail. Only the issuedAt timestamp is logged.
    _log_audit("contact-verified", {"issuedAt": body.get("issuedAt")})
    return {
        "ok": True,
        "issuedAt": body.get("issuedAt"),
        "contact": {
            "email": os.getenv("ODIN_CONTACT_EMAIL", "cmajeff@gmail.com"),
            "phone": os.getenv("ODIN_CONTACT_PHONE", "available on request"),
        },
    }

@app.get("/api/github/repositories")
async def github_repositories() -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.get(f"https://api.github.com/users/{GITHUB_USER}/repos?sort=updated&per_page=30")
            response.raise_for_status()
            raw = response.json()
        records = [_map_repo(item) for item in raw]
        CACHE_FILE.write_text(json.dumps(records, indent=2), encoding="utf-8")
        return {"source": "github", "repositories": records, "cachedAt": datetime.now(timezone.utc).isoformat()}
    except Exception as exc:
        if CACHE_FILE.exists():
            return {"source": "server-cache", "repositories": json.loads(CACHE_FILE.read_text()), "warning": str(exc)}
        return {"source": "server-empty", "repositories": [], "warning": str(exc)}


# Provide a backwards‑compatible alias for the workshop route. The original
# documentation specified `/api/github/workshop`; this alias forwards to
# the canonical `/api/github/repositories` implementation for API
# consumers.
@app.get("/api/github/workshop")
async def github_workshop() -> dict[str, Any]:
    return await github_repositories()

def _map_repo(item: dict[str, Any]) -> dict[str, Any]:
    name = item.get("name", "unknown")
    text = f"{name} {item.get('description') or ''}".lower()
    realm = "workshop"
    if any(word in text for word in ["threadline", "ai", "agent", "llm"]): realm = "sanctum"
    elif any(word in text for word in ["analytics", "fabric", "databricks", "dbt", "platform"]): realm = "forge"
    elif any(word in text for word in ["health", "payer", "hipaa", "clinical"]): realm = "archive"
    elif any(word in text for word in ["quantum", "weather", "simulation"]): realm = "observatory"
    signal = min(99, 48 + int(item.get("stargazers_count") or 0) * 5 + int(item.get("forks_count") or 0) * 3)
    if not item.get("description"): signal -= 5
    return {
        "repo": name,
        "title": item.get("description") or "Living project artifact",
        "realm": realm,
        "status": "active" if not item.get("archived") else "archived",
        "signal": max(25, signal),
        "language": item.get("language") or "unknown",
        "url": item.get("html_url") or f"https://github.com/{GITHUB_USER}/{name}",
        "updatedAt": item.get("updated_at"),
        "stars": int(item.get("stargazers_count") or 0),
        "forks": int(item.get("forks_count") or 0),
    }

def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")

def _verify_token(token: str) -> dict[str, Any]:
    try:
        prefix, packed, signature = token.split(".", 2)
    except ValueError:
        raise HTTPException(status_code=401, detail="Malformed token")
    if prefix != "odin":
        raise HTTPException(status_code=401, detail="Unexpected token scope")
    expected = hmac.new(APP_SECRET.encode(), packed.encode(), hashlib.sha256).hexdigest()[:32]
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=401, detail="Invalid token signature")
    padded = packed + "=" * (-len(packed) % 4)
    try:
        body = json.loads(base64.urlsafe_b64decode(padded.encode()).decode())
    except Exception:
        raise HTTPException(status_code=401, detail="Unreadable token")
    if body.get("scope") != "project-odin-contact-reveal":
        raise HTTPException(status_code=401, detail="Invalid token scope")
    return body
