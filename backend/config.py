import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()


def _normalize_db_url(url: str) -> str:
    """Neon (and Heroku) hand out URLs starting with postgres://, but
    SQLAlchemy 1.4+ requires postgresql://. Also ensures sslmode=require."""
    if not url:
        return url
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql") and "sslmode=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}sslmode=require"
    return url


class Config:
    # Database — falls back to local SQLite if DATABASE_URL is not set,
    # so local dev still works without env vars.
    SQLALCHEMY_DATABASE_URI = _normalize_db_url(os.getenv('DATABASE_URL')) or 'sqlite:///herbs.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,   # avoid stale connections on Neon's serverless pool
        "pool_recycle": 300,
    }

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')

    # Comma-separated list of allowed origins for CORS, e.g.
    #   CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173
    CORS_ORIGINS = [
        o.strip()
        for o in os.getenv(
            'CORS_ORIGINS',
            'http://localhost:5173,http://localhost:3000'
        ).split(',')
        if o.strip()
    ]
