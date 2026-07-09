# ─────────────────────────────────────────────
# Dockerfile — Backend Django
# ─────────────────────────────────────────────
FROM python:3.11-slim

# Evita archivos .pyc y activa logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instala dependencias del sistema necesarias para psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala dependencias Python
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copia el código fuente
COPY . .

# Expone el puerto del servidor de desarrollo Django
EXPOSE 8000

# Comando de arranque
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
