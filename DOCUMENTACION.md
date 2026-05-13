# Colección de Grabado — Documentación del repositorio

Facultad de Artes, Vicerrectoría de Docencia, Universidad de Antioquia.

Este documento describe el sitio web actual de la **Colección de Grabado de Hernando Guerrero** después de la migración del CD-ROM original (Flash + HTML estático) a un sitio web moderno basado en plantillas HTML alimentadas por archivos JSON. Cubre:

1. Qué muestra cada sección del sitio.
2. El modelo de datos (los tres JSON en `data/gallery/`).
3. Cómo agregar una nueva obra paso a paso.
4. Un **inventario final** del estado actual del repositorio.
5. Lo que queda pendiente: hosting en la UdeA y migración del contenido Flash.

> **Contexto previo.** Este documento parte del diagnóstico del repositorio original. Para entender el punto de partida (3.600 HTML estáticos generados desde Dreamweaver, 60 archivos `.swf` de navegación Flash, ausencia total de datos estructurados, plantilla con codificación `iso-8859-1`, etc.) ver [`reporte_inventario_original.md`](./reporte_inventario_original.md) y el inventario por archivo [`inventario_original_e361fdb.csv`](./inventario_original_e361fdb.csv). Ese CSV lista **4.770** rutas del CD-ROM; el **primer commit de Git** (`36a7177`) contiene **8.346** archivos porque incluye además el árbol del sitio empaquetado y **Firefox Portable** — ver §4.5.

---

## 1. Estructura del sitio — qué muestra cada sección

### 1.1 Pantalla de entrada

[`index.html`](./index.html) es el *splash* del sitio. Muestra el escudo de la UdeA, el título *"COLECCIÓN DE GRABADO"* y dos enlaces de acceso:

- **Sitio** → `principal.html` (presentación + navegación principal del sitio).
- **Galería** → `galeria/index.html` (acceso directo al catálogo de obras).

### 1.2 Sitio principal (5 enlaces del top-nav)

A partir de `principal.html` el sitio expone una barra superior con 5 secciones. Esa barra y la columna lateral se inyectan dinámicamente desde [`galeria/js/layout.js`](./galeria/js/layout.js), por eso todas las páginas comparten el mismo header sin duplicar HTML.

| Sección | Archivo | Contenido |
|---|---|---|
| **Principal** | [`principal.html`](./principal.html) | Presentación de la colección: historia (fundación 1991 por el profesor Hernando Guerrero), acervo de 1.200 obras, rol del Grupo MIRA desde 2005, agradecimiento al CODI. |
| **Procesos** | [`procesos.html`](./procesos.html) | Estadísticas y conclusiones del proyecto de catalogación. |
| **Galería** | [`galeria/index.html`](./galeria/index.html) | Acceso al catálogo (abre en pestaña nueva). Detallado en §1.3. |
| **Blog** | [`coleccion.html`](./coleccion.html) | WordPress legacy (tema *Kubrick*). Conservado como referencia histórica; abre en pestaña nueva. |
| **Créditos** | [`creditos.html`](./creditos.html) | Equipo del Grupo MIRA, dependencias UdeA, financiación. |

### 1.3 Galería — el corazón del catálogo

La galería tiene una pantalla de entrada y tres vistas por obra, todas alimentadas desde JSON:

| Vista | URL | Qué muestra | JSON de origen |
|---|---|---|---|
| Entrada de galería | `galeria/index.html` | Pantalla de presentación con dos opciones de visualización: *Listar alfabéticamente* y *Previo por imagen*. | (HTML estático) |
| Listado alfabético | `galeria/lista_todas.html` | Lista textual de las obras ordenadas por autor. | `obras.json` (vía `lista.js`) |
| Cuadrícula de previas | `galeria/prev_todas.html` y `galeria/prev.html` | Grilla de miniaturas de todas las obras, con búsqueda por autor / técnica / temática / año. | `prev-10.json` (vía `prev.js`) |
| **Ficha completa** | `galeria/ficha.html?id=AA-NNNN` | Ficha de la obra: imagen previa, ficha técnica (título, autor, técnica, edición, medidas, soporte, año), análisis pre-iconográfico, datos adicionales de la obra y del artista. | `obras.json` (vía `ficha-larga.js`) |
| **Ampliación** | `galeria/amp.html?id=AA-NNNN` | Imagen de la obra a tamaño grande con sus datos básicos al pie. Botones para abrir la imagen original (alta), ir al análisis estético, y — si la obra está catalogada — abrir el análisis temático en PDF. | `obras.json` (vía `amp.js`) |
| **Análisis estético** | `galeria/herm.html?id=AA-NNNN` | Análisis hermenéutico de la obra (texto largo). | `herm.json` + `obras.json` (vía `herm.js`) |

