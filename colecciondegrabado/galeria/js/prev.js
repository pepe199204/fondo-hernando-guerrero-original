/**
 * PREV — componente reutilizable (previews).
 * Renderiza una grilla desde `data-prev-json`.
 */
(function () {
  "use strict";

  function asArrayObras(data) {
    if (!data) return [];
    // soporta:
    // - { obras: [...] } (prev-10.json)
    // - [ ... ] (colecciondegrabado/data/gallery/obras.json)
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.obras)) return data.obras;
    return [];
  }

  function pickMedidas(obra) {
    if (!obra) return "";
    return obra.medidas || obra.dimensiones || "";
  }

  function normStr(s) {
    return (s == null ? "" : String(s)).trim();
  }

  function cmpAlpha(a, b) {
    var aa = normStr(a && a.autor);
    var ba = normStr(b && b.autor);
    var t1 = aa.localeCompare(ba, "es", { sensitivity: "base" });
    if (t1) return t1;
    var at = normStr(a && a.titulo);
    var bt = normStr(b && b.titulo);
    var t2 = at.localeCompare(bt, "es", { sensitivity: "base" });
    if (t2) return t2;
    return normStr(a && a.id).localeCompare(normStr(b && b.id), "es", {
      sensitivity: "base",
    });
  }

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

  function fetchJson(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(root, state) {
    root.innerHTML = "";
    var shell = el("div", "prev-shell");

    if (state.error) {
      shell.appendChild(el("div", "prev-error", { text: state.error }));
      root.appendChild(shell);
      return;
    }

    // No repetir id="divGaleria" dentro del propio contenedor
    var galeria = el("div", "prev-galeria");
    for (var i = 0; i < state.obras.length; i++) {
      var obra = state.obras[i] || {};
      var id = obra.id;

      var wrap = el("div", "prev-item", { id: "prev_" + id });

      // Tabla de imagen (como legacy)
      var tImg = el("table", null, {
        width: "160",
        height: "130",
        border: "1",
        align: "center",
        cellpadding: "0",
        cellspacing: "0",
        bordercolor: "#003366",
      });
      var trImg = el("tr");
      var tdImg = el("td", null, { align: "center", valign: "middle" });
      var aAmp = el("a", null, {
        href: "amp.html?id=" + encodeURIComponent(id),
        target: "_blank",
      });
      // Thumbnail legacy: preferimos `previa/{id}prev.jpg` (se ve como el original).
      // Si no existe, hacemos fallback a `imagenBaja` del catálogo grande.
      var imgPrev = el("img", null, {
        src: "../imagenes/previa/" + id + "prev.jpg",
        alt: "Ver ampliación de imagen",
        name: "imagen",
        id: "imagen",
      });
      // Mantener el look: la imagen no debe “romper” la tarjeta 160x130.
      imgPrev.style.maxWidth = "150px";
      imgPrev.style.maxHeight = "120px";
      imgPrev.style.height = "auto";
      imgPrev.style.width = "auto";
      imgPrev.onerror = function () {
        if (obra && obra.imagenBaja && imgPrev.src.indexOf("imagenes/baja/") === -1) {
          imgPrev.src = obra.imagenBaja;
        }
      };
      aAmp.appendChild(imgPrev);
      tdImg.appendChild(aAmp);
      trImg.appendChild(tdImg);
      tImg.appendChild(trImg);
      wrap.appendChild(tImg);

      // Tabla de datos (como legacy)
      var tMeta = el("table", "estiloTabla", {
        width: "160",
        height: "60",
        border: "0",
        align: "center",
        cellpadding: "0",
        cellspacing: "0",
      });

      function row(colspan, html) {
        var tr = el("tr");
        var td = el("td", "estiloTabla", { height: "20", colspan: String(colspan || 2) });
        td.innerHTML = html;
        tr.appendChild(td);
        return tr;
      }

      tMeta.appendChild(row(2, "<strong>" + esc(id) + "</strong>"));
      if (obra.titulo) tMeta.appendChild(row(2, "<strong>" + esc(obra.titulo) + "</strong>"));
      if (obra.autor) tMeta.appendChild(row(2, esc(obra.autor)));

      var trLast = el("tr");
      var tdMed = el("td", "estiloTabla", { width: "133", height: "20" });
      tdMed.innerHTML = esc(pickMedidas(obra)) + "<p>&nbsp;</p>";
      var tdBtn = el("td", "estiloTabla", { width: "27", align: "right", valign: "top" });
      var aFicha = el("a", null, {
        href: "ficha.html?id=" + encodeURIComponent(id),
        target: "_blank",
      });
      aFicha.appendChild(
        el("img", null, {
          src: "images/obra_amp.gif",
          alt: "Ver detalles",
          width: "22",
          height: "16",
          border: "0",
        })
      );
      tdBtn.appendChild(aFicha);
      trLast.appendChild(tdMed);
      trLast.appendChild(tdBtn);
      tMeta.appendChild(trLast);

      wrap.appendChild(tMeta);
      galeria.appendChild(wrap);
    }
    shell.appendChild(galeria);
    root.appendChild(shell);
  }

  function main() {
    var root =
      document.getElementById("divGaleria") || document.getElementById("prev-root");
    if (!root) return;

    try {
      var jsonUrl = root.getAttribute("data-prev-json") || "data/prev-10.json";
      root.innerHTML = "";
      root.appendChild(el("div", "prev-loading", { text: "Cargando…" }));

      fetchJson(jsonUrl)
        .then(function (data) {
          var obras = asArrayObras(data);
          obras.sort(cmpAlpha);
          render(root, { obras: obras });
        })
        .catch(function (e) {
          render(root, {
            error:
              "No se pudo cargar " +
              jsonUrl +
              ": " +
              (e && e.message ? e.message : String(e)),
          });
        });
    } catch (e2) {
      render(root, {
        error:
          "Error inesperado al inicializar la galería: " +
          (e2 && e2.message ? e2.message : String(e2)),
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();

