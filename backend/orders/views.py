import json
from decimal import Decimal

from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from catalog.models import Product

from .models import HotelDelivery, Order, OrderItem

REQUIRED_DELIVERY_FIELDS = [
    "guest_name",
    "hotel",
    "city",
    "arrival_date",
    "departure_date",
    "phone",
]


@csrf_exempt
@require_POST
def create_order(request):
    """Crea una orden con sus items y datos de Hotel Delivery.

    Payload esperado:
    {
      "email": "opcional@correo.com",
      "items": [
        {"slug": "...", "quantity": 1,
         "engraving_message": "", "wrap": "", "ribbon": ""}
      ],
      "hotel_delivery": {
        "guest_name": "...", "hotel": "...", "city": "...",
        "arrival_date": "YYYY-MM-DD", "departure_date": "YYYY-MM-DD",
        "phone": "...", "instructions": ""
      }
    }
    """
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON invalido."}, status=400)

    items_data = payload.get("items") or []
    delivery_data = payload.get("hotel_delivery") or {}

    if not items_data:
        return JsonResponse({"error": "La orden no contiene items."}, status=400)

    missing = [f for f in REQUIRED_DELIVERY_FIELDS if not delivery_data.get(f)]
    if missing:
        return JsonResponse(
            {"error": "Campos de entrega faltantes.", "fields": missing},
            status=400,
        )

    slugs = [item.get("slug") for item in items_data]
    products = {p.slug: p for p in Product.objects.filter(slug__in=slugs, is_active=True)}
    unknown = [s for s in slugs if s not in products]
    if unknown:
        return JsonResponse(
            {"error": "Productos no disponibles.", "slugs": unknown}, status=400
        )

    with transaction.atomic():
        subtotal = Decimal("0.00")
        order = Order.objects.create(
            email=payload.get("email", ""),
            subtotal=Decimal("0.00"),
            total=Decimal("0.00"),
        )
        for item in items_data:
            product = products[item["slug"]]
            quantity = max(1, int(item.get("quantity", 1)))
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                unit_price=product.price,
                quantity=quantity,
                engraving_message=item.get("engraving_message", "")[:60],
                wrap=item.get("wrap", ""),
                ribbon=item.get("ribbon", ""),
            )
            subtotal += product.price * quantity

        # MVP: sin impuestos ni costo de envio (hotel delivery incluido).
        order.subtotal = subtotal
        order.total = subtotal
        order.save(update_fields=["subtotal", "total"])

        HotelDelivery.objects.create(
            order=order,
            guest_name=delivery_data["guest_name"],
            hotel=delivery_data["hotel"],
            city=delivery_data["city"],
            arrival_date=delivery_data["arrival_date"],
            departure_date=delivery_data["departure_date"],
            phone=delivery_data["phone"],
            instructions=delivery_data.get("instructions", ""),
        )

    return JsonResponse(
        {
            "reference": order.reference,
            "status": order.status,
            "total": str(order.total),
            "currency": order.currency,
        },
        status=201,
    )
