from django.contrib import admin

from .models import HotelDelivery, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class HotelDeliveryInline(admin.StackedInline):
    model = HotelDelivery
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("reference", "status", "total", "currency", "created_at")
    list_filter = ("status",)
    search_fields = ("reference", "email", "hotel_delivery__guest_name")
    inlines = [OrderItemInline, HotelDeliveryInline]
