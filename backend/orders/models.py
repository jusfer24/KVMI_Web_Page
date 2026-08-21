import secrets

from django.db import models

from catalog.models import Product


def generate_reference():
    return "KVMI-" + secrets.token_hex(4).upper()


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pendiente de pago"
        PAID = "PAID", "Pagada"
        SCHEDULED = "SCHEDULED", "Entrega programada"
        DELIVERED = "DELIVERED", "Entregada"
        CANCELLED = "CANCELLED", "Cancelada"

    reference = models.CharField(
        max_length=20, unique=True, default=generate_reference
    )
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING
    )
    email = models.EmailField(blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.reference


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="order_items"
    )
    # Snapshot del producto al momento de la compra: el historial transaccional
    # no debe mutar si el catalogo cambia despues.
    product_name = models.CharField(max_length=160)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    engraving_message = models.CharField(max_length=60, blank=True)
    wrap = models.CharField(max_length=80, blank=True)
    ribbon = models.CharField(max_length=80, blank=True)

    def __str__(self):
        return f"{self.order.reference} - {self.product_name}"


class HotelDelivery(models.Model):
    """Datos del servicio Deliver To My Hotel asociados a una orden."""

    order = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name="hotel_delivery"
    )
    guest_name = models.CharField(max_length=160)
    hotel = models.CharField(max_length=160)
    city = models.CharField(max_length=80)
    arrival_date = models.DateField()
    departure_date = models.DateField()
    phone = models.CharField(max_length=30)
    instructions = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Hotel deliveries"

    def __str__(self):
        return f"{self.order.reference} -> {self.hotel}, {self.city}"
