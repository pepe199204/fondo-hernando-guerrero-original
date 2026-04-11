/**
 * Ficha larga — componente reutilizable.
 * Consume colecciondegrabado/galeria/data/obras.json (o ruta en data-ficha-json).
 * URL: ficha.html?id=00-0740
 *
 * Lógica prevista con catálogo completo en JSON:
 *  - Sin `?id=` → error (no hay qué mostrar).
 *  - `id` con formato distinto a AA-NNNN → error (evita basura en URL; alinea con fichas del sitio).
 *  - JSON ilegible / red / 404 → error en .catch.
 *  - `obras` vacío → error.
 *  - `id` no aparece en `obras` → error (“no hay datos para este código”).
 *  - `id` encontrado → render de la ficha y título actualizado.
 * Plan B opcional: si durante una migración aún faltan obras en el JSON pero existen
 * `AA-NNNN.html`, descomenta `redirectToLegacyFicha` y úsala en el branch `!obra` (ver abajo).
 */
(function () {
  "use strict";

  function text(str) {
    if (str == null) return "";
    return String(str);
  }

  function getQueryId() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("id") || "").trim();
  }

  function defaultUrls(id) {
    return {
      previsualizacion: "../imagenes/previa/" + id + "prev.jpg",
      ampliacion: "amp_" + id + ".html",
    };
  }

  function mergeUrls(obra) {
    var base = defaultUrls(obra.id);
    if (!obra.urls) return base;
    return {
      previsualizacion: obra.urls.previsualizacion || base.previsualizacion,
      ampliacion: obra.urls.ampliacion || base.ampliacion,
    };
  }

  function el(tag, cls, attrs) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    return node;
  }

  function appendDl(container, pairs) {
    var dl = el("dl", "ficha-larga-dl");
    pairs.forEach(function (p) {
      if (p[1] == null || p[1] === "") return;
      var dt = el("dt", null, { text: p[0] });
      var dd = el("dd", null, { text: p[1] });
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    container.appendChild(dl);
  }

  /**
   * @param {HTMLElement} mount
   * @param {object} obra — registro desde obras.json
   */
  function renderFichaLarga(mount, obra) {
    mount.innerHTML = "";
    var urls = mergeUrls(obra);

    var shell = el("div", "ficha-larga-shell");
    shell.appendChild(el("div", "ficha-larga-shell__rail"));
    var main = el("div", "ficha-larga-shell__main");

    var hdr = el("div", "ficha-larga-header");
    hdr.appendChild(
      el("strong", null, {
        text: "Colección de Grabado / Galería",
      })
    );
    main.appendChild(hdr);

    var card = el("article", "ficha-larga-card");
    card.appendChild(
      el("div", "ficha-larga-card__codigo", { text: obra.id })
    );

    var thumbWrap = el("div", "ficha-larga-card__thumb");
    var link = el("a", null, {
      href: urls.ampliacion,
      target: "_blank",
      title: "Ver ampliación",
    });
    var img = el("img", null, {
      src: urls.previsualizacion,
      alt: "Previsualización de la obra",
    });
    link.appendChild(img);
    thumbWrap.appendChild(link);
    card.appendChild(thumbWrap);

    appendDl(card, [
      ["Título", obra.titulo],
      ["Autor", obra.autor],
      ["Técnica", obra.tecnica],
      ["Edición", obra.edicion],
      [
        "Medidas",
        text(obra.medidas) +
          (obra.unidadMedida ? "\u00a0" + obra.unidadMedida : ""),
      ],
      [
        "Soporte / material",
        text(obra.material) +
          (obra.gramaje ? "\u00a0—\u00a0" + obra.gramaje + "\u00a0gr." : ""),
      ],
      ["Año obra", obra.anioObra],
      ["Año registro", obra.anioRegistro],
    ]);

    if (obra.descripcionIconografica) {
      var desc = el("div", "ficha-larga-bloque-texto");
      desc.textContent = obra.descripcionIconografica;
      card.appendChild(desc);
    }

    appendDl(card, [
      ["Temática", obra.tematica],
      ["Catalogación", obra.catalogacion],
    ]);

    if (
      Array.isArray(obra.estadoConservacionFila) &&
      obra.estadoConservacionFila.length
    ) {
      var row = el("div", "ficha-larga-meta-grid");
      obra.estadoConservacionFila.forEach(function (v) {
        row.appendChild(el("span", null, { text: v }));
      });
      card.appendChild(row);
    }

    appendDl(card, [
      ["Ubicación física", obra.ubicacionFisica],
      [
        "Inventario (tomo / folio)",
        text(obra.inventarioTomo) + " / " + text(obra.inventarioFolio),
      ],
      ["Reproducción", obra.permiteReproduccion],
      ["Publicación", obra.permitePublicacion],
      ["Observaciones", obra.observaciones],
    ]);

    main.appendChild(card);
    shell.appendChild(main);
    shell.appendChild(el("div", "ficha-larga-shell__rail"));

    var foot = el("footer", "ficha-larga-shell__footer");
    foot.innerHTML =
      "<strong>Facultad de Artes - Vicerrectoría de Docencia, Universidad de Antioquia</strong><br />2007. Todos los derechos reservados.";
    shell.appendChild(foot);

    mount.appendChild(shell);
  }

  function findObra(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  /** Mismo patrón que los nombres de ficha estática (ej. 00-0740.html). */
  function isLegacyFichaId(id) {
    return /^\d{2}-\d{4}$/.test(id);
  }

  /* Plan B opcional: redirigir a la ficha HTML antigua si el id aún no está en obras.json.
  function redirectToLegacyFicha(id) {
    window.location.replace(id + ".html");
  }
  */

  function main() {
    var mount = document.getElementById("ficha-larga-root");
    if (!mount) return;

    var id = getQueryId();
    var jsonUrl =
      mount.getAttribute("data-ficha-json") || "data/obras.json";

    if (!id) {
      mount.appendChild(
        el("div", "ficha-larga-error", {
          text: "Falta el parámetro id en la URL (ejemplo: ficha.html?id=00-0740).",
        })
      );
      return;
    }

    if (!isLegacyFichaId(id)) {
      mount.appendChild(
        el("div", "ficha-larga-error", {
          text: "El id no tiene el formato esperado (AA-NNNN: dos dígitos de año y cuatro de registro).",
        })
      );
      return;
    }

    mount.appendChild(
      el("div", "ficha-larga-cargando", { text: "Cargando ficha…" })
    );

    fetch(jsonUrl, { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        mount.innerHTML = "";
        var list = data.obras || [];
        if (!list.length) {
          mount.appendChild(
            el("div", "ficha-larga-error", {
              text: "El catálogo JSON no tiene obras.",
            })
          );
          return;
        }
        var obra = findObra(list, id);
        if (!obra) {
          mount.appendChild(
            el("div", "ficha-larga-error", {
              text:
                "No hay datos en el catálogo para el código " +
                id +
                ". Comprueba que exista en data/obras.json.",
            })
          );
          /* Migración híbrida: si esta obra aún no está en el JSON pero sí como página estática:
          redirectToLegacyFicha(id);
          */
          return;
        }
        document.title =
          obra.id + " · Colección de Grabado - Galería";
        renderFichaLarga(mount, obra);
      })
      .catch(function (e) {
        mount.innerHTML = "";
        mount.appendChild(
          el("div", "ficha-larga-error", {
            text:
              "No se pudo cargar " +
              jsonUrl +
              ": " +
              (e && e.message ? e.message : String(e)),
          })
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
