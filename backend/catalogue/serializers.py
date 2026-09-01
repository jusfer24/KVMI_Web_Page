from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "product_id",
            "name",
            "collection_type",
            "price",
            "cocoa_percentage",
            "flavor_profile",
            "customization_data",
            "builder_content_id",
            "is_active",
        ]
        read_only_fields = ["product_id"]
