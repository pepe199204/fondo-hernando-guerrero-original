# Inventario y diagnóstico del repositorio original

Inventario por archivo (baseline de 4.770 archivos): [`inventario_original_e361fdb.csv`](./inventario_original_e361fdb.csv).

---

## 1. Estructura general (árbol resumido)

Se omite el empaquetado portable `App/` (Firefox Portable que la aplicación usaba para abrirse localmente, ~600 archivos de binarios Windows) y todo lo que empieza con `.` (metadatos del sistema).

```
colecciondegrabado/
├── coleccion/          — 37 archivos (jpg + .htm de apoyo, estilo WordPress legacy "kubrick")
├── enlaces/            — 18 páginas HTML estáticas (1 por institución)
├── galeria/            — 3.603 archivos (núcleo del catálogo Flash)
│   ├── AA-NNNN.html        × 1200  (ficha de obra)
│   ├── amp_AA-NNNN.html    × 1200  (ampliación de imagen)
│   ├── herm_AA-NNNN.html   × 1200  (análisis hermenéutico)
│   ├── index.html
│   ├── prev_todas.html
│   ├── analisis/       — 7 PDFs (tematizaciones)
│   ├── images/         — 78 GIFs (sprites de la plantilla Dreamweaver: ficha_rX_cX.gif)
│   └── js/             — 2 .js (busquedas.js, indice.js)
├── imagenes/           — 3.673 JPG del acervo
│   ├── alta/           × 1226 (AA-NNNNhi.jpg)
│   ├── baja/           × 1224 (AA-NNNNlo.jpg)
│   └── previa/         × 1223 (AA-NNNNprev.jpg)
├── images/             — 314 GIF/JPG de chrome del sitio
│   ├── catalogos/      — 4 PDFs
│   ├── fotos/
│   └── varias/         — 9 .swf + 9 .html
├── loader/             — pantalla de carga Flash (17 imagen*.jpg + loader.swf)
├── media/              — 5 .flv de técnicas de grabado + 2 .swf
├── PDF/                — 8 catálogos/bienales con PDF + versión HTM + imagenes/
├── Scripts/AC_RunActiveContent.js   (helper para embeber Flash)
├── styles/             — 2 CSS de paginación
├── txt/                — 7 .txt de contenido editorial suelto
└── ~45 .swf en la raíz — módulos principales del sitio Flash
App/                    — Mozilla Firefox Portable embebido (entorno de ejecución)
index.exe, *.bat, autorun.inf — lanzador para CD/DVD Windows
```

---

## 2. Conteos por tipo (todo el repositorio)

| Tipo                | Cantidad | Comentario                                        |
|---------------------|---------:|---------------------------------------------------|
| `.jpg`              |   3.904  | Mayoría son obras (alta/baja/previa)              |
| `.html`             |   3.645  | 3.600 de ellos son **fichas, amp y herm**         |
| `.gif`              |     407  | Chrome/sprites de Dreamweaver + iconos Firefox    |
| `.js`               |      65  | 95% del Firefox Portable; solo 2 son propios      |
| `.swf` (**Flash**)  |      60  | Toda la navegación y contenidos principales       |
| `.dll` / `.nsh` / `.exe` | 64  | Binarios Firefox Portable (no son del sitio)      |
| `.css`              |      20  | 16 de Firefox; 4 del sitio                        |
| `.pdf`              |      20  | Catálogos y tematizaciones                        |
| `.htm`              |      14  | Versiones html de PDFs                            |
| `.flv`              |       5  | Videos de técnicas de grabado                     |
| `.json`             |       9  | **Ninguno propio**: solo manifest/metadata de Firefox |

### Contenido del sitio (sin contar Firefox Portable)

| Categoría                                         | Cantidad |
|---------------------------------------------------|---------:|
| Obras en el acervo (por ID único)                 | **1.200** |
| Fichas estáticas (`AA-NNNN.html`)                 | 1.200    |
| Ampliaciones estáticas (`amp_AA-NNNN.html`)       | 1.200    |
| Análisis hermenéuticos estáticos (`herm_AA-NNNN.html`) | 1.200 |
| Imágenes alta resolución (`*hi.jpg`)              | 1.226    |
| Imágenes media resolución (`*lo.jpg`)             | 1.224    |
| Imágenes previa (thumbnail `*prev.jpg`)           | 1.223    |
| Archivos Flash (`.swf`)                           |   **60** |
| Videos (`.flv`)                                   |     5    |
| PDFs (catálogos, bienales, tematizaciones)        |    20    |
| Páginas HTML de enlaces externos                  |    18    |
| GIF-sprites de plantilla (`ficha_rX_cX.gif`)      |    64    |