Las vistas `ficha`, `amp` y `herm` reciben el ID por *query string*. Ejemplo: `galeria/ficha.html?id=02-1018` carga la obra con id `02-1018`.

### 1.4 Análisis temáticos

[`galeria/analisis/`](./galeria/analisis) contiene seis PDFs con los análisis hermenéuticos por temática:

`erotismo.pdf`, `existencial-espiritual.pdf`, `ludico.pdf`, `popular.pdf`, `urbano.pdf`, `violencia.pdf`.

En `obras.json`, el campo `enlaceExterno` apunta al PDF correspondiente cuando la obra fue clasificada en alguna de estas seis temáticas (157 de las 1.200 obras). Estas son las obras que muestran el botón **"Análisis temático"** dentro de las vistas `amp` y `herm`.

### 1.5 Catálogos

[`PDF/`](./PDF) reúne 7 catálogos y bienales en PDF (catalogues 03–07, *4-Bienal-Grafica.pdf*, *Muestra-Grafica.pdf*).

---

## 2. Modelo de datos — los tres JSON en `data/gallery/`

Los tres archivos viven en [`data/gallery/`](./data/gallery/) y son la única fuente de verdad del catálogo. Todos exponen un objeto `meta` con el `schema`, una `descripcion` legible y el `total` esperado, más el arreglo de registros.

### 2.1 `obras.json` — catálogo completo (schema `ficha-larga-v1`)

Es el archivo grande (1.7 MB, 1.200 obras). Lo consumen `amp.js`, `ficha-larga.js` y `herm.js`. Cada obra tiene **23 campos**:

| Campo | Tipo | Obligatorio | Ejemplo / valores | Notas |
|---|---|---|---|---|
| `id` | string | **Sí** | `"02-1018"` | Formato `AA-NNNN`. Es la llave primaria. |
| `titulo` | string | Sí | `"Sin título"` | Si no hay título conocido, usar `"Sin título"`. |
| `autor` | string | Sí | `"(Josabad) Robert López"` | Nombre completo. |
| `tecnica` | string | Sí | `"Grabado en linoleo (color)"` | |
| `edicion` | string | Sí | `"P/A"`, `"15/30"` | Vacío `""` si no aplica. |
| `medidas` | string | Sí | `"39x61/50x70"` | Convención: `imagen / soporte` (huella sobre papel). |
| `unidadMedida` | string | Sí | `"cms."` | Usualmente `"cms."`. |
| `material` | string | Sí | `"Cartulina plana"` | |
| `gramaje` | string | Sí | `"200"` | Gramaje del soporte. |
| `anioObra` | string | Sí | `"2002"` | Año de creación de la obra. |
| `anioRegistro` | string | Sí | `"2002"` | Año de ingreso a la colección. |
| `descripcionIconografica` | string | Sí | (texto largo) | Análisis pre-iconográfico que aparece en la ficha. |
| `tematica` | string | Sí | `"No disponible"`, `"Erotismo"`, `"Lúdico"`, `"Popular"`, `"Urbano"`, `"Violencia"`, `"Existencial-Espiritual"` | Cuando hay análisis hermenéutico, debe coincidir con la temática del PDF. |
| `catalogacion` | string | Sí | `"No Disponible"` | Estado de catalogación interna. |
| `estadoConservacionFila` | array de 3 strings | Sí | `["Bueno", "No", "Sí"]` | `[estado, paraRestauración, registroDigital]`. Valores comunes: `"Bueno"`/`"Regular"`/`"Deteriorado"`/`"No disponible"` y `"Sí"`/`"No"`. |
| `ubicacionFisica` | string | Sí | `"Facultad de Artes - Museo Universitario"` | |
| `inventarioTomo` | string | Sí | `"3"` | Número de planoteca. |
| `inventarioFolio` | string | Sí | `"22"` | Número de carpeta dentro de la planoteca. |
| `permiteReproduccion` | string | Sí | `"Sí"` / `"No"` | Etiquetado en la UI como *"Registro Análogo"*. |
| `permitePublicacion` | string | Sí | `"Sí"` / `"No"` | Etiquetado en la UI como *"Registro Digital"*. |
| `observaciones` | string | Sí | `"Estudiante Facultad de artes"` | Etiquetado en la UI como *"Tipo de vinculación"*. |
| `urls` | objeto | Sí | `{ "previsualizacion": "../imagenes/previa/02-1018prev.jpg", "ampliacion": "amp_02-1018.html" }` | Rutas relativas a `galeria/`. La convención es `../imagenes/previa/{id}prev.jpg`. |
| `enlaceExterno` | string | Sí (puede ser `""`) | `"analisis/ludico.pdf"` | Solo poblado en las 157 obras con análisis temático asignado. Apunta a uno de los 6 PDFs en `galeria/analisis/`. |

