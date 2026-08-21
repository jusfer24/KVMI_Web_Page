from django.db import models


class Collection(models.Model):
    slug = models.SlugField(max_length=80, unique=True)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    collection = models.ForeignKey(
        Collection, on_delete=models.PROTECT, related_name="products"
    )
    slug = models.SlugField(max_length=120, unique=True)
    name = models.CharField(max_length=160)
    tagline = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    narrative = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    origin = models.CharField(max_length=160, blank=True)
    cacao_percent = models.CharField(max_length=80, blank=True)
    is_limited_edition = models.BooleanField(default=False)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    allows_engraving = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    # Ruta relativa dentro de src/assets/images/ del frontend.
    path = models.CharField(max_length=255)
    alt_text = models.CharField(max_length=200, blank=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["display_order"]

    def __str__(self):
        return f"{self.product.name} - {self.path}"


class ProductIntent(models.Model):
    """Palabras clave de intencion que alimentan al AI Concierge."""

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="intents"
    )
    keyword = models.CharField(max_length=60)

    class Meta:
        unique_together = [("product", "keyword")]

    def __str__(self):
        return f"{self.product.slug}:{self.keyword}"