> Entre las tres resoluciones hay pequeñas inconsistencias (1226 alta vs 1224 baja vs 1223 previa). Se deja registrado, **no se va a completar lo faltante**.

---

## 3. Diagnóstico: qué es estático y qué se repite

### 3.1 Fichas (`AA-NNNN.html`) — 1.200 archivos, ~16.8 KB cada uno

- Al normalizar números e IDs, **1.006 de las 1.200 fichas (84%) tienen exactamente la misma estructura HTML**. Solo 31 variantes estructurales en total.
- El bloque `<head>` es **idéntico en tamaño (2.095 bytes)** en el 100% de la muestra → mismo `<title>`, mismos `<meta>`, mismas hojas de estilo, mismo `DOCTYPE` XHTML 1.0 Transitional.
- Todas las fichas cargan la misma plantilla Dreamweaver con 64 sprites `images/ficha_rX_cX.gif` (bordes y esquinas en tabla de layout).
- **Los títulos de sección no son texto**: se cargan como imágenes dentro de esos sprites (*"FICHA DE LA OBRA"*, *"FICHA TÉCNICA"*, *"ANÁLISIS DE OBRA"*, *"DATOS ADICIONALES DE LA OBRA"*, *"DATOS ADICIONALES DEL ARTISTA"* están pintados en GIF, no escritos en HTML). Esto rompe accesibilidad, búsqueda y tildes.
- La única información realmente variable por archivo: id, título, autor, año, técnica, dimensiones, ubicación, planoteca/carpeta, texto de análisis y ruta de imagen.

→ **Ahorro potencial**: 1 plantilla + 1 archivo de datos por obra eliminaría ~1.199 × 16 KB ≈ **19 MB de HTML duplicado**.

### 3.2 Hermenéuticas (`herm_AA-NNNN.html`) — 1.200 archivos, ~2.8 KB

- **1.032 de 1.200 herm (86%)** comparten la misma firma estructural. Solo 22 plantillas distintas.
- Layout idéntico tipo tarjeta 800×600 Dreamweaver con imagen + texto.

### 3.3 Ampliaciones (`amp_AA-NNNN.html`) — 1.200 archivos, ~3.6 KB

- Aparenta variabilidad (876 firmas estructurales) **pero no es variabilidad real**: cada `amp_*.html` trae hardcodeados los `width`/`height` exactos de la imagen y pequeñas variaciones del caption.
- El esqueleto HTML y los estilos inline son los mismos; lo que cambia son 3–4 números.

### 3.4 Sprites de layout (plantilla Dreamweaver)

- 64 GIFs con patrón `ficha_rX_cX.gif` en `galeria/images/` que representan **una única tabla visual** (bordes, esquinas, sombras, y los rótulos de sección) troceada en celdas, un patrón típico de Dreamweaver pre-CSS3.

### 3.5 Navegación Flash

- 60 archivos `.swf` en la raíz y carpetas asociadas: `index.swf`, `galeria.swf`, `historia.swf`, `antecedentes.swf`, `catalogacion.swf`, `creditos.swf`, `enlaces.swf`, `exposiciones.swf`, `glosario.swf`, `invitados1..3.swf`, `mapa.swf`, `mira.swf`, `procesos.swf`, `taller_procesos*.swf`, `intercambio_*.swf`, etc.
- **Todos son contenido estático compilado** (textos, menús, transiciones). El navegador moderno ya no puede reproducirlos.
- `MojaveExternalAll.swf` y `MojaveExternalPlaySeekMute.swf` son controles del reproductor de los `.flv` en `media/`.

### 3.6 Firefox Portable embebido (`App/`)

- ~600 archivos Windows (Firefox 3.x + plugin Flash). **No es contenido**, es el entorno que permitía abrir el CD-ROM sin navegador externo.
- Queda fuera del alcance de la migración (no hay información del acervo ahí).

### 3.7 Archivos de datos fuente (pre-refactor)

- **No existe ningún archivo de datos estructurado propio del sitio** (no hay JSON/CSV/XML del acervo).
- Los únicos `.json` del repositorio son `omni.json` y similares de Firefox Portable.
- Los textos se extraen reconstruyendo: del `.swf` (imposible sin descompilar) o de los 3.600 HTML estáticos.
- Archivos editoriales sueltos en `colecciondegrabado/txt/`: `historia.txt`, `difusion.txt`, `mira.txt`, `exposiciones.txt`, `premios.txt`, `catalogacion.txt`, `text.txt` (fuentes para las secciones homónimas del sitio Flash).

### 3.8 Contenido documental externo

