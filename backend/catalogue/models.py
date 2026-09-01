"""Catalogo de productos KVMI.

Los productos salen del catalogo desactivandose (is_active=False), nunca
mediante eliminacion fisica: las ordenes historicas los referencian con
PROTECT desde commerce. La referencia a Builder.io (DXP) se guarda como
identificador simple; la integracion vive en la capa de servicios.
"""
import uuid

from django.db import models


class Product(models.Model):
    class CollectionType(models.TextChoices):
        BARS = "bars"
        ROMANTIC = "romantic"
        CORPORATE = "corporate"
        PREMIUM = "premium"
        LIMITED = "limited"
        HANDICRAFTS = "exclusive_handicrafts"

    class FlavorProfile(models.TextChoices):
        CHILI = "chili"
        COFFEE = "coffee"
        DARK = "dark"
        SALT = "salt"
        NONE = "none"

    product_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=255)
    collection_type = models.CharField(
        max_length=30, choices=CollectionType.choices, db_index=True
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cocoa_percentage = models.IntegerField(null=True, blank=True)
    flavor_profile = models.CharField(
        max_length=10, choices=FlavorProfile.choices, default=FlavorProfile.NONE
    )
    customization_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Variantes y configuraciones dinamicas del producto",
    )
    builder_content_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
        help_text="Referencia al contenido asociado en Builder.io DXP",
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
