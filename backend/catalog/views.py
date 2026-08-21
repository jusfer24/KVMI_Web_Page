from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from .models import Product


def _serialize_product(product):
    return {
        "slug": product.slug,
        "name": product.name,
        "collection": product.collection.name,
        "collection_slug": product.collection.slug,
        "tagline": product.tagline,
        "description": product.description,
        "narrative": product.narrative,
        "price": str(product.price),
        "currency": product.currency,
        "origin": product.origin,
        "cacao_percent": product.cacao_percent,
        "is_limited_edition": product.is_limited_edition,
        "stock": product.stock,
        "allows_engraving": product.allows_engraving,
        "images": [
            {"path": img.path, "alt": img.alt_text}
            for img in product.images.all()
        ],
    }


def product_list(request):
    products = (
        Product.objects.filter(is_active=True)
        .select_related("collection")
        .prefetch_related("images")
    )
    collection = request.GET.get("collection")
    if collection:
        products = products.filter(collection__slug=collection)
    return JsonResponse({"products": [_serialize_product(p) for p in products]})


def product_detail(request, slug):
    product = get_object_or_404(
        Product.objects.select_related("collection").prefetch_related("images"),
        slug=slug,
        is_active=True,
    )
    return JsonResponse(_serialize_product(product))
