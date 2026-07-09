"""

Tabla de endpoints disponibles:
┌──────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ URL                                          │ Descripción                                   │
├──────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ GET  /api/regiones/                          │ Listar todas las regiones                     │
│ GET  /api/provincias/                        │ Listar provincias (filtrar por ?region=id)     │
│ GET  /api/ciudades/                          │ Listar ciudades (filtrar por ?provincia=id)    │
│ GET  /api/categorias/                        │ Listar categorías de cliente                  │
├──────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ GET  /api/clientes/                          │ Listar todos los clientes activos             │
│ POST /api/clientes/                          │ Crear un nuevo cliente                        │
│ GET  /api/clientes/{rut}/                    │ Ver detalle de un cliente por RUT             │
│ PATCH /api/clientes/{rut}/                   │ Actualizar nombre y teléfono del cliente      │
│ DELETE /api/clientes/{rut}/                  │ Borrado lógico (activo=False)                 │
│ DELETE /api/clientes/{rut}/eliminar/         │ Borrado físico permanente (requiere confirmar)│
└──────────────────────────────────────────────┴───────────────────────────────────────────────┘
"""

from django.urls import path
from . import views
app_name = "clientes_app"

urlpatterns = [

    # GET /api/node-info/  → información del nodo que sirve esta petición
    path(
        "node-info/",
        views.NodeInfoView.as_view(),
        name="node-info"
    ),

    # ──────────────────────────────────────────
    # RUTAS DE TABLAS DE APOYO (solo GET)
    # ──────────────────────────────────────────

    # GET /api/regiones/
    path(
        "regiones/",
        views.RegionListView.as_view(),
        name="region-list"
    ),

    # GET /api/provincias/   →  GET /api/provincias/?region=1
    path(
        "provincias/",
        views.ProvinciaListView.as_view(),
        name="provincia-list"
    ),

    # GET /api/ciudades/   →  GET /api/ciudades/?provincia=2
    path(
        "ciudades/",
        views.CiudadListView.as_view(),
        name="ciudad-list"
    ),

    # GET /api/categorias/
    path(
        "categorias/",
        views.CategoriaListView.as_view(),
        name="categoria-list"
    ),

    # ──────────────────────────────────────────
    # RUTAS DE CLIENTES (CRUD completo)
    # ──────────────────────────────────────────

    # GET  /api/clientes/   → listar clientes
    # POST /api/clientes/   → crear cliente
    path(
        "clientes/",
        views.ClienteListCreateView.as_view(),
        name="cliente-list-create"
    ),
    path(
        "clientes/<str:rut>/eliminar/",
        views.ClienteEliminarFisicoView.as_view(),
        name="cliente-eliminar-fisico"
    ),
    path(
        "clientes/<str:rut>/",
        views.ClienteDetailView.as_view(),
        name="cliente-detail"
    ),
]
