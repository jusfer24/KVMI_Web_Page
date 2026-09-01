from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("catalog.urls")),
    path("api/", include("orders.urls")),
    path("api/", include("concierge.urls")),
    # Dominio de comercio propio (users/catalogue/commerce/logistics),
    # montado bajo un prefijo distinto para coexistir con las apps legacy.
    path("api/v2/catalogue/", include("catalogue.urls")),
    path("api/v2/commerce/", include("commerce.urls")),
    path("api/v2/logistics/", include("logistics.urls")),
]
