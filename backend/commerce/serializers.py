from decimal import Decimal

from rest_framework import serializers

from catalogue.serializers import ProductSerializer

from .models import Cart, CartItem, Coupon, Order, OrderItem, Payment


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ["coupon_id", "code", "discount_percentage", "is_active", "valid_until"]
        read_only_fields = fields


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["item_id", "product", "quantity", "customization_notes", "line_total"]
        read_only_fields = ["item_id", "product", "line_total"]

    def get_line_total(self, obj):
        return obj.product.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    coupon = CouponSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()
    discount_total = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "cart_id",
            "customer",
            "gift_type",
            "coupon",
            "items",
            "subtotal",
            "discount_total",
            "total",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["cart_id", "coupon", "items", "created_at", "updated_at"]

    def get_subtotal(self, obj):
        return sum(
            (item.product.price * item.quantity for item in obj.items.all()),
            start=Decimal("0.00"),
        )

    def get_discount_total(self, obj):
        subtotal = self.get_subtotal(obj)
        coupon = obj.coupon
        if coupon and coupon.is_active:
            return (subtotal * coupon.discount_percentage / Decimal("100")).quantize(Decimal("0.01"))
        return Decimal("0.00")

    def get_total(self, obj):
        return self.get_subtotal(obj) - self.get_discount_total(obj)


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ["item_id", "product", "quantity", "unit_price"]
        read_only_fields = fields


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "payment_id",
            "gateway_provider",
            "transaction_reference",
            "payment_status",
            "amount",
            "created_at",
        ]
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    coupon = CouponSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            "order_id",
            "customer",
            "coupon",
            "total_value",
            "currency",
            "status",
            "includes_ar_experience",
            "items",
            "payment",
            "created_at",
        ]
        read_only_fields = fields
