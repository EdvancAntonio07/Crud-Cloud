
"""
manage.py — Utilidad de línea de comandos de Django

Comandos más usados durante el desarrollo:
  python manage.py runserver        → Inicia el servidor en localhost:8000
  python manage.py makemigrations   → Genera archivos de migración
  python manage.py migrate          → Aplica migraciones a la BD
  python manage.py createsuperuser  → Crea un usuario administrador
"""
import os
import sys

def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "No se pudo importar Django. ¿Activaste el entorno virtual? "
            "¿Instalaste las dependencias con 'pip install -r requirements.txt'?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
