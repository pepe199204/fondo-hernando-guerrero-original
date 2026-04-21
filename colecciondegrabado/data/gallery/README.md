# JSON de galería (en español)

Estos archivos están pensados para alimentar componentes reutilizables en React.

## Archivos

- `obras.json`: catálogo principal (1 registro por obra).
- `autores.json`: autores y número de obras.
- `tematicas.json`: temáticas y número de obras.
- `tecnicas.json`: técnicas y número de obras.
- `estadisticas.json`: resumen de cobertura de extracción.

## ¿Qué corresponde a “amp” y qué a “herm”?

En el proyecto legacy, para cada obra suelen existir 2 páginas:

- **`amp_YY-NNNN.html` (AMP)**: ficha “principal” con imagen y metadatos (título, autor, técnica, año, temática, dimensiones, edición) + enlaces.
- **`herm_YY-NNNN.html` (HERM)**: ficha de **análisis hermenéutico** (texto descriptivo/curatorial) y enlace de regreso a `amp_...`.

En el JSON:

- La información “tipo AMP” queda en: `archivoAmp`, `imagenBaja`, `imagenAlta`, `dimensiones`, `edicion`, `tematica` (y también `titulo`, `autor`, `tecnica`, `ano`).
- La información “tipo HERM” queda en: `archivoHerm` y `textoHermeneutico`.

## Campos clave de `obras.json`

- `id`: código interno (`YY-NNNN`).
- `archivoAmp`: nombre del HTML `amp_*.html` asociado.
- `archivoHerm`: nombre del HTML `herm_*.html` asociado.
- `autor`: autor de la obra.
- `titulo`: título (si no existe, se normaliza como `Sin título`).
- `tecnica`: técnica declarada en catálogo.
- `ano`: año de ingreso.
- `tematica`: temática principal.
- `dimensiones`: medidas extraídas de `amp_*.html`.
- `edicion`: edición (si existe).
- `imagenBaja` / `imagenAlta`: rutas originales de imagen.
- `textoHermeneutico`: texto hermenéutico limpio (desde `herm_*.html`).

## Regenerar

Ejecuta:

`python scripts/generate_gallery_json.py`

Origen de datos:

- `galeria/js/indice.js`
- `galeria/amp_*.html`
- `galeria/herm_*.html`
