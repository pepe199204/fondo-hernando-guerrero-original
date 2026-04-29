/**
 * LISTA — componente reutilizable para `lista_todas.html`.
 * Renderiza las filas desde JSON (evita HTML repetido por obra).
 *
 * Por ahora consume `data/prev-10.json` (demo con 10 obras).
 */
(function () {
  "use strict";

  function fetchJson(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function asArrayObras(data) {
    if (!data) return [];
    // soporta:
    // - { obras: [...] } (galeria/data/obras.json, prev-10.json)
    // - [ ... ] (colecciondegrabado/data/gallery/obras.json)
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.obras)) return data.obras;
    return [];
  }

  function indexById(obras) {
    var map = {};
    for (var i = 0; i < obras.length; i++) {
      var o = obras[i];
      if (o && o.id) map[o.id] = o;
    }
    return map;
  }

  function pickMedidas(obra) {
    if (!obra) return "";
    return obra.medidas || obra.dimensiones || "";
  }

  function mergeListItemWithObra(item, obra) {
    // item suele tener {id} (o un subset). obra trae el resto del catálogo.
    var out = { id: item && item.id ? item.id : obra && obra.id ? obra.id : "" };
    out.autor = (obra && obra.autor) || (item && item.autor) || "";
    out.titulo = (obra && obra.titulo) || (item && item.titulo) || "";
    out.medidas = pickMedidas(obra) || (item && item.medidas) || (item && item.dimensiones) || "";
    return out;
  }

  function normStr(s) {
    return (s == null ? "" : String(s)).trim();
  }

  function cmpAlpha(a, b) {
    // Orden: autor ASC, luego título ASC, luego id ASC (estable/consistente).
    // Las obras sin autor se mandan al final (no al principio).
    var aa = normStr(a && a.autor);
    var ba = normStr(b && b.autor);
    if (!aa && ba) return 1;
    if (aa && !ba) return -1;
    var t1 = aa.localeCompare(ba, "es", { sensitivity: "base" });
    if (t1) return t1;

    var at = normStr(a && a.titulo);
    var bt = normStr(b && b.titulo);
    var t2 = at.localeCompare(bt, "es", { sensitivity: "base" });
    if (t2) return t2;

    var ai = normStr(a && a.id);
    var bi = normStr(b && b.id);
    return ai.localeCompare(bi, "es", { sensitivity: "base" });
  }

  function td(html, attrs) {
    var cell = document.createElement("td");
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        cell.setAttribute(k, attrs[k]);
      });
    }
    cell.innerHTML = html;
    return cell;
  }

  function row(obra) {
    var id = obra.id;
    var tr = document.createElement("tr");
    tr.className = "Estilo5";

    var autor = obra.autor && obra.autor.trim()
      ? obra.autor
      : '<em style="opacity:0.7">An\u00f3nimo</em>';
    tr.appendChild(
      td('<font color="#FFFFFF">' + autor + "</font>", {
        width: "28%",
        align: "left",
        valign: "middle",
        style: "border-bottom: 1px solid #AAAAAA",
        class: "estilo10",
      })
    );

    tr.appendChild(
      td(
        '<a class="btn-icono" href="amp.html?id=' +
          encodeURIComponent(id) +
          '" target="_blank" title="Ver obra">' +
          '<img src="images/obra.gif" alt="" width="22" height="16" border="0" />' +
          '<span class="btn-icono__label">Ver obra</span>' +
          "</a>",
        {
          width: "7%",
          align: "center",
          valign: "middle",
          style: "border-bottom: 1px solid #AAAAAA",
          class: "estilo10",
        }
      )
    );

    tr.appendChild(
      td(
        '<a class="btn-icono" href="ficha.html?id=' +
          encodeURIComponent(id) +
          '" target="_blank" title="Ver ficha">' +
          '<img src="images/obra_amp.gif" alt="" width="22" height="16" border="0" />' +
          '<span class="btn-icono__label">Ver ficha</span>' +
          "</a>",
        {
          width: "7%",
          align: "center",
          valign: "middle",
          style: "border-bottom: 1px solid #AAAAAA",
          class: "estilo10",
        }
      )
    );

    tr.appendChild(
      td('<font color="#FFFFFF">' + (obra.titulo || "") + "</font>", {
        width: "32%",
        align: "left",
        valign: "middle",
        style: "border-bottom: 1px solid #AAAAAA",
        class: "estilo10",
      })
    );

    tr.appendChild(
      td('<font color="#FFFFFF">' + (obra.medidas || "") + "</font>", {
        align: "left",
        valign: "middle",
        style: "border-bottom: 1px solid #AAAAAA",
        class: "estilo10",
      })
    );

    return tr;
  }

  function main() {
    var body = document.getElementById("lista-body");
    if (!body) return;
    var url = body.getAttribute("data-lista-json") || "";
    var obrasUrl = body.getAttribute("data-obras-json") || "";

    // Si queremos "todas las obras", basta con definir `data-obras-json`.
    // En ese caso, usamos ese mismo JSON como fuente principal.
    if (!url && obrasUrl) url = obrasUrl;

    // Fallbacks legacy (demo)
    if (!url) url = "data/prev-10.json";
    if (!obrasUrl) obrasUrl = url;

    Promise.all([fetchJson(url), fetchJson(obrasUrl)])
      .then(function (arr) {
        var listData = arr[0];
        var obrasData = arr[1];

        var list = asArrayObras(listData);
        var obras = asArrayObras(obrasData);
        var byId = indexById(obras);

        body.innerHTML = "";

        var rows = [];

        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          var id = item && item.id ? item.id : "";
          var obra = id && byId[id] ? byId[id] : null;
          rows.push(mergeListItemWithObra(item, obra));
        }

        // Si la "lista" viene vacía, mostramos todo el catálogo
        if (!rows.length && obras.length) rows = obras.slice();

        rows.sort(cmpAlpha);
        for (var j = 0; j < rows.length; j++) body.appendChild(row(rows[j]));
      })
      .catch(function (e) {
        body.innerHTML =
          '<tr class="Estilo5"><td colspan="5" style="color:#fff; font-family:Verdana, Arial, Helvetica, sans-serif; font-size:12px;">' +
          "No se pudo cargar " +
          url +
          " / " +
          obrasUrl +
          ": " +
          (e && e.message ? e.message : String(e)) +
          "</td></tr>";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();

