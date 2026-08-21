from django.contrib import admin

from .models import Collection, Product, ProductImage, ProductIntent


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductIntentInline(admin.TabularInline):
    model = ProductIntent
    extra = 1


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "display_order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "collection", "price", "stock", "is_active")
    list_filter = ("collection", "is_active", "is_limited_edition")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline, ProductIntentInline]
