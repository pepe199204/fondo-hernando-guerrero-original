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
      ampliacion: "amp.html?id=" + encodeURIComponent(id),
    };
  }

  function mergeUrls(obra) {
    var base = defaultUrls(obra.id);

    // catálogo chico (galeria/data/obras.json)
    if (obra.urls) {
      // Importante: ignoramos `obra.urls.ampliacion` aunque venga, porque suele
      // apuntar a páginas legacy `amp_AA-NNNN.html` que ya no existen.
      // Siempre usamos la URL canónica `amp.html?id=AA-NNNN`.
      return {
        previsualizacion: obra.urls.previsualizacion || base.previsualizacion,
        ampliacion: base.ampliacion,
      };
    }

    // catálogo grande (colecciondegrabado/data/gallery/obras.json)
    // no existe "previa"; usamos la imagen baja como thumbnail.
    if (obra.imagenBaja) base.previsualizacion = obra.imagenBaja;
    return base;
  }

  function mergeObra(primary, extra) {
    if (!extra) return primary;
    var out = {};
    Object.keys(extra).forEach(function (k) {
      out[k] = extra[k];
    });
    Object.keys(primary).forEach(function (k2) {
      if (primary[k2] != null && primary[k2] !== "") out[k2] = primary[k2];
    });
    if (extra.urls || primary.urls) {
      out.urls = {};
      if (extra.urls) {
        Object.keys(extra.urls).forEach(function (k3) {
          out.urls[k3] = extra.urls[k3];
        });
      }
      if (primary.urls) {
        Object.keys(primary.urls).forEach(function (k4) {
          if (primary.urls[k4] != null && primary.urls[k4] !== "")
            out.urls[k4] = primary.urls[k4];
        });
      }
    }
    return out;
  }

  function safeArray(data) {
    if (!data) return [];
    return Array.isArray(data) ? data : data.obras || [];
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

  function valOrNA(v) {
    return v == null || v === "" ? "No disponible" : v;
  }

  /**
   * @param {HTMLElement} mount
   * @param {object} obra — registro desde obras.json
   */
  function renderFichaLarga(mount, obra) {
    mount.innerHTML = "";
    var urls = mergeUrls(obra);
    var medidas = obra.medidas || obra.dimensiones || "";
    var anioObra = obra.anioObra || obra.ano || "";

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
    card.appendChild(el("div", "ficha-larga-section-title", { text: "FICHA DE LA OBRA" }));
    card.appendChild(el("div", "ficha-larga-card__codigo", { text: obra.id }));

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

    // Escala el thumbnail para que se vea más grande (upscale controlado).
    img.className = "ficha-larga-thumb-img";
    img.addEventListener("load", function () {
      var box = thumbWrap;
      if (!box || !img.naturalWidth || !img.naturalHeight) return;
      var bw = box.clientWidth || 0;
      var bh = box.clientHeight || 0;
      if (!bw || !bh) return;
      var maxUpscale = 1.35;
      var scale = Math.min(bw / img.naturalWidth, bh / img.naturalHeight, maxUpscale);
      img.style.width = Math.round(img.naturalWidth * scale) + "px";
      img.style.height = Math.round(img.naturalHeight * scale) + "px";
    });

    card.appendChild(el("div", "ficha-larga-section-title", { text: "FICHA TÉCNICA" }));
    appendDl(card, [
      ["Título", obra.titulo],
      ["Autor", obra.autor],
      ["Técnica", obra.tecnica],
      ["Edición", obra.edicion],
      [
        "Medidas",
        text(medidas) +
          (obra.unidadMedida ? "\u00a0" + obra.unidadMedida : ""),
      ],
      [
        "Soporte / material",
        text(obra.material) +
          (obra.gramaje ? "\u00a0—\u00a0" + obra.gramaje + "\u00a0gr." : ""),
      ],
      ["Año obra", anioObra],
      ["Año registro", obra.anioRegistro],
    ]);

    var descText = obra.descripcionIconografica || obra.textoHermeneutico || "";
    if (descText) {
      card.appendChild(el("div", "ficha-larga-section-title", { text: "ANÁLISIS DE OBRA" }));
      card.appendChild(
        el("div", "ficha-larga-subtitle", { text: "Análisis pre-iconográfico:" })
      );
      var desc = el("div", "ficha-larga-bloque-texto");
      desc.textContent = descText;
      card.appendChild(desc);

      // Temática y enlace a análisis estético viven aquí (como en el original)
      var tema = obra.tematica || "No disponible";
      var hermHref = "herm.html?id=" + encodeURIComponent(obra.id);
      var row2 = el("div", "ficha-larga-analysis-row");
      row2.innerHTML =
        '<span class="ficha-larga-analysis-row__left"><strong>Temática:</strong> ' +
        text(tema) +
        '</span><span class="ficha-larga-analysis-row__right"><strong>Ver análisis estético:</strong> <a href="' +
        hermHref +
        '" target="_blank" title="Ver análisis estético"><img src="images/analisis.gif" width="22" height="16" border="0" alt="Ver análisis estético" /></a></span>';
      card.appendChild(row2);
    }

    card.appendChild(el("div", "ficha-larga-section-title", { text: "DATOS ADICIONALES DE LA OBRA" }));
    appendDl(card, [
      [
        "Estado de la obra",
        valOrNA(
          Array.isArray(obra.estadoConservacionFila) ? obra.estadoConservacionFila[0] : ""
        ),
      ],
      [
        "Para restauración",
        valOrNA(
          Array.isArray(obra.estadoConservacionFila) ? obra.estadoConservacionFila[1] : ""
        ),
      ],
      ["Ubicación", valOrNA(obra.ubicacionFisica)],
      ["Planoteca", valOrNA(obra.inventarioTomo)],
      ["Carpeta", valOrNA(obra.inventarioFolio)],
      ["Registro Análogo", valOrNA(obra.permiteReproduccion)],
      ["Registro Digital", valOrNA(obra.permitePublicacion)],
    ]);

    card.appendChild(
      el("div", "ficha-larga-section-title", { text: "DATOS ADICIONALES DEL ARTISTA" })
    );
    // En el catálogo grande no siempre existe esta información.
    // Usamos `observaciones` si viene del catálogo chico; si no, mostramos "No disponible".
    appendDl(card, [["Tipo de vinculación", obra.observaciones || "No disponible"]]);

    main.appendChild(card);
    shell.appendChild(main);
    shell.appendChild(el("div", "ficha-larga-shell__rail"));

    var foot = el("footer", "ficha-larga-shell__footer");
    foot.innerHTML =
      "<strong>Facultad de Artes - Vicerrectoría de Docencia, Universidad de Antioquia</strong><br />2026. Todos los derechos reservados.";
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
      mount.getAttribute("data-ficha-json") || "../../data/gallery/obras.json";
    var extraUrl = mount.getAttribute("data-ficha-extra-json") || "";

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

    Promise.all([
      fetch(jsonUrl, { credentials: "same-origin" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }),
      extraUrl
        ? fetch(extraUrl, { credentials: "same-origin" })
            .then(function (r2) {
              if (!r2.ok) throw new Error("HTTP " + r2.status);
              return r2.json();
            })
            .catch(function () {
              return null;
            })
        : Promise.resolve(null),
    ])
      .then(function (arr) {
        mount.innerHTML = "";
        var data = arr[0];
        var extraData = arr[1];

        var list = safeArray(data);
        if (!list.length) {
          mount.appendChild(
            el("div", "ficha-larga-error", {
              text: "El catálogo JSON no tiene obras.",
            })
          );
          return;
        }

        var obra = findObra(list, id);
        var extraObra = extraData ? findObra(safeArray(extraData), id) : null;
        if (obra) obra = mergeObra(obra, extraObra);

        if (!obra) {
          mount.appendChild(
            el("div", "ficha-larga-error", {
              text:
                "No hay datos en el catálogo para el código " +
                id +
                ". Comprueba que exista en el catálogo JSON.",
            })
          );
          return;
        }

        document.title = obra.id + " · Colección de Grabado - Galería";
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
