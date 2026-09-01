"""Logistica de Hotel Delivery y buffer local de sincronizacion con el CRM.

CrmLocalRecord es la representacion local de los datos que se sincronizan
con el CRM externo (actualmente HubSpot). Solo almacena identificadores y
datos; la sincronizacion se implementa en servicios independientes.
"""
import uuid

from django.db import models


class HotelDelivery(models.Model):
    class DeliveryType(models.TextChoices):
        RECEPTION = "hotel_reception"
        ROOM = "hotel_room"

    class DeliveryStatus(models.TextChoices):
        RESERVADO = "reservado"
        EN_PREPARACION = "en_preparacion"
        ENTREGADO = "entregado"
        CONFIRMADO = "confirmado"

    delivery_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    order = models.OneToOneField(
        "commerce.Order",
        on_delete=models.CASCADE,
        related_name="hotel_delivery",
    )
    city = models.CharField(max_length=100, default="Quito")
    hotel_name = models.CharField(max_length=255, db_index=True)
    guest_name = models.CharField(max_length=255)
    room = models.CharField(max_length=50, blank=True, null=True)
    arrival_date = models.DateField()
    departure_date = models.DateField()
    delivery_type = models.CharField(
        max_length=20,
        choices=DeliveryType.choices,
        default=DeliveryType.RECEPTION,
    )
    delivery_status = models.CharField(
        max_length=15,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.RESERVADO,
        db_index=True,
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Hotel deliveries"

    def __str__(self):
        return f"{self.guest_name} -> {self.hotel_name}, {self.city}"


class CrmLocalRecord(models.Model):
    class Segment(models.TextChoices):
        COLD = "cold"
        WARM = "warm"
        HOT_LEAD = "hot_lead"

    crm_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    customer = models.OneToOneField(
        "users.Customer",
        on_delete=models.CASCADE,
        related_name="crm_record",
    )
    hubspot_contact_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
    )
    lead_score = models.IntegerField(default=0)
    segment = models.CharField(
        max_length=10, choices=Segment.choices, default=Segment.COLD
    )
    preferences_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Preferencias sensoriales detectadas por AI Concierge",
    )
    last_synced_hubspot = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"CRM {self.customer_id} ({self.segment})"
