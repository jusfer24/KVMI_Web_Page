"""
Configuracion Django del backend KVMI.

Fase 1 (MVP): SQL Server como unica base de datos. Usuarios, autenticacion y
el flujo transaccional del checkout operan sobre esquemas relacionales.

Fase 2: se anadira MongoDB via DATABASE_ROUTERS para el catalogo masivo y los
recursos de alta velocidad (assets AR/3D). Ver docs/ARCHITECTURE.md.
"""
from pathlib import Path
import os

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "solo-para-desarrollo")
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "catalog",
    "orders",
    "concierge",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "kvmi_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "kvmi_backend.wsgi.application"
ASGI_APPLICATION = "kvmi_backend.asgi.application"

# Base de datos: exclusivamente SQL Server durante la Fase 1 (CLAUDE.md).
# USE_SQLITE_FOR_DEV es una salida de emergencia local, solo para levantar el
# servidor sin una instancia de SQL Server configurada. Vive unicamente en
# .env (no versionado) y nunca debe activarse fuera de una maquina de
# desarrollo individual.
if os.getenv("USE_SQLITE_FOR_DEV", "False").lower() == "true":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "mssql",
            "NAME": os.getenv("MSSQL_DB_NAME", "kvmi"),
            "USER": os.getenv("MSSQL_DB_USER", ""),
            "PASSWORD": os.getenv("MSSQL_DB_PASSWORD", ""),
            "HOST": os.getenv("MSSQL_DB_HOST", "localhost"),
            "PORT": os.getenv("MSSQL_DB_PORT", "1433"),
            "OPTIONS": {
                "driver": os.getenv("MSSQL_ODBC_DRIVER", "ODBC Driver 17 for SQL Server"),
            },
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "es-ec"
TIME_ZONE = "America/Guayaquil"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS: el frontend Astro corre en un origen distinto durante el desarrollo.
CORS_ALLOWED_ORIGINS = [os.getenv("FRONTEND_ORIGIN", "http://localhost:4321")]
