from rest_framework.routers import DefaultRouter

from .views import HotelDeliveryViewSet

router = DefaultRouter()
router.register("hotel-deliveries", HotelDeliveryViewSet, basename="hotel-delivery")

urlpatterns = router.urls