**Distribución actual de `enlaceExterno`** (1.200 obras): 1.043 vacías, 32 lúdico, 31 erotismo, 27 existencial-espiritual, 24 urbano, 23 popular, 20 violencia.

### 2.2 `herm.json` — análisis hermenéuticos (schema `herm-v1`)

602 KB, 1.200 registros. Solo dos campos:

```json
{ "id": "02-1018", "texto": "Formato recto-horizontal. Formas semi abstractas..." }
```

Lo consume `herm.js` para renderizar la página de análisis estético. Si una obra no tiene su entrada aquí, `herm.js` cae al `descripcionIconografica` de `obras.json` como respaldo.

### 2.3 `prev-10.json` — índice ligero para la cuadrícula (schema `prev-v1`)

165 KB, 1.200 registros. Un subset de 4 campos por obra (los necesarios para mostrar el *card* del thumbnail):

```json
{ "id": "02-1018", "titulo": "Sin título", "autor": "(Josabad) Robert López", "medidas": "39x61/50x70" }
```

Lo consume `prev.js`. El número `-10` en el nombre del archivo es histórico (era una demo con 10 obras); hoy contiene las 1.200.

### 2.4 Por qué tres archivos y no uno

`obras.json` ya tiene todos los campos de los otros dos. Se mantienen separados por **performance**: la grilla de previas necesita cargar rápido un listado liviano (165 KB) y no las fichas completas (1.7 MB). La separación también permite que el análisis hermenéutico se actualice sin tocar el catálogo principal.

---

## 3. Cómo agregar una nueva obra al catálogo

Esta es la receta paso a paso. Asume un ID nuevo `AA-NNNN` (por ejemplo `26-0001` para una obra registrada en 2026 con folio interno 0001).

### 3.1 Imágenes — preparar y copiar 3 archivos

Cada obra necesita exactamente **3 imágenes JPG** con nombres exactos:

| Resolución | Carpeta | Nombre | Tamaño objetivo | Uso |
|---|---|---|---|---|
| Alta | [`imagenes/alta/`](./imagenes/alta/) | `{id}hi.jpg` | El máximo disponible (sin upscale). Las actuales van de ~50 KB a ~600 KB; mantener calidad ≥85. | Botón *"Imagen original"* en `amp` y `herm`. |
| Media | [`imagenes/baja/`](./imagenes/baja/) | `{id}lo.jpg` | Lado largo ~800–1.000 px. | Imagen principal en `amp` y `herm`. |
| Previa | [`imagenes/previa/`](./imagenes/previa/) | `{id}prev.jpg` | Lado largo ~150–200 px. | Thumbnail en `ficha` y en la grilla de previas. |

**Convención del nombre**: el ID literal seguido del sufijo `hi`, `lo` o `prev` según la carpeta, siempre en minúsculas y `.jpg`. Para `26-0001` → `26-0001hi.jpg`, `26-0001lo.jpg`, `26-0001prev.jpg`.

