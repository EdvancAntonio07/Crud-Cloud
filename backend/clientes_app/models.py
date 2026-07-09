from django.db import models


# ─────────────────────────────────────────────
# TABLA: regiones
# ─────────────────────────────────────────────
class Region(models.Model):
    id_region = models.AutoField(primary_key=True)
    nombre_region = models.CharField(max_length=50)

    class Meta:
        db_table = "regiones"
        managed = False
        verbose_name = "Región"
        verbose_name_plural = "Regiones"

    def __str__(self):
        """Representación legible del objeto (útil en el admin y debugging)"""
        return self.nombre_region


# ─────────────────────────────────────────────
# TABLA: provincias
# ─────────────────────────────────────────────
class Provincia(models.Model):
    id_provincia = models.AutoField(primary_key=True)
    nombre_provincia = models.CharField(max_length=50)
    id_region = models.ForeignKey(
        Region,
        on_delete=models.DO_NOTHING,
        db_column="id_region", 
        related_name="provincias" 
    )

    class Meta:
        db_table = "provincias"
        managed = False
        verbose_name = "Provincia"
        verbose_name_plural = "Provincias"

    def __str__(self):
        return self.nombre_provincia


# ─────────────────────────────────────────────
# TABLA: ciudades
# ─────────────────────────────────────────────
class Ciudad(models.Model):
    id_ciudad = models.AutoField(primary_key=True)
    nombre_ciudad = models.CharField(max_length=50)
    id_provincia = models.ForeignKey(
        Provincia,
        on_delete=models.DO_NOTHING,
        db_column="id_provincia",
        related_name="ciudades"
    )

    class Meta:
        db_table = "ciudades"
        managed = False
        verbose_name = "Ciudad"
        verbose_name_plural = "Ciudades"

    def __str__(self):
        return self.nombre_ciudad


# ─────────────────────────────────────────────
# TABLA: categorias_cliente
# ─────────────────────────────────────────────
class CategoriaCliente(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(max_length=50)

    class Meta:
        db_table = "categorias_cliente"
        managed = False
        verbose_name = "Categoría de Cliente"
        verbose_name_plural = "Categorías de Cliente"

    def __str__(self):
        return self.nombre_categoria

class Cliente(models.Model):
    """
    Tabla principal del CRUD.
    Representa un cliente registrado en el sistema.

    Campos:
        rut          → Llave primaria (ej: "12345678-9")
        nombre       → Nombre del cliente
        apellido     → Apellido del cliente
        telefono     → Teléfono de contacto
        correo       → Email (opcional)
        direccion    → Dirección (opcional)
        fecha_registro → Se guarda automáticamente al crear
        activo       → True=activo, False=eliminado lógicamente
        id_ciudad    → FK a ciudades
        id_categoria → FK a categorias_cliente
    """
    rut = models.CharField(max_length=12, primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15)
    correo = models.CharField(max_length=100, null=True, blank=True)
    direccion = models.CharField(max_length=150, null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    id_ciudad = models.ForeignKey(
        Ciudad,
        on_delete=models.DO_NOTHING,
        db_column="id_ciudad",
        related_name="clientes"
    )

    id_categoria = models.ForeignKey(
        CategoriaCliente,
        on_delete=models.DO_NOTHING,
        db_column="id_categoria",
        related_name="clientes"
    )

    class Meta:
        db_table = "clientes"
        managed = False
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.rut})"
