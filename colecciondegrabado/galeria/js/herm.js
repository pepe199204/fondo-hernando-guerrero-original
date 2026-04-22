/**
 * HERM — componente reutilizable (análisis).
 * URL: herm.html?id=AA-NNNN
 *
 * Nota: `data/herm.json` se irá completando gradualmente con los análisis.
 */
(function () {
  "use strict";

  function el(tag, cls, attrs) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    return node;
  }

  function getQueryId() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("id") || "").trim();
  }

  function isLegacyId(id) {
    return /^\d{2}-\d{4}$/.test(id);
  }

  function defaultMedia(id) {
    return {
      low: "../imagenes/baja/" + id + "lo.jpg",
      high: "../imagenes/alta/" + id + "hi.jpg",
      backToAmp: "amp.html?id=" + encodeURIComponent(id),
    };
  }

  function mergeMedia(id, obra) {
    var m = defaultMedia(id);
    if (!obra || !obra.urls) return m;
    if (obra.urls.baja) m.low = obra.urls.baja;
    if (obra.urls.alta) m.high = obra.urls.alta;
    return m;
  }

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function fetchJson(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function render(root, ctx) {
    root.innerHTML = "";
    var shell = el("div", "herm-shell");

    if (ctx.error) {
      shell.appendChild(el("div", "herm-error", { text: ctx.error }));
      root.appendChild(shell);
      return;
    }

    var card = el("div", "herm-card");
    var header = el("div", "herm-header");
    header.appendChild(
      el("div", "herm-header__title", { text: "Análisis (HERM)" })
    );
    header.appendChild(el("div", "herm-header__code", { text: ctx.id }));
    card.appendChild(header);

    if (ctx.subtitle || (ctx.metaRows && ctx.metaRows.length)) {
      var metaBox = el("div", "herm-bodytext");
      if (ctx.subtitle) {
        var strong = document.createElement("strong");
        strong.textContent = ctx.subtitle;
        metaBox.appendChild(strong);
        metaBox.appendChild(document.createElement("br"));
      }
      if (ctx.metaRows && ctx.metaRows.length) {
        for (var i = 0; i < ctx.metaRows.length; i++) {
          metaBox.appendChild(document.createTextNode(ctx.metaRows[i]));
          metaBox.appendChild(document.createElement("br"));
        }
      }
      card.appendChild(metaBox);
    }

    var media = el("div", "herm-media");
    var aHigh = el("a", null, {
      href: ctx.media.high,
      target: "_blank",
      title: "Abrir imagen en alta",
    });
    aHigh.appendChild(
      el("img", null, {
        src: ctx.media.low,
        alt: "Imagen de la obra (baja)",
      })
    );
    media.appendChild(aHigh);
    card.appendChild(media);

    var body = el("div", "herm-bodytext");
    body.textContent = ctx.texto;
    card.appendChild(body);

    var actions = el("div", "herm-actions");
    actions.appendChild(
      el("a", null, { href: ctx.media.high, target: "_blank", text: "Alta" })
    );
    actions.appendChild(
      el("a", null, { href: ctx.media.backToAmp, text: "Volver a ampliación" })
    );
    actions.appendChild(
      el("a", null, { href: "ficha.html?id=" + encodeURIComponent(ctx.id), text: "Ver ficha" })
    );
    card.appendChild(actions);

    if (ctx.note) card.appendChild(el("div", "herm-note", { text: ctx.note }));

    shell.appendChild(card);
    root.appendChild(shell);
  }

  function main() {
    var root = document.getElementById("herm-root");
    if (!root) return;

    var id = getQueryId();
    var obrasUrl = root.getAttribute("data-obras-json") || "data/obras.json";
    var hermUrl = root.getAttribute("data-herm-json") || "data/herm.json";

    if (!id) {
      render(root, {
        error: "Falta el parámetro id (ejemplo: herm.html?id=99-0623).",
      });
      return;
    }
    if (!isLegacyId(id)) {
      render(root, { error: "El id no tiene el formato AA-NNNN." });
      return;
    }

    root.innerHTML = "";
    root.appendChild(el("div", "herm-loading", { text: "Cargando análisis…" }));

    Promise.all([
      fetchJson(hermUrl).catch(function () {
        return { analisis: [] };
      }),
      fetchJson(obrasUrl).catch(function () {
        return { obras: [] };
      }),
    ])
      .then(function (arr) {
        var hermData = arr[0] || {};
        var obrasData = arr[1] || {};
        var item = findById(hermData.analisis || [], id);
        var obra = findById(obrasData.obras || [], id);

        var subtitle = "";
        var metaRows = [];
        if (obra) {
          subtitle = (obra.titulo || "Sin título") + (obra.autor ? " · " + obra.autor : "");
          if (obra.tecnica) metaRows.push(obra.tecnica);
          if (obra.medidas) {
            metaRows.push(
              obra.medidas + (obra.unidadMedida ? " " + obra.unidadMedida : "")
            );
          }
          if (obra.edicion) metaRows.push("Edición: " + obra.edicion);
          if (obra.anioObra) metaRows.push("Año: " + obra.anioObra);
          if (obra.tematica) metaRows.push("Temática: " + obra.tematica);
        }

        var texto =
          (item && item.texto) ||
          (obra && obra.descripcionIconografica) ||
          "Análisis no disponible todavía para este código.";

        var note = !item
          ? "Nota: completa data/herm.json para añadir el análisis de esta obra."
          : "";

        render(root, {
          id: id,
          texto: texto,
          media: mergeMedia(id, obra),
          subtitle: subtitle,
          metaRows: metaRows,
          note: note,
        });
      })
      .catch(function (e) {
        render(root, {
          error:
            "No se pudo cargar el análisis: " +
            (e && e.message ? e.message : String(e)),
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();