> Las rutas se construyen automáticamente desde el ID en el código JavaScript (`amp.js`, `ficha-larga.js`, `herm.js`). No es necesario tocar JS para una obra nueva: si el archivo existe en la carpeta correcta, aparece.

### 3.2 Información — recoger los datos de la obra

Antes de tocar los JSON, conviene tener todos los datos en un formulario de captura. Estos son los campos a recoger (ver §2.1 para la descripción completa de cada uno):

**Identificación y ficha técnica** (obligatorios para que la ficha se vea bien): `id`, `titulo`, `autor`, `tecnica`, `edicion`, `medidas`, `unidadMedida`, `material`, `gramaje`, `anioObra`, `anioRegistro`.

**Análisis pre-iconográfico**: `descripcionIconografica` (texto descriptivo de lo que se ve en la obra) y `tematica` (`"No disponible"` si todavía no se ha clasificado).

**Datos administrativos**: `catalogacion`, `estadoConservacionFila` (los 3 valores), `ubicacionFisica`, `inventarioTomo`, `inventarioFolio`, `permiteReproduccion`, `permitePublicacion`, `observaciones`.

**Análisis hermenéutico** (opcional, va en `herm.json`): texto largo de análisis estético. Si no se tiene, omitir el registro en `herm.json` y `herm.js` mostrará el `descripcionIconografica` como respaldo.

**Análisis temático** (opcional, va en el campo `enlaceExterno` de `obras.json`): solo si la obra fue clasificada en una de las 6 temáticas con PDF (`erotismo`, `existencial-espiritual`, `ludico`, `popular`, `urbano`, `violencia`). En ese caso `enlaceExterno = "analisis/{tematica}.pdf"`.

### 3.3 Editar los tres JSON

Editar manualmente los tres archivos (orden recomendado).

#### a. `data/gallery/obras.json`

Agregar el objeto al final del arreglo `obras`:

```json
{
  "id": "26-0001",
  "titulo": "Sin título",
  "autor": "Nombre del Artista",
  "tecnica": "Grabado en linóleo",
  "edicion": "P/A",
  "medidas": "20x30/35x50",
  "unidadMedida": "cms.",
  "material": "Cartulina plana",
  "gramaje": "200",
  "anioObra": "2026",
  "anioRegistro": "2026",
  "descripcionIconografica": "Formato recto-horizontal. ...",
  "tematica": "No disponible",
  "catalogacion": "No Disponible",
  "estadoConservacionFila": ["Bueno", "No", "Sí"],
  "ubicacionFisica": "Facultad de Artes - Museo Universitario",
  "inventarioTomo": "3",
  "inventarioFolio": "23",
  "permiteReproduccion": "Sí",
  "permitePublicacion": "Sí",
  "observaciones": "Estudiante Facultad de artes",
  "urls": {
    "previsualizacion": "../imagenes/previa/26-0001prev.jpg",
    "ampliacion": "amp_26-0001.html"
  },
  "enlaceExterno": ""
}
```

Y actualizar `meta.total` (por ejemplo de `1200` a `1201`).

#### b. `data/gallery/prev-10.json`

Agregar al final del arreglo `obras`:

```json
{ "id": "26-0001", "titulo": "Sin título", "autor": "Nombre del Artista", "medidas": "20x30/35x50" }
```

Y actualizar `meta.total`.

#### c. `data/gallery/herm.json` *(opcional)*

Solo si hay análisis hermenéutico escrito. Agregar al final del arreglo `analisis`:

```json
{ "id": "26-0001", "texto": "Formato recto-horizontal. Análisis estético detallado..." }
```

Y actualizar `meta.total`.

### 3.4 Validar

Antes de hacer commit, validar que los JSON sigan siendo JSON válido y que las URLs funcionen:

1. **Validar JSON**: pasar cada archivo por un validador (cualquier editor de código moderno marca errores automáticamente, o usar `python -m json.tool data/gallery/obras.json > /dev/null`).
2. **Probar las tres vistas localmente**:
   - `galeria/ficha.html?id=26-0001`
   - `galeria/amp.html?id=26-0001`
   - `galeria/herm.html?id=26-0001`
3. **Confirmar que aparece en la grilla de previas**: abrir `galeria/prev_todas.html` y verificar que la miniatura está y enlaza correctamente.
4. **Si la obra tiene análisis temático**: confirmar que el botón *"Análisis temático"* aparece en la vista `amp` y abre el PDF correspondiente.

