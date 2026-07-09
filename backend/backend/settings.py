from pathlib import Path
import os
from dotenv import load_dotenv

# Directorio raíz del proyecto (carpeta que contiene manage.py)
BASE_DIR = Path(__file__).resolve().parent.parent

# ─────────────────────────────────────────────
# 1. Cargamos las variables del archivo .env
# ─────────────────────────────────────────────
# Usamos ruta EXPLÍCITA para que siempre encuentre el .env
# sin importar desde qué carpeta se ejecute manage.py
ENV_PATH = BASE_DIR / '.env'
load_dotenv(dotenv_path=ENV_PATH)

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-clave-por-defecto")

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = ["*"]

# ─────────────────────────────────────────────
# 3. Aplicaciones instaladas
# ─────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.contenttypes",   # requerido por DRF
    "django.contrib.auth",           # requerido por DRF
    "django.contrib.staticfiles",
    # Librerías de terceros
    "rest_framework",
    "corsheaders",
    # Nuestra aplicación
    "clientes_app",
]


# Desactiva el chequeo de migraciones de TODAS las apps al arrancar.
# Como nuestras tablas ya existen en Supabase (managed=False),
# Django no necesita crear ni verificar ninguna migración.
MIGRATION_MODULES = {
    "clientes_app":  None,
    "contenttypes":  None,
    "auth":          None,
    "admin":         None,
    "sessions":      None,
}

# ─────────────────────────────────────────────
# 4. Middlewares
# ─────────────────────────────────────────────
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


import dj_database_url

DATABASE_URL = os.getenv("DATABASE_URL", "")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,          
            ssl_require=True,        
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME":     os.getenv("DB_NAME",     "postgres"),
            "USER":     os.getenv("DB_USER",     "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST":     os.getenv("DB_HOST",     "localhost"),
            "PORT":     os.getenv("DB_PORT",     "5432"),
            "OPTIONS": {"sslmode": "require"},
        }
    }
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
LANGUAGE_CODE = "es-cl"
TIME_ZONE = "America/Santiago"
USE_I18N = True
USE_TZ = True


STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Permitir TODAS las peticiones cruzadas en entorno de desarrollo
# (Soluciona el problema de Network Error de Axios)
CORS_ALLOW_ALL_ORIGINS = True
if DEBUG:
    REST_FRAMEWORK = {
        "DEFAULT_RENDERER_CLASSES": [
            "rest_framework.renderers.JSONRenderer",
            "rest_framework.renderers.BrowsableAPIRenderer",
        ],
        "DEFAULT_PARSER_CLASSES": [
            "rest_framework.parsers.JSONParser",
        ],
        # API pública: sin autenticación requerida
        "DEFAULT_AUTHENTICATION_CLASSES": [],
        "DEFAULT_PERMISSION_CLASSES":     [],
    }
else:
    REST_FRAMEWORK = {
        "DEFAULT_RENDERER_CLASSES": [
            "rest_framework.renderers.JSONRenderer",
        ],
        "DEFAULT_PARSER_CLASSES": [
            "rest_framework.parsers.JSONParser",
        ],
        # API pública: sin autenticación requerida
        "DEFAULT_AUTHENTICATION_CLASSES": [],
        "DEFAULT_PERMISSION_CLASSES":     [],
    }

# ─────────────────────────────────────────────
# Parche: evitar conexión a BD al arrancar
# ─────────────────────────────────────────────
# Django siempre verifica migraciones al iniciar runserver.
# Como nuestras tablas ya existen en Supabase (managed=False),
# parcheamos MigrationRecorder para que no intente conectarse.
# Esto permite que el servidor arranque aunque Supabase esté pausado.
# Los endpoints de la API seguirán funcionando normalmente cuando
# Supabase esté activo, ya que la conexión se realiza por petición.
from django.db.migrations.recorder import MigrationRecorder

def _has_table(self):
    return True  # Simula que la tabla de migraciones existe

def _applied_migrations(self):
    return set()  # Simula que no hay migraciones pendientes

MigrationRecorder.has_table = _has_table
MigrationRecorder.applied_migrations = _applied_migrations
