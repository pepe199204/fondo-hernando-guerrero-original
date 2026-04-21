/**
 * PREV — componente reutilizable (previews).
 * Renderiza una grilla desde `data-prev-json`.
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

  function fetchJson(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function render(root, state) {
    root.innerHTML = "";
    var shell = el("div", "prev-shell");

    if (state.error) {
      shell.appendChild(el("div", "prev-error", { text: state.error }));
      root.appendChild(shell);
      return;
    }

    var galeria = el("div", "prev-galeria", { id: "divGaleria" });
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
      aAmp.appendChild(
        el("img", null, {
          src: "../imagenes/previa/" + id + "prev.jpg",
          alt: "Ver ampliación de imagen",
          name: "imagen",
          id: "imagen",
        })
      );
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

      tMeta.appendChild(row(2, "<strong>" + id + "</strong>"));
      if (obra.titulo) tMeta.appendChild(row(2, "<strong>" + obra.titulo + "</strong>"));
      if (obra.autor) tMeta.appendChild(row(2, obra.autor));

      var trLast = el("tr");
      var tdMed = el("td", "estiloTabla", { width: "133", height: "20" });
      tdMed.innerHTML = (obra.medidas || "") + "<p>&nbsp;</p>";
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
    var root = document.getElementById("divGaleria") || document.getElementById("prev-root");
    if (!root) return;

    var jsonUrl = root.getAttribute("data-prev-json") || "data/prev-10.json";
    root.innerHTML = "";
    root.appendChild(el("div", "prev-loading", { text: "Cargando…"}));

    fetchJson(jsonUrl)
      .then(function (data) {
        var obras = (data && data.obras) || [];
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();