### 3.5 Hacer commit

Con todo verificado, *commit* con un mensaje descriptivo. Convención sugerida:

```
feat(catalogo): agregar obra 26-0001 - "Sin título" de Nombre del Artista
```

Y agregar al *commit* tanto los 3 JSON modificados como las 3 imágenes nuevas.

### 3.6 Resumen — checklist por obra

- 3 JPG con nombre `{id}hi.jpg`, `{id}lo.jpg`, `{id}prev.jpg` en sus carpetas.
- 1 entrada nueva en `data/gallery/obras.json` (23 campos) + `meta.total++`.
- 1 entrada nueva en `data/gallery/prev-10.json` (4 campos) + `meta.total++`.
- 1 entrada nueva en `data/gallery/herm.json` *si hay análisis* + `meta.total++`.
- 3 vistas verificadas (`ficha`, `amp`, `herm`) y aparece en la grilla.

---

## 4. Inventario final del repositorio

Estado a la fecha de este documento (sin contar `.git`).

### 4.1 Conteos por extensión

| Extensión | Cantidad | Comentario |
|---|---:|---|
| `.jpg` (+ `.JPG`) + `.tif` | **3.709** | 3.708 JPG + 1 TIFF en acervo (`imagenes/alta/`). |
| `.pdf` | 17 | 7 catálogos en `PDF/` + 6 análisis temáticos + 4 catálogos en `images/catalogos/`. |
| `.html` | 12 | Páginas del sitio: 5 top-level + 7 plantillas en `galeria/`. |
| `.gif` | 9 | Iconos y sprites compartidos (`galeria/images/`, `images/bg.gif`). |
| `.css` | 8 | 2 en `styles/`, 5 en `galeria/css/`, 1 en `coleccion/`. |
| `.js` | 8 | Toda la lógica del sitio en `galeria/js/`. |
| `.json` | **3** | Los tres JSON del catálogo en `data/gallery/`. |
| `.png` | 1 | Logo UdeA. |
| `.md` | 3 | `README.md`, `DOCUMENTACION.md`, `reporte_inventario_original.md`. |
| `.csv` | 1 | `inventario_original_e361fdb.csv`. |
| `.xlsx` | 1 | `galeria_analisis_hermeneutico.xlsx`. |
| `.gitignore` | 1 | Reglas de exclusiones de Git en la raíz. |
| **Total** | **3.773** | Coincide con `git ls-files` (sin contar `.git`). |

### 4.2 Conteos por carpeta top-level

| Carpeta | Archivos | Tamaño | Contenido |
|---|---:|---:|---|
| [`imagenes/`](./imagenes/) | 3.673 | 194 MB | Imágenes del acervo en 3 resoluciones. |
| [`galeria/`](./galeria/) | 34 | 2,6 MB | Plantillas HTML + JS + CSS + 6 PDFs de análisis temático. |
| [`coleccion/`](./coleccion/) | 30 | 206 KB | Blog WordPress legacy (tema *Kubrick*). |
| [`images/`](./images/) | 13 | 5,3 MB | Assets globales del sitio (logo, fotos del aside). |
| (raíz) | 11 | — | `index.html`, `principal.html`, `procesos.html`, `coleccion.html`, `creditos.html`, `README.md`, `DOCUMENTACION.md`, `reporte_inventario_original.md`, `inventario_original_e361fdb.csv`, `galeria_analisis_hermeneutico.xlsx`, `.gitignore`. |
| [`PDF/`](./PDF/) | 7 | 28 MB | Catálogos de bienales y muestras. |
| [`data/`](./data/) | 3 | 2,4 MB | Los tres JSON del catálogo. |
| [`styles/`](./styles/) | 2 | 30 KB | CSS global del sitio. |
| **Total** | **3.773** | **~233 MB** | |

### 4.3 Imágenes del acervo — detalle

| Resolución | Cantidad | Tamaño | Patrón |
|---|---:|---:|---|
| Alta (`imagenes/alta/`) | 1.226 | 141 MB | `{id}hi.jpg` |
| Baja (`imagenes/baja/`) | 1.224 | 49 MB | `{id}lo.jpg` |
| Previa (`imagenes/previa/`) | 1.223 | 3,9 MB | `{id}prev.jpg` |

