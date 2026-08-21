from django.urls import path

from . import views

urlpatterns = [
    path("concierge/", views.recommend, name="concierge-recommend"),
]
