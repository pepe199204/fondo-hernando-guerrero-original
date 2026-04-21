import json
import re
from collections import Counter, defaultdict
from html import unescape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GALLERY_DIR = ROOT / "galeria"
INDICE_JS = GALLERY_DIR / "js" / "indice.js"
OUTPUT_DIR = ROOT / "data" / "gallery"


def normalize_text(value: str) -> str:
    if value is None:
        return ""
    text = unescape(str(value)).replace("\xa0", " ").strip()
    return re.sub(r"\s+", " ", text)


def strip_html_tags(value: str) -> str:
    return normalize_text(re.sub(r"<[^>]+>", " ", value or ""))


def parse_indice() -> dict:
    content = INDICE_JS.read_text(encoding="latin-1")
    pattern = re.compile(r'_GRABADOS\[(\d+)\]\[(\d+)\]\s*=\s*(?:"([^"]*)"|(\d+));')
    data = defaultdict(dict)
    for match in pattern.finditer(content):
        item_idx = int(match.group(1))
        field_idx = int(match.group(2))
        raw_value = match.group(3) if match.group(3) is not None else match.group(4)
        data[item_idx][field_idx] = raw_value
    return data


def extract_html_metadata(path: Path) -> dict:
    text = path.read_text(encoding="latin-1", errors="ignore")
    normalized = re.sub(r"\s+", " ", text)

    title_match = re.search(r"<strong>(.*?)</strong>", normalized, re.IGNORECASE)
    title = normalize_text(title_match.group(1)) if title_match else ""
    title = re.sub(r'^"|"$', "", title)

    edition_match = re.search(r"Edici[oó]n\s*</span>\s*([^<]+)</div>", normalized, re.IGNORECASE)
    year_match = re.search(r"A(?:&ntilde;|ñ)o</span>\s*([0-9]{4})", normalized, re.IGNORECASE)
    theme_match = re.search(r"Tem(?:&aacute;|á)tica</span>\s*([^<]+)</div>", normalized, re.IGNORECASE)
    dim_match = re.search(r"<span class=\"Estilo2\">([0-9xX/\s]+)</span></div>\s*</td>\s*<td", normalized)
    img_lo_match = re.search(r'<img src="([^"]+lo\.jpg)"', normalized, re.IGNORECASE)
    img_hi_match = re.search(r'<a href="([^"]+hi\.jpg)" target="_blank"', normalized, re.IGNORECASE)
    herm_match = re.search(r'href="(herm_[^"]+\.html)"', normalized, re.IGNORECASE)
    analysis_theme_match = re.search(r'href="analisis/([^/]+)/[^"]+\.htm"', normalized, re.IGNORECASE)

    return {
        "title_from_amp": title,
        "edition": normalize_text(edition_match.group(1)) if edition_match else "",
        "year_from_amp": int(year_match.group(1)) if year_match else None,
        "theme_from_amp": normalize_text(theme_match.group(1)) if theme_match else "",
        "dimensions": normalize_text(dim_match.group(1)) if dim_match else "",
        "image_low": normalize_text(img_lo_match.group(1)) if img_lo_match else "",
        "image_high": normalize_text(img_hi_match.group(1)) if img_hi_match else "",
        "herm_file": normalize_text(herm_match.group(1)) if herm_match else "",
        "analysis_theme_slug": normalize_text(analysis_theme_match.group(1)) if analysis_theme_match else "",
    }


def extract_herm_text(path: Path) -> str:
    if not path.exists():
        return ""
    text = path.read_text(encoding="latin-1", errors="ignore")
    normalized = re.sub(r"\s+", " ", text)
    paragraphs = re.findall(r"<span class=\"Estilo2\"><br />\s*(.*?)\s*</span>", normalized, re.IGNORECASE)
    if not paragraphs:
        return ""
    clean_text = " ".join(strip_html_tags(p) for p in paragraphs if p.strip())
    return normalize_text(clean_text)