**Inconsistencias conocidas** entre resoluciones (no se completarán según decisión del alcance original):

- 4 archivos en `alta/` con nombre fuera de patrón: `00-0818hi.tif` (TIFF en vez de JPG), `02-103` (sin sufijo), `94-0120 (a-b)` (sufijo no estándar), `95-0291hi.JPG` (extensión en mayúscula).
- 1 archivo en `baja/` sin previa: `97-481`.
- 1 archivo en `previa/` con id que no aparece en `alta/`: `95-0291` (porque en `alta/` está como `.JPG`).

### 4.4 Datos del catálogo

| Archivo | Tamaño | Items | Schema |
|---|---:|---:|---|
| [`data/gallery/obras.json`](./data/gallery/obras.json) | 1.682 KB | 1.200 | `ficha-larga-v1` |
| [`data/gallery/herm.json`](./data/gallery/herm.json) | 601 KB | 1.200 | `herm-v1` |
| [`data/gallery/prev-10.json`](./data/gallery/prev-10.json) | 165 KB | 1.200 | `prev-v1` |

### 4.5 Comparativo del repositorio Git (primer commit vs actual)

Las cifras de esta sección salen del propio historial de Git: **`git ls-tree -r --name-only <commit>`** para el pasado y **`git ls-files`** para el estado actual. El commit raíz es **`36a7177`** (mensaje *first commit*).

**Inventario CSV vs primer commit.** El archivo [`inventario_original_e361fdb.csv`](./inventario_original_e361fdb.csv) documenta **4.770** rutas del contenido del CD-ROM. El primer commit de este repositorio tiene **8.346** archivos porque versiona, además del árbol bajo `colecciondegrabado/`, **Firefox Portable** y lanzadores (`App/`, `Data/`, `Other/`, ejecutables, ayuda): **290** archivos en ese paquete, más **`.DS_Store`**, `README.md` en la raíz del snapshot, etc. La diferencia **8.346 − 4.770 = 3.576** corresponde a ese material extra respecto al inventario por archivo del medio.

#### Tabla comparativa (conteos verificados en Git)

| Métrica | Primer commit (`36a7177`) | Actual (`HEAD`) | Cambio |
|---|---:|---:|---:|
| **Total archivos versionados** | **8.346** | **3.773** | **−4.573** |
| HTML (`.html` + `.htm`) | 3.659 (3.645 + 14) | 12 | −3.647 |
| Flash (`.swf`) | 60 | 0 | −60 |
| JSON del catálogo (`data/gallery/*.json`) | 0 | 3 | +3 |
| Otros `.json` (p. ej. perfil/navegador en `Data/`) | 1 | 0 | −1 |
| Archivos bajo `colecciondegrabado/imagenes/` → `imagenes/` | 3.674 | 3.673 | −1 |
| Firefox Portable y lanzadores (`App/`, `Data/`, `Other/`, `FirefoxPortable*`, `help.html`, `inicio.bat`) | 290 | 0 | Eliminado en la limpieza del repo |

En disco, fuera de `.git`, el árbol de trabajo suele coincidir con **3.773** archivos versionados; puede aparecer **una ruta extra** local (p. ej. metadatos del IDE en `.idea/` ignorados por Git).

El sitio actual sustituye miles de HTML autogenerados, los SWF y el navegador empaquetado por **12** HTML reutilizables, **8** JS, **8** CSS y los **3** JSON del catálogo. Toda la información del acervo (las 1.200 obras) está hoy en datos estructurados navegables y editables.

---

## 5. Pendientes — qué falta

### 5.1 Hosting en una URL de la Universidad de Antioquia

El sitio actualmente solo se ejecuta localmente o desde el repositorio de GitHub. Falta hospedarlo en infraestructura de la UdeA bajo una URL institucional para que sea públicamente accesible.

**Tareas requeridas:**

