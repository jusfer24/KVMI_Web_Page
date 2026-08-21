#!/usr/bin/env python
"""Utilidad de linea de comandos de Django para el backend KVMI."""
import os
import sys


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kvmi_backend.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "No se pudo importar Django. Verifique que el entorno virtual "
            "este activo y que las dependencias de requirements.txt esten "
            "instaladas."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