def build_datasets():
    raw = parse_indice()
    obras = []
    authors_counter = Counter()
    themes_counter = Counter()
    techniques_counter = Counter()

    for idx in sorted(raw):
        record = raw[idx]
        code = normalize_text(record.get(0, ""))
        if not code:
            continue

        amp_filename = f"amp_{code}.html"
        herm_filename = f"herm_{code}.html"
        amp_path = GALLERY_DIR / amp_filename
        herm_path = GALLERY_DIR / herm_filename

        amp_meta = extract_html_metadata(amp_path) if amp_path.exists() else {}
        herm_text = extract_herm_text(herm_path)

        autor = normalize_text(record.get(1, ""))
        title_from_indice = normalize_text(record.get(2, ""))
        title_from_amp = amp_meta.get("title_from_amp", "")
        if title_from_amp and autor:
            title_from_amp = re.sub(rf"\s*,\s*{re.escape(autor)}\s*$", "", title_from_amp, flags=re.IGNORECASE)
        title = title_from_amp if (not title_from_indice or title_from_indice.lower() == "no disponible") else title_from_indice
        tecnica = normalize_text(record.get(3, ""))
        ano = int(record.get(4)) if record.get(4) and str(record.get(4)).isdigit() else amp_meta.get("year_from_amp")
        tematica = amp_meta.get("theme_from_amp", "")

        titulo = title
        if not titulo or titulo.lower() == "no disponible":
            titulo = "Sin título"

        obra = {
            "indice": idx,
            "id": code,
            "archivoAmp": amp_filename if amp_path.exists() else "",
            "archivoHerm": herm_filename if herm_path.exists() else "",
            "autor": autor,
            "titulo": titulo,
            "tecnica": tecnica,
            "ano": ano,
            "tematica": tematica,
            "dimensiones": amp_meta.get("dimensions", ""),
            "edicion": amp_meta.get("edition", ""),
            "imagenBaja": amp_meta.get("image_low", ""),
            "imagenAlta": amp_meta.get("image_high", ""),
            "slugTematicaAnalisis": amp_meta.get("analysis_theme_slug", ""),
            "textoHermeneutico": herm_text,
            "fuente": {
                "indiceJs": "galeria/js/indice.js",
                "htmlAmp": f"galeria/{amp_filename}" if amp_path.exists() else "",
                "htmlHerm": f"galeria/{herm_filename}" if herm_path.exists() else "",
            },
        }
        obras.append(obra)

        if autor:
            authors_counter[autor] += 1
        if tematica:
            themes_counter[tematica] += 1
        if tecnica:
            techniques_counter[tecnica] += 1

    autores = [
        {"nombre": name, "cantidadObras": count}
        for name, count in sorted(authors_counter.items(), key=lambda kv: (-kv[1], kv[0].lower()))
    ]
    tematicas = [
        {"nombre": name, "cantidadObras": count}
        for name, count in sorted(themes_counter.items(), key=lambda kv: (-kv[1], kv[0].lower()))
    ]
    tecnicas = [
        {"nombre": name, "cantidadObras": count}
        for name, count in sorted(techniques_counter.items(), key=lambda kv: (-kv[1], kv[0].lower()))
    ]

    estadisticas = {
        "totalObrasDesdeIndice": len(obras),
        "conArchivoAmp": sum(1 for o in obras if o["archivoAmp"]),
        "conArchivoHerm": sum(1 for o in obras if o["archivoHerm"]),
        "conTematica": sum(1 for o in obras if o["tematica"]),
        "conTextoHermeneutico": sum(1 for o in obras if o["textoHermeneutico"]),
        "generadoDesde": ["galeria/js/indice.js", "galeria/amp_*.html", "galeria/herm_*.html"],
    }

    return obras, autores, tematicas, tecnicas, estadisticas


def write_json(path: Path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    obras, autores, tematicas, tecnicas, estadisticas = build_datasets()

    write_json(OUTPUT_DIR / "obras.json", obras)
    write_json(OUTPUT_DIR / "autores.json", autores)
    write_json(OUTPUT_DIR / "tematicas.json", tematicas)
    write_json(OUTPUT_DIR / "tecnicas.json", tecnicas)
    write_json(OUTPUT_DIR / "estadisticas.json", estadisticas)

    print(f"Generados {len(obras)} registros en {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