- Coordinar con la **Vicerrectoría de Docencia** y **Sistemas de la Facultad de Artes** la publicación bajo un subdominio institucional (la URL histórica era `docencia.udea.edu.co/colecciondegrabado/`, según las referencias internas en `coleccion.html`).
- Verificar requisitos de servidor: el sitio es **estático puro** (HTML + JS + JSON + imágenes), no requiere PHP, base de datos, ni runtime. Se sirve con un Apache/Nginx básico o vía servicio de páginas estáticas de la UdeA.
- Configurar **HTTPS** y dominio.
- Verificar políticas de la UdeA sobre cuotas de almacenamiento (el sitio pesa ~233 MB, casi todo en imágenes).
- Migrar referencias internas: el HTML legado de `coleccion.html` aún apunta a `http://docencia.udea.edu.co/colecciondegrabado/foro/...` (RSS, pingbacks, kubrick header). Decidir si se actualizan a la nueva URL o se eliminan los enlaces muertos.
- Tomar decisión sobre el **blog WordPress** (`coleccion/`): hoy es un *snapshot* HTML estático del WordPress 2.2.2 original (2007). En el nuevo hosting puede mantenerse como archivo histórico congelado, o sustituirse por una sección activa.

### 5.2 Migración del contenido que vive dentro de Flash

El repositorio original tenía **60 archivos `.swf`** que contenían toda la navegación y los textos editoriales del sitio Flash. Ya no se reproducen en navegadores modernos, así que su contenido está actualmente **inaccesible** desde el sitio. Lo que falta migrar:

| Sección Flash original | Posible fuente para migrar |
|---|---|
| `historia.swf` — historia de la colección | Texto en `colecciondegrabado/txt/historia.txt` (repositorio original). |
| `antecedentes.swf` | (sin texto fuente conocido — habría que descompilar el SWF). |
| `mira.swf` — Grupo MIRA | Texto en `colecciondegrabado/txt/mira.txt`. |
| `difusion.swf` | Texto en `colecciondegrabado/txt/difusion.txt`. |
| `exposiciones.swf` | Texto en `colecciondegrabado/txt/exposiciones.txt`. |
| `premios.swf` | Texto en `colecciondegrabado/txt/premios.txt`. |
| `catalogacion.swf` | Texto en `colecciondegrabado/txt/catalogacion.txt`. |
| `procesos.swf`, `taller_procesos*.swf` | Parcialmente cubierto por `procesos.html`; revisar contenido faltante. |
| `glosario.swf` | Sin fuente conocida — habría que descompilar. |
| `enlaces.swf` | Cubierto por las 18 páginas HTML de enlaces externos del original (revisar URLs activas). |
| `mapa.swf` | Mapa del sitio — ahora innecesario (el top-nav cubre la navegación). |
| `invitados1..3.swf`, `intercambio_*.swf` | Sin fuente conocida — descompilar o reconstruir. |
| 5 videos `.flv` (calcografía, policromía hyter, policromía matriz, serigrafía, litografía) | Reencodear a MP4 H.264 y montar con `<video>` HTML5. Fuera del alcance original; es trabajo aparte. |

**Tareas pendientes:**

1. **Recuperar los textos de `txt/`** desde el repositorio `fondo-hernando-guerrero-original` y crear secciones HTML correspondientes (Historia, Grupo MIRA, Difusión, Exposiciones, Premios, Catalogación). Esto es el *quick win*: 7 textos planos → 7 páginas con la misma plantilla de `principal.html`/`creditos.html`.
2. **Descompilar los `.swf` huérfanos** (los que no tienen fuente `.txt`) usando una herramienta como JPEXS Free Flash Decompiler para extraer texto e imágenes. Aplica al menos a `glosario.swf`, `antecedentes.swf`, `invitados*.swf`, `intercambio_*.swf`.
3. **Reencodear los 5 `.flv` a MP4** y publicarlos con `<video controls>` en una sección de *Procesos / Videos*.
4. **Decidir el destino final del blog WordPress** (`coleccion.html`): mantenerlo congelado o reemplazarlo.
5. **Revisar enlaces externos** (las 18 páginas HTML de `enlaces/` del original) — verificar cuáles URLs siguen activas casi 20 años después.

---

## 6. Documentos relacionados en este repositorio

