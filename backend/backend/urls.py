from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Panel de administración — descomenta cuando Supabase esté activo
    # path("admin/", admin.site.urls),

    # Todas las rutas de nuestra API empiezan con /api/
    path("api/", include("clientes_app.urls")),
]
