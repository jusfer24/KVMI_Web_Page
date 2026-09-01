# Guia de Desarrollo y Configuracion del Proyecto

Este documento define la arquitectura, las herramientas, las reglas de entorno y las directrices de diseno para el desarrollo del proyecto. Actua como el contexto principal para la toma de decisiones tecnicas.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

**Frontend Ecosystem**
- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

**Backend & Data Ecosystem**
- [Django Stable Documentation](https://docs.djangoproject.com/en/stable/)
- [Django Database Models & Relations](https://docs.djangoproject.com/en/stable/topics/db/models/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB PyMongo Documentation](https://pymongo.readthedocs.io/en/stable/)
- [MongoDB integration patterns with Django](https://www.mongodb.com/developer/languages/python/django/)

## Stack Tecnologico y Arquitectura Evolutiva

### Fase 1
*   **Frontend:** Astro (v5.x) para enrutamiento y SSR, React (v18.x / v19.x) para componentes interactivos, Tailwind CSS (v3.4+) para estilos.
*   **Backend:** Django (v5.x) con Python (v3.12+).
*   **Base de Datos:** **Exclusivamente PostgreSQL** Durante el MVP, toda la informacion de usuarios, autenticacion y el flujo transaccional del Checkout operaran sobre esquemas relacionales para garantizar integridad inmediata.

### Fase 2
*   **Integracion de MongoDB:** Se anadira MongoDB a la infraestructura de Django utilizando `DATABASE_ROUTERS`.
*   **Distribucion de Carga:** PostgreSQL protegera los datos transaccionales. MongoDB se encargara del catalogo masivo de productos y servira como infraestructura de alta velocidad. 
<!-- para el streaming de coordenadas, scripts en C# y modelos tridimensionales hacia las experiencias inmersivas desarrolladas en Unity. -->

## Development 

### Frontend (Astro + React)
When starting the dev server, use background mode:

```bash
astro dev --background
```
Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

### Backend (Django)
Para iniciar el servidor local con SQL Server:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

## Reglas de Directorios y Multimedia

Al hacer uso de algun recurso multimedia, es obligatorio priorizar los siguientes directorios para mantener el orden del repositorio:

```text
src/
└── assets/
    ├── images/
    ├── icons/
public/
├── videos/
├── documents/
└── downloads/
```

## Directrices de Diseno Corporativo

Toda la interfaz desarrollada en Tailwind y los recursos visuales deben alinearse estrictamente a las especificaciones del manual corporativo:

### 1. Reduccion Minima
*   La marca nunca debe ser utilizada con una reduccion inferior a **1 cm de ancho x 1.17 cm de alto** en ningun soporte digital o impreso.

### 2. Cromatica Corporativa
Los archivos de configuracion de Tailwind CSS deben incluir los siguientes valores HEX:
*   **Amarillos (Degradado/Textura):** `#B28A00`, `#F6D300`, `#CE8B00`.
*   **Colores de Acompanamiento (Oscuros):** `#580012`, `#2E0800`, `#020509`.
*   **Grises:** `#9B9B97`, `#C4C5BE`.

### 3. Usos de la Marca (Reglas Estrictas)
*   Priorizar la textura dorada en degradado sobre fondos de alto contraste.
*   PROHIBIDO cambiar el orden de lectura, girar el angulo del isotipo o logotipo, y distorsionar la marca de cualquier forma.
*   PROHIBIDO utilizar versiones de la marca sin contraste adecuado (ej. claro sobre claro).
*   PROHIBIDO alterar la tipografia original del logotipo.

### 4. Familias Tipograficas
*   **Twentieth Century MT:** Exclusiva para el logotipo.
*   **Quicksand:** Tipografia designada para los cuerpos de texto, parrafos informativos y lectura general en la plataforma web.

## Normativas de Desarrollo Adicionales
*   **Cero Emojis:** Queda estrictamente prohibido el uso de emojis en el codigo fuente, comentarios, documentacion, mensajes de commit y en cualquier parte visual de la interfaz de usuario.