- [`README.md`](./README.md) — entrada del repositorio.
- [`reporte_inventario_original.md`](./reporte_inventario_original.md) — diagnóstico del CD-ROM original (estructura, problemas técnicos, decisiones de alcance). **Lectura recomendada para entender de dónde viene el proyecto.**
- [`inventario_original_e361fdb.csv`](./inventario_original_e361fdb.csv) — inventario por archivo del CD-ROM (**4.770** rutas). El primer commit Git tiene **8.346** archivos (incluye Firefox Portable); ver §4.5.
- [`galeria_analisis_hermeneutico.xlsx`](./galeria_analisis_hermeneutico.xlsx) — listado de las 157 obras con análisis temático asignado, agrupadas por categoría (erotismo, existencial-espiritual, lúdico, popular, urbano, violencia).

---

## 7. Condiciones de despliegue

El sitio es **completamente estático** (HTML + JavaScript + JSON + imágenes). No requiere base de datos, PHP, ni ningún runtime del lado del servidor. Cualquier servidor web básico es suficiente para publicarlo.

---

### Requisitos técnicos mínimos

| Componente | Requisito |
|---|---|
| Servidor web | Apache 2.x o Nginx (configuración por defecto) |
| Protocolo | HTTPS recomendado |
| Almacenamiento | ~233 MB (casi todo en imágenes del acervo) |
| Runtime del servidor | Ninguno (no requiere PHP, Node.js ni base de datos) |
| Compatibilidad de cliente | Chrome 124+, Firefox 125+, Safari 17+, Edge 124+ |

---

### Opciones de despliegue

#### Opción 1 — Infraestructura de la Universidad de Antioquia *(recomendada)*

La URL histórica del sitio era `docencia.udea.edu.co/colecciondegrabado/`. El paso natural es restaurarla coordinando con **Sistemas de la Facultad de Artes** o la **Vicerrectoría de Docencia**.

Pasos sugeridos:
1. Contactar a Sistemas UdeA para solicitar un subdominio institucional (por ejemplo `docencia.udea.edu.co/colecciondegrabado/` o equivalente actual).
2. Verificar la cuota de almacenamiento disponible — el sitio ocupa ~233 MB.
3. Copiar el contenido del repositorio al directorio raíz del servidor web asignado.
4. Configurar HTTPS desde los servicios de la universidad.
5. Verificar que los archivos estáticos (`.json`, `.jpg`, `.pdf`) se sirvan con los tipos MIME correctos (en Apache esto es automático con la configuración por defecto).

#### Opción 2 — GitHub Pages *(despliegue inmediato, sin costo)*

Si la UdeA no tiene disponibilidad inmediata de servidor, el repositorio puede publicarse directamente desde GitHub:

1. En el repositorio de GitHub, ir a **Settings → Pages**.
2. En *Branch*, seleccionar `main` y carpeta `/` (raíz).
3. GitHub asignará una URL del tipo `https://<usuario>.github.io/<repositorio>/`.
4. El sitio estará disponible en minutos.

> **Limitación:** GitHub Pages tiene un límite de 1 GB por repositorio. El repositorio actual ocupa ~233 MB, dentro del límite.

#### Opción 3 — Servidor local para revisión

Para revisar el sitio localmente antes de cualquier despliegue, basta con un servidor HTTP simple. Desde la raíz del repositorio:

```bash
# Con Python 3
python -m http.server 8000
# Luego abrir http://localhost:8000 en el navegador
```

> **Importante:** abrir `index.html` directamente como archivo (doble clic) **no funciona** porque los scripts cargan los JSON mediante `fetch()`, lo que requiere un servidor HTTP aunque sea local.

---

### Pendientes antes del despliegue en producción

- [ ] Confirmar subdominio institucional con Sistemas UdeA.
- [ ] Actualizar las referencias internas que aún apuntan a `http://docencia.udea.edu.co/colecciondegrabado/foro/...` en `coleccion.html`.
- [ ] Decidir el destino del blog WordPress congelado (`coleccion/`): mantenerlo como archivo histórico o eliminarlo.
- [ ] Verificar que el servidor asignado sirva archivos `.json` con `Content-Type: application/json` (relevante si se usa Apache sin configuración personalizada).

*Facultad de Artes — Vicerrectoría de Docencia — Universidad de Antioquia. 2026.*
