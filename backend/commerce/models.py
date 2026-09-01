"""Motor de comercio propio: cupones, carrito, checkout y pagos.

Flujo: Coupon -> Cart -> Order; Customer -> Cart -> Checkout -> Order ->
Payment -> Gateway -> Webhook -> Payment.payment_status.

Payment es agnostico a la pasarela: el proveedor aun no esta definido y la
comunicacion con el se implementara en servicios/adaptadores, no aqui.
La creacion de Order, OrderItem y Payment debe ejecutarse dentro de
transaction.atomic() en la capa de servicios del checkout.

Las referencias entre apps usan strings ('users.Customer',
'catalogue.Product') para evitar imports circulares.
"""
import uuid

from django.db import models


class Coupon(models.Model):
    coupon_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    code = models.CharField(max_length=50, unique=True, db_index=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
    valid_until = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.code


class Cart(models.Model):
    class GiftType(models.TextChoices):
        ROMANTIC = "romantic"
        CORPORATE = "corporate"
        PREMIUM = "premium"
        LIMITED = "limited"
        NONE = "none"

    cart_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    customer = models.ForeignKey(
        "users.Customer",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="carts",
    )
    gift_type = models.CharField(
        max_length=20, choices=GiftType.choices, default=GiftType.NONE
    )
    coupon = models.ForeignKey(
        Coupon,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="carts",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart {self.cart_id}"


class CartItem(models.Model):
    item_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    cart = models.ForeignKey(
        Cart, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        "catalogue.Product",
        on_delete=models.PROTECT,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField(default=1)
    customization_notes = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.quantity} x {self.product_id} en {self.cart_id}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending"
        PAID = "paid"
        PROCESSING = "processing"
        DELIVERED = "delivered"
        CANCELLED = "cancelled"

    order_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    customer = models.ForeignKey(
        "users.Customer",
        on_delete=models.PROTECT,
        related_name="orders",
    )
    # PROTECT: las ordenes historicas conservan el cupon utilizado; un cupon
    # referenciado por ordenes no puede eliminarse.
    coupon = models.ForeignKey(
        Coupon,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    total_value = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    includes_ar_experience = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.order_id} ({self.status})"


class OrderItem(models.Model):
    item_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        "catalogue.Product",
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product_id} en {self.order_id}"


class Payment(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = "pending"
        SUCCEEDED = "succeeded"
        FAILED = "failed"
        REFUNDED = "refunded"

    payment_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    order = models.OneToOneField(
        Order, on_delete=models.CASCADE, related_name="payment"
    )
    gateway_provider = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Proveedor de pago utilizado. La pasarela todavia no esta definida.",
    )
    # Sin unique=True: distintos proveedores podrian reutilizar referencias.
    transaction_reference = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
        help_text="Identificador de transaccion devuelto por la pasarela.",
    )
    payment_status = models.CharField(
        max_length=10,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True,
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    gateway_response_payload = models.JSONField(
        default=dict,
        blank=True,
        help_text="Payload recibido de la pasarela mediante webhook.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.payment_id} ({self.payment_status})"
