from rest_framework import serializers

from .models import HotelDelivery


class HotelDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelDelivery
        fields = [
            "delivery_id",
            "order",
            "city",
            "hotel_name",
            "guest_name",
            "room",
            "arrival_date",
            "departure_date",
            "delivery_type",
            "delivery_status",
            "updated_at",
        ]
        read_only_fields = ["delivery_id", "updated_at"]

    def validate_order(self, order):
        if order.status not in {order.Status.PAID, order.Status.PROCESSING}:
            raise serializers.ValidationError(
                "La orden debe estar pagada antes de registrar la entrega en el hotel."
            )
        return order
