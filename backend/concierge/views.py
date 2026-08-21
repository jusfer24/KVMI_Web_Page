import json
import logging
import os
from typing import Optional, TypedDict

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from google import genai
from google.genai import types

"""
KVMI AI Concierge - capa de servicio.

Orquesta Gemini (modelo flash) con un catalogo cerrado de 3 piezas demostrativas
como unico contexto de recomendacion. El contrato JSON de salida es fijo
para no romper el frontend (ver Concierge.tsx). Ver docs/ARCHITECTURE.md.
"""

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-3.6-flash"

CATALOG = [
    {
        "id": "kvmi-dark",
        "category": "Chocolate Bar",
        "name": "KVMI Dark",
        "description": (
            "Barra de chocolate 70% cacao amazonico, sabor puro e intenso. "
            "USD 12."
        ),
    },
    {
        "id": "kvmi-treasures",
        "category": "Premium Gift",
        "name": "KVMI Treasures",
        "description": (
            "Cofre de degustacion con 4 barras exclusivas, guia de cata y "
            "certificado de autenticidad. USD 30."
        ),
    },
    {
        "id": "kvmi-legend",
        "category": "Limited Edition",
        "name": "KVMI Legend",
        "description": (
            "Caja de madera serializada con barras, tabletas de maridaje e "
            "instrumentos de cata completos. Precio bajo consulta."
        ),
    },
]

VALID_PRODUCT_IDS = {item["id"] for item in CATALOG}

SYSTEM_PROMPT = f"""Eres el AI Concierge de KVMI, una casa de chocolate de lujo.
Tu tono es sofisticado, calido y preciso: respuestas breves, sin divagar y
sin emojis.

Solo puedes recomendar piezas del siguiente catalogo cerrado. Nunca inventes
productos ni menciones nada fuera de esta lista:

{json.dumps(CATALOG, ensure_ascii=False, indent=2)}

Reglas:
- Si una pieza del catalogo encaja con la consulta del huesped, recomiendala
  usando su "id" exacto como recommended_product_id.
- Si ninguna encaja con claridad, responde con recommended_product_id en null
  y una pregunta breve para orientar al huesped.
- action_label debe ser un texto corto para un boton (ej. "Ver pieza").
- Responde siempre en el idioma de la consulta del huesped.
"""

FALLBACK_MESSAGE = (
    "Estoy aqui para guiarle hacia la pieza exacta. Puede contarme la "
    "ocasion: un regalo romantico, un gesto corporativo, una pieza de "
    "coleccion, o si desea recibir su seleccion en su hotel."
)


class ConciergeResponse(TypedDict):
    message: str
    recommended_product_id: Optional[str]
    action_label: str


_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY no esta configurada.")
        _client = genai.Client(api_key=api_key)
    return _client


@csrf_exempt
@require_POST
def recommend(request):
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON invalido."}, status=400)

    query = (payload.get("query") or "").strip()
    if not query:
        return JsonResponse({"error": "Consulta vacia."}, status=400)

    try:
        client = _get_client()
        result = client.models.generate_content(
            model=MODEL_NAME,
            contents=query,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=ConciergeResponse,
            ),
        )
        data = json.loads(result.text)
        recommended_id = data.get("recommended_product_id")
        if recommended_id not in VALID_PRODUCT_IDS:
            recommended_id = None
        return JsonResponse(
            {
                "message": data.get("message") or FALLBACK_MESSAGE,
                "recommended_product_id": recommended_id,
                "action_label": data.get("action_label") or "Ver pieza",
            }
        )
    except Exception:
        logger.exception("Fallo la solicitud al AI Concierge (Gemini).")
        return JsonResponse(
            {
                "message": FALLBACK_MESSAGE,
                "recommended_product_id": None,
                "action_label": "Ver pieza",
            }
        )
