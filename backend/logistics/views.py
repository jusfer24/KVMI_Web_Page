"""Registro y seguimiento de entregas Hotel Delivery.

El checkout (commerce) crea la Order; aqui se registra unicamente el dato
logistico asociado a una orden ya existente. No se elimina la entrega vía
API: su ciclo de vida se controla actualizando delivery_status.
"""
from rest_framework import mixins, viewsets

from .models import HotelDelivery
from .serializers import HotelDeliverySerializer


class HotelDeliveryViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = HotelDelivery.objects.select_related("order")
    serializer_class = HotelDeliverySerializer
    lookup_field = "delivery_id"
