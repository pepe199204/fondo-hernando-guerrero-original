/**
 * AMP — componente reutilizable (ampliación).
 * URL: amp.html?id=AA-NNNN
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

  function media(id) {
    return {
      low: "../imagenes/baja/" + id + "lo.jpg",
      high: "../imagenes/alta/" + id + "hi.jpg",
      herm: "herm.html?id=" + encodeURIComponent(id),
      ficha: "ficha.html?id=" + encodeURIComponent(id),
    };
  }

  function fetchJson(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function render(root, ctx) {
    root.innerHTML = "";
    var shell = el("div", "amp-shell");

    if (ctx.error) {
      shell.appendChild(el("div", "amp-error", { text: ctx.error }));
      root.appendChild(shell);
      return;
    }

    var card = el("div", "amp-card");

    var m = el("div", "amp-media");
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
    m.appendChild(aHigh);
    card.appendChild(m);

    var meta = el("div", "amp-meta");
    meta.appendChild(el("div", "amp-meta__title", { text: ctx.title }));
    if (ctx.rows && ctx.rows.length) {
      for (var i = 0; i < ctx.rows.length; i++) {
        meta.appendChild(el("div", "amp-meta__row", { text: ctx.rows[i] }));
      }
    }
    card.appendChild(meta);

    var actions = el("div", "amp-actions");
    actions.appendChild(
      el("a", null, { href: ctx.media.high, target: "_blank", text: "Alta" })
    );
    actions.appendChild(el("a", null, { href: ctx.media.herm, text: "HERM" }));
    actions.appendChild(
      el("a", null, { href: ctx.media.ficha, text: "Ficha" })
    );
    card.appendChild(actions);

    shell.appendChild(card);
    root.appendChild(shell);
  }

  function main() {
    var root = document.getElementById("amp-root");
    if (!root) return;

    var id = getQueryId();
    var obrasUrl = root.getAttribute("data-obras-json") || "data/obras.json";

    if (!id) {
      render(root, {
        error: "Falta el parámetro id (ejemplo: amp.html?id=00-0751).",
      });
      return;
    }
    if (!isLegacyId(id)) {
      render(root, { error: "El id no tiene el formato AA-NNNN." });
      return;
    }

    root.innerHTML = "";
    root.appendChild(el("div", "amp-loading", { text: "Cargando…" }));

    fetchJson(obrasUrl)
      .then(function (data) {
        var obra = findById((data && data.obras) || [], id);
        var title;
        var rows = [];

        if (obra) {
          title = (obra.titulo || "Sin título") + (obra.autor ? " · " + obra.autor : "");
          if (obra.tecnica) rows.push(obra.tecnica);
          if (obra.medidas) {
            rows.push(
              obra.medidas + (obra.unidadMedida ? " " + obra.unidadMedida : "")
            );
          }
          if (obra.edicion) rows.push("Edición: " + obra.edicion);
          if (obra.anioObra) rows.push("Año: " + obra.anioObra);
          if (obra.tematica) rows.push("Temática: " + obra.tematica);
        } else {
          title = id;
          rows.push("Información no disponible en el catálogo.");
        }

        document.title = id + " · Ampliación";
        render(root, { media: media(id), title: title, rows: rows });
      })
      .catch(function () {
        // Si el catálogo aún no está listo, igual mostramos la ampliación por convención de rutas.
        document.title = id + " · Ampliación";
        render(root, {
          media: media(id),
          title: id,
          rows: ["Catálogo no disponible; mostrando imagen por convención de rutas."],
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();

