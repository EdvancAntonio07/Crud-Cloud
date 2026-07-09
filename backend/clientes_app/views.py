import os
import socket
import requests as http_requests

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Region, Provincia, Ciudad, CategoriaCliente, Cliente
from .serializers import (
    RegionSerializer,
    ProvinciaSerializer,
    CiudadSerializer,
    CategoriaClienteSerializer,
    ClienteListSerializer,
    ClienteCreateSerializer,
    ClienteUpdateSerializer,
)

# ══════════════════════════════════════════════════════════════
# VISTA DE INFORMACIÓN DE NODO — Para AWS ECS Fargate
# ══════════════════════════════════════════════════════════════

class NodeInfoView(APIView):
    """
    Devuelve información detallada del nodo/contenedor que está sirviendo la petición.
    Muy útil para probar Balanceadores de Carga y Auto Scaling en AWS ECS Fargate.
    """

    def get(self, request):
        import sys
        import platform
        from datetime import datetime

        hostname = socket.gethostname()
        try:
            private_ip = socket.gethostbyname(hostname)
        except Exception:
            private_ip = "N/A"

        # Información extraída desde ECS Fargate (Metadata V4)
        ecs_metadata_uri = os.environ.get("ECS_CONTAINER_METADATA_URI_V4")
        ecs_task_info = {}
        ecs_container_info = {}
        
        if ecs_metadata_uri:
            try:
                # Metadatos de la Tarea (Task) completa
                task_resp = http_requests.get(f"{ecs_metadata_uri}/task", timeout=1)
                if task_resp.status_code == 200:
                    ecs_task_info = task_resp.json()
                
                # Metadatos solo del contenedor actual
                container_resp = http_requests.get(ecs_metadata_uri, timeout=1)
                if container_resp.status_code == 200:
                    ecs_container_info = container_resp.json()
            except Exception:
                pass

        # Parsear los datos de ECS para hacerlos más legibles
        task_arn = ecs_task_info.get("TaskARN", "N/A")
        cluster_arn = ecs_task_info.get("Cluster", "N/A")
        az = ecs_task_info.get("AvailabilityZone", "N/A")
        
        # Red de Fargate
        networks = ecs_container_info.get("Networks", [])
        if networks and private_ip == "N/A":
            private_ip = networks[0].get("IPv4Addresses", ["N/A"])[0]

        return Response({
            "ok": True,
            "mensaje": "Información del nodo obtenida exitosamente",
            "nodo": {
                "sistema": {
                    "hostname": hostname,
                    "ip_privada": private_ip,
                    "os": f"{platform.system()} {platform.release()}",
                    "python_version": sys.version.split(" ")[0],
                    "hora_servidor": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                },
                "aws_ecs": {
                    "ejecutando_en_ecs": bool(ecs_metadata_uri),
                    "cluster": cluster_arn.split("/")[-1] if "/" in cluster_arn else cluster_arn,
                    "zona_disponibilidad": az,
                    "tarea_id": task_arn.split("/")[-1] if "/" in task_arn else task_arn,
                    "limite_cpu": ecs_task_info.get("Limits", {}).get("CPU", "N/A"),
                    "limite_memoria": ecs_task_info.get("Limits", {}).get("Memory", "N/A"),
                }
            },
            # Metadatos crudos por si quieres ver todo lo que AWS envía
            "ecs_raw_metadata": ecs_task_info if ecs_task_info else "No disponible (No ejecutado en ECS Fargate)"
        }, status=status.HTTP_200_OK)


class RegionListView(APIView):
    def get(self, request):
        regiones = Region.objects.all().order_by("nombre_region")
        serializer = RegionSerializer(regiones, many=True)
        return Response({
            "ok": True,
            "total": regiones.count(),
            "datos": serializer.data
        }, status=status.HTTP_200_OK)


class ProvinciaListView(APIView):
    def get(self, request):
        provincias = Provincia.objects.all().order_by("nombre_provincia")
        id_region = request.query_params.get("region")
        if id_region:
            provincias = provincias.filter(id_region=id_region)

        serializer = ProvinciaSerializer(provincias, many=True)
        return Response({
            "ok": True,
            "total": provincias.count(),
            "datos": serializer.data
        }, status=status.HTTP_200_OK)


