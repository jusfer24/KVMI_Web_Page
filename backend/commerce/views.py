"""Endpoints del motor de comercio propio: carrito, cupones y checkout.

La validacion de cupones y el calculo de totales en el checkout son logica
de aplicacion (capa de vistas), no logica de dominio dentro de models.py.
La comunicacion con la pasarela de pago no ocurre aqui: el checkout solo
deja el Payment en estado PENDING, listo para que la capa de
servicios/adaptadores lo procese contra el proveedor que se defina despues.
"""
from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from catalogue.models import Product

from .models import Cart, CartItem, Coupon, Order, OrderItem, Payment
from .serializers import CartSerializer, OrderSerializer


class CartViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Cart.objects.prefetch_related("items__product").select_related(
        "customer", "coupon"
    )
    serializer_class = CartSerializer
    lookup_field = "cart_id"

    @action(detail=True, methods=["post", "patch", "delete"], url_path="items")
    def items(self, request, cart_id=None):
        cart = self.get_object()

        if request.method == "POST":
            product = get_object_or_404(
                Product, product_id=request.data.get("product_id"), is_active=True
            )
            quantity = int(request.data.get("quantity", 1))
            item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={
                    "quantity": quantity,
                    "customization_notes": request.data.get("customization_notes", {}),
                },
            )
            if not created:
                item.quantity += quantity
                item.save(update_fields=["quantity"])

        elif request.method == "PATCH":
            item = get_object_or_404(CartItem, cart=cart, item_id=request.data.get("item_id"))
            quantity = int(request.data.get("quantity", item.quantity))
            if quantity <= 0:
                item.delete()
            else:
                item.quantity = quantity
                item.save(update_fields=["quantity"])

        elif request.method == "DELETE":
            item = get_object_or_404(CartItem, cart=cart, item_id=request.data.get("item_id"))
            item.delete()

        cart.save(update_fields=["updated_at"])
        # El queryset del viewset ya trae "items" via prefetch_related, cacheado
        # en el momento de get_object(); sin refrescar, la respuesta serializaria
        # el estado previo a esta mutacion.
        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="apply-coupon")
    def apply_coupon(self, request, cart_id=None):
        cart = self.get_object()
        code = (request.data.get("code") or "").strip()
        coupon = Coupon.objects.filter(code__iexact=code).first()

        if not coupon:
            return Response({"detail": "Cupon no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        if not coupon.is_active:
            return Response({"detail": "Cupon inactivo."}, status=status.HTTP_400_BAD_REQUEST)
        if coupon.valid_until and coupon.valid_until < timezone.now():
            return Response({"detail": "Cupon expirado."}, status=status.HTTP_400_BAD_REQUEST)

        cart.coupon = coupon
        cart.save(update_fields=["coupon", "updated_at"])
        return Response(CartSerializer(cart).data)

    @action(detail=True, methods=["post"], url_path="checkout")
    def checkout(self, request, cart_id=None):
        cart = self.get_object()

        if not cart.customer_id:
            return Response(
                {"detail": "El carrito requiere un cliente asociado antes del checkout."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items = list(cart.items.select_related("product"))
        if not items:
            return Response({"detail": "El carrito esta vacio."}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = sum((i.product.price * i.quantity for i in items), start=Decimal("0.00"))
        discount = Decimal("0.00")
        coupon = cart.coupon
        if coupon and coupon.is_active and not (coupon.valid_until and coupon.valid_until < timezone.now()):
            discount = (subtotal * coupon.discount_percentage / Decimal("100")).quantize(Decimal("0.01"))
        else:
            coupon = None
        total = subtotal - discount

        with transaction.atomic():
            order = Order.objects.create(
                customer=cart.customer,
                coupon=coupon,
                total_value=total,
                currency=request.data.get("currency", "USD"),
                includes_ar_experience=bool(request.data.get("includes_ar_experience", False)),
            )
            OrderItem.objects.bulk_create(
                OrderItem(order=order, product=i.product, quantity=i.quantity, unit_price=i.product.price)
                for i in items
            )
            Payment.objects.create(order=order, amount=total)
            cart.items.all().delete()
            cart.coupon = None
            cart.save(update_fields=["coupon", "updated_at"])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Order.objects.prefetch_related("items__product").select_related(
        "customer", "coupon", "payment"
    )
    serializer_class = OrderSerializer
    lookup_field = "order_id"
