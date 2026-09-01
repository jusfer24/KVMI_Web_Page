from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Listado y detalle de catalogo. Solo lectura: la gestion del catalogo
    se realiza desde el admin/servicios internos, no desde esta API publica.
    """

    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = "product_id"
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["collection_type", "flavor_profile"]
