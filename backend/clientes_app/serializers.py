from rest_framework import serializers
from .models import Region, Provincia, Ciudad, CategoriaCliente, Cliente


class RegionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Region
        fields = ["id_region", "nombre_region"]


class ProvinciaSerializer(serializers.ModelSerializer):
    nombre_region = serializers.CharField(
        source="id_region.nombre_region", 
        read_only=True
    )

    class Meta:
        model = Provincia
        fields = ["id_provincia", "nombre_provincia", "id_region", "nombre_region"]


class CiudadSerializer(serializers.ModelSerializer):
    nombre_provincia = serializers.CharField(
        source="id_provincia.nombre_provincia",
        read_only=True
    )

    class Meta:
        model = Ciudad
        fields = ["id_ciudad", "nombre_ciudad", "id_provincia", "nombre_provincia"]


class CategoriaClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaCliente
        fields = ["id_categoria", "nombre_categoria"]

class ClienteListSerializer(serializers.ModelSerializer):

    ciudad = serializers.CharField(
        source="id_ciudad.nombre_ciudad",
        read_only=True
    )
    categoria = serializers.CharField(
        source="id_categoria.nombre_categoria",
        read_only=True
    )

    class Meta:
        model = Cliente
        fields = [
            "rut",
            "nombre",
            "apellido",
            "telefono",
            "correo",
            "direccion",
            "fecha_registro",
            "activo",
            "id_ciudad",
            "ciudad",      
            "id_categoria",
            "categoria",     
        ]

class ClienteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            "rut",
            "nombre",
            "apellido",
            "telefono",
            "correo",
            "direccion",
            "id_ciudad",
            "id_categoria",
        ]

    def validate_rut(self, value):
        if len(value) < 3:
            raise serializers.ValidationError(
                "El RUT ingresado es demasiado corto."
            )
        return value.strip()

    def validate_telefono(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El teléfono no puede estar vacío."
            )
        if len(value) > 15:
            raise serializers.ValidationError(
                "El teléfono no puede tener más de 15 caracteres."
            )
        return value.strip()

class ClienteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            "nombre",
            "apellido",
            "telefono",
            "correo",
            "direccion",
            "id_ciudad",
            "id_categoria",
            "activo",
        ]

    def validate_telefono(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "El teléfono no puede estar vacío."
            )
        if len(value) > 15:
            raise serializers.ValidationError(
                "El teléfono no puede tener más de 15 caracteres."
            )
        return value.strip()