class CiudadListView(APIView):
    def get(self, request):
        ciudades = Ciudad.objects.all().order_by("nombre_ciudad")


        id_provincia = request.query_params.get("provincia")
        if id_provincia:
            ciudades = ciudades.filter(id_provincia=id_provincia)

        serializer = CiudadSerializer(ciudades, many=True)
        return Response({
            "ok": True,
            "total": ciudades.count(),
            "datos": serializer.data
        }, status=status.HTTP_200_OK)


class CategoriaListView(APIView):
    def get(self, request):
        categorias = CategoriaCliente.objects.all().order_by("nombre_categoria")
        serializer = CategoriaClienteSerializer(categorias, many=True)
        return Response({
            "ok": True,
            "total": categorias.count(),
            "datos": serializer.data
        }, status=status.HTTP_200_OK)


# ══════════════════════════════════════════════════════════════
# VISTAS DE CLIENTES — CRUD completo
# ══════════════════════════════════════════════════════════════

class ClienteListCreateView(APIView):

    def get(self, request):
        clientes = Cliente.objects.all().order_by("-fecha_registro")

        serializer = ClienteListSerializer(clientes, many=True)
        return Response({
            "ok": True,
            "total": clientes.count(),
            "datos": serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ClienteCreateSerializer(data=request.data)

        if serializer.is_valid():
            cliente = serializer.save()
            datos_respuesta = ClienteListSerializer(cliente).data

            return Response({
                "ok": True,
                "mensaje": "Cliente creado exitosamente.",
                "datos": datos_respuesta
            }, status=status.HTTP_201_CREATED)
        return Response({
            "ok": False,
            "mensaje": "Error al crear el cliente. Verifica los datos enviados.",
            "errores": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ClienteDetailView(APIView):

    def _get_cliente(self, rut):
        try:
            return Cliente.objects.get(rut=rut)
        except Cliente.DoesNotExist:
            return None

    def get(self, request, rut):
        cliente = self._get_cliente(rut)

        if not cliente:
            return Response({
                "ok": False,
                "mensaje": f"No existe un cliente con el RUT {rut}."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ClienteListSerializer(cliente)
        return Response({
            "ok": True,
            "datos": serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request, rut):
        cliente = self._get_cliente(rut)

        if not cliente:
            return Response({
                "ok": False,
                "mensaje": f"No existe un cliente con el RUT {rut}."
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = ClienteUpdateSerializer(
            cliente,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            datos_respuesta = ClienteListSerializer(cliente).data
            return Response({
                "ok": True,
                "mensaje": "Cliente actualizado exitosamente.",
                "datos": datos_respuesta
            }, status=status.HTTP_200_OK)

        return Response({
            "ok": False,
            "mensaje": "Error al actualizar el cliente.",
            "errores": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, rut):
        cliente = self._get_cliente(rut)

        if not cliente:
            return Response({
                "ok": False,
                "mensaje": f"No existe un cliente con el RUT {rut}."
            }, status=status.HTTP_404_NOT_FOUND)
        cliente.activo = False
        cliente.save()

        return Response({
            "ok": True,
            "mensaje": f"Cliente {rut} desactivado correctamente (borrado lógico). "
                       "El registro se conserva en la base de datos."
        }, status=status.HTTP_200_OK)


class ClienteEliminarFisicoView(APIView):
    def delete(self, request, rut):
        try:
            cliente = Cliente.objects.get(rut=rut)
        except Cliente.DoesNotExist:
            return Response({
                "ok": False,
                "mensaje": f"No existe un cliente con el RUT {rut}."
            }, status=status.HTTP_404_NOT_FOUND)
        confirmar = request.data.get("confirmar", False)

        if not confirmar:
            return Response({
                "ok": False,
                "mensaje": "Acción peligrosa: debes enviar { \"confirmar\": true } "
                           "en el body para confirmar la eliminación permanente."
            }, status=status.HTTP_400_BAD_REQUEST)
        nombre_cliente = str(cliente)
        cliente.delete()

        return Response({
            "ok": True,
            "mensaje": f"Cliente '{nombre_cliente}' eliminado permanentemente de la base de datos."
        }, status=status.HTTP_200_OK)
