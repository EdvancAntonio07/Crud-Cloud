"""
runserver.py — Comando personalizado que sobreescribe el runserver de Django

PROBLEMA:
  El comando original de Django siempre llama a check_migrations() al arrancar,
  lo que fuerza una conexión a la base de datos. Si Supabase está pausado o
  no hay conexión, el servidor no arranca aunque el código esté bien.

SOLUCIÓN:
  Sobreescribimos SOLO el método check_migrations() para que no haga nada.
  Todo lo demás del runserver funciona exactamente igual.

USO:
  python manage.py runserver   (igual que siempre, sin cambios)
"""

from django.core.management.commands.runserver import Command as RunserverCommand


class Command(RunserverCommand):
    """
    Versión del runserver que omite la verificación de migraciones.
    Las tablas ya existen en Supabase (managed=False), no necesitamos verificarlas.
    """

    def check_migrations(self):
        """
        Sobreescribimos este método para que NO intente conectarse a la BD.
        El método original verifica si hay migraciones pendientes,
        lo cual requiere una conexión activa a la base de datos.
        """
        # No hacemos nada — las tablas ya existen en Supabase
        pass
