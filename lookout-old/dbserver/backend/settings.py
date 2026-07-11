from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------
# BASIC DJANGO CONFIG
# -----------------------------
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-please-change-this-in-production",
)

DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")


# -----------------------------
# REQUIRED DJANGO APPS
# -----------------------------
INSTALLED_APPS = [
    # Default Django apps (required)
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',

    # Your backend app
    'api.apps.ApiConfig',
]


# -----------------------------
# MIDDLEWARE
# -----------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# -----------------------------
# URL & WSGI
# -----------------------------
ROOT_URLCONF = "backend.urls"
WSGI_APPLICATION = "backend.wsgi.application"


# Load .env file if it exists
env_path = BASE_DIR / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                try:
                    key, val = line.split("=", 1)
                    os.environ[key] = val
                except ValueError:
                    pass

import dj_database_url

# -----------------------------
# DATABASE (Neon Postgres / SQLite fallback)
# -----------------------------
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
    )
}

if DATABASES["default"]["ENGINE"] == "django.db.backends.postgresql":
    DATABASES["default"]["OPTIONS"] = {
        "sslmode": "require",
    }


# -----------------------------
# TEMPLATES (needed by Django admin & debug)
# -----------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# -----------------------------
# CORS (configure for production)
# -----------------------------
CORS_ALLOW_ALL_ORIGINS = os.environ.get("CORS_ALLOW_ALL_ORIGINS", "false").lower() == "true"

if not CORS_ALLOW_ALL_ORIGINS:
    CORS_ALLOWED_ORIGINS = os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://localhost:4173",
    ).split(",")

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "*",
]
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]


# -----------------------------
# SECURITY HEADERS (production)
# -----------------------------
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

# SSL/HSTS should be configured at the reverse proxy level (e.g., Nginx, Cloudflare)
# Not enforced at Django level to avoid redirect loops behind a proxy
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True


# -----------------------------
# STATIC (minimal)
# -----------------------------
STATIC_URL = "static/"

