"""Dominio de clientes del e-commerce KVMI.

Fuente local de verdad para la identidad del cliente. El identificador del
CDP (actualmente Segment) se almacena como dato simple; la integracion se
implementa en la capa de servicios, nunca aqui.
"""
import uuid

from django.db import models


class Customer(models.Model):
    customer_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=30, blank=True)
    country = models.CharField(max_length=100, blank=True)
    cdp_anonymous_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="ID anonimo utilizado por el CDP; actualmente capturado mediante Segment",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} <{self.email}>"