- `PDF/`: 8 catálogos/bienales (cada uno con PDF + versión HTM + carpeta de imágenes JPG que replican cada página).
- `media/*.flv`: 5 videos (calcografía, policromía hyter, policromía matriz, serigrafía, litografía) + `video_agua.swf`. **No se migran** en este alcance.

### 3.9 Problemas técnicos detectados en el HTML legacy

- **Codificación**: el `DOCTYPE XHTML 1.0 Transitional + charset iso-8859-1` declarado hace que las tildes y la "ñ" se muestren como caracteres especiales cuando el contenido pasa a un navegador moderno (UTF-8). Hay que arreglar la codificación.
- **Scroll de la ficha**: la maquetación está hecha sobre una tabla de 800×600 con alto fijo; en viewports actuales el contenido inferior queda cortado o fuerza scroll interno. Hay que arreglar el scroll.
- **Prev/Todas**: la galería de previas usa un layout de pocas columnas que deja mucho espacio lateral sin aprovechar. Hay que aumentar las columnas para usar mejor el espacio.
- **Títulos como imágenes**: como los rótulos de sección están pintados dentro de sprites GIF, no se pueden traducir ni corregir ortográficamente sin reeditar imágenes. Hay que reemplazarlos por texto real.

---

## 4. Qué se va a reutilizar y qué no (alcance acotado)

| Recurso                                          | Decisión     | Comentario                                            |
|--------------------------------------------------|--------------|-------------------------------------------------------|
| 3.673 imágenes del acervo (`imagenes/alta,baja,previa`) | Reutilizar | Se mantienen tal cual. No se completarán las faltantes. |
| 1.200 fichas HTML                                | Reemplazar   | Pasar a plantilla única alimentada por datos          |
| 1.200 amp + 1.200 herm                           | Reemplazar   | Extraer texto/dimensiones y servir con plantilla única |
| 20 PDFs de catálogos                             | Reutilizar   | Servir directo + página índice                        |
| 7 textos editoriales (`txt/`)                    | Reutilizar   | Integrar en secciones Historia / Difusión / Mira      |
| 18 HTML de enlaces externos                      | Revisar       | Verificar cuáles URLs siguen activos                 |
| **60 `.swf` de navegación**                      | **Migración parcial** | Se migra solo `index.swf` + ~5 subpáginas a las que lleva el index. El resto de los `.swf` no se migra. |
| 5 videos `.flv`                                  | No migrar    | Fuera del alcance por tiempo                         |
| Imágenes faltantes del acervo                    | No completar | Fuera del alcance                                    |
| Rediseño visual                                  | No hacer     | No sabemos si el diseño es institucional aprobado; se mantiene lo más parecido posible al original y solo se tocan los problemas técnicos listados en §3.9 |
| `App/` Firefox Portable                          | Excluir      | Entorno de ejecución Windows, no es contenido         |
| `index.exe`, `.bat`, `autorun.inf`               | Excluir      | Artefactos del CD-ROM                                |

---

## 5. Cosas estáticas repetidas que vale la pena destacar en el informe de Objetivo 1

1. **3.600 HTML autogenerados** (`AA-NNNN.html`, `amp_*`, `herm_*`) con la misma plantilla → candidato #1 a refactor.
2. **Títulos de sección pintados en GIF** (no son texto), repetidos en las 1.200 fichas → problema de accesibilidad, búsqueda y tildes.
3. **Encabezados/etiquetas de campos** (Autor:, Título:, Técnica:, Dimensiones:, …) repetidos 1.200 veces por vista.
4. **Paleta de sprites `ficha_rX_cX.gif`** (64 pequeños GIFs formando un solo marco) repetida en las 1.200 fichas.
5. **DOCTYPE XHTML 1.0 Transitional + charset `iso-8859-1`** repetido en los 3.600 HTML → causa los problemas de tildes en navegadores modernos.
6. **Atributos `width`/`height` hardcodeados** en `amp_*.html` (única razón por la que no son idénticos entre sí).
7. **60 archivos Flash** como única forma de navegación entre secciones.
8. **Ausencia total de datos estructurados** (no hay JSON/CSV/XML de obras en el origen; todo vive dentro del HTML o compilado dentro de los .swf).
9. **Layout de la galería de previas subutilizado** (pocas columnas, mucho espacio vacío a los lados).
10. **Scroll roto en las fichas** por alturas fijas heredadas del layout 800×600.

---

## 6. Archivos generados

- [`inventario_original_e361fdb.csv`](./inventario_original_e361fdb.csv) — CSV con columnas `ruta, tipo, ext, bytes, title, links, srcs` para los 4.770 archivos del estado original.
- `reporte_inventario_original.md` — este documento.

