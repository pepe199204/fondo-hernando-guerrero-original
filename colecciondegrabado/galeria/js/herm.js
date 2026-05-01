/**
 * HERM — componente reutilizable (análisis) con layout legacy.
 * URL: herm.html?id=AA-NNNN
 */
(function () {
  "use strict";

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
      externo: "",
    };
  }

  function mergeMedia(id, obra) {
    var m = defaultMedia(id);
    if (!obra) return m;

    // catálogo chico (galeria/data/obras.json)
    if (obra.urls) {
      if (obra.urls.baja) m.low = obra.urls.baja;
      if (obra.urls.alta) m.high = obra.urls.alta;
    }

    // catálogo grande (colecciondegrabado/data/gallery/obras.json)
    if (obra.imagenBaja) m.low = obra.imagenBaja;
    if (obra.imagenAlta) m.high = obra.imagenAlta;

    // Enlace a análisis temático externo
    if (obra.enlaceExterno && obra.enlaceExterno.trim()) {
      m.externo = obra.enlaceExterno.trim();
    }
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

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(root, ctx) {
    if (ctx.error) {
      root.innerHTML =
        '<div style="width:800px;margin:20px auto;color:#fff;font-family:Verdana, Arial, Helvetica, sans-serif;font-size:12px;">' +
        esc(ctx.error) +
        "</div>";
      return;
    }

    root.innerHTML =
      '<table class="herm-outer" width="800" height="600" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF">' +
      '<tr>' +
      '<td align="center" valign="middle" bgcolor="#F4F5FD" class="Estilo3 herm-media-cell">' +
      '<table class="herm-media" width="640" height="480" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF">' +
      "<tr>" +
      '<td align="center" valign="middle" bgcolor="#F4F5FD">' +
      '<img class="herm-img" src="' +
      esc(ctx.media.low) +
      '" name="imgA" border="0" id="imgA" />' +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      '<tr>' +
      '<td height="100" align="center" valign="top" bgcolor="#000033" class="herm-footer-cell"><div class="herm-footer-inner">' +
      '<table width="90%" border="0" cellpadding="0" cellspacing="0">' +
      "<tr>" +
      '<td height="7" colspan="5" align="center" valign="middle"><div align="justify"><span class="Estilo2"><br />' +
      esc(ctx.texto) +
      "<br /></span></div></td>" +
      "</tr>" +
      '<tr><td height="8" colspan="5" align="center" valign="middle"><hr /></td></tr>' +
      "<tr>" +
      '<td width="' + (ctx.media.externo ? "44" : "58") + '%" height="15">&nbsp;</td>' +
      '<td width="14%" align="center" valign="middle"><a class="btn-icono" href="' +
      esc(ctx.media.high) +
      '" target="_blank" title="Imagen original"><img src="images/obra_amp.gif" alt="" width="22" height="16" border="0" /><span class="btn-icono__label">Imagen original</span></a></td>' +
      '<td width="14%" height="15" align="center" valign="middle">' +
      '<a class="btn-icono" href="' +
      esc(ctx.media.backToAmp) +
      '" target="_self" title="Volver a la obra"><img src="images/analisis.gif" alt="" width="22" height="16" border="0" /><span class="btn-icono__label">Volver a la obra</span></a>' +
      "</td>" +
      (ctx.media.externo
        ? '<td width="14%" height="15" align="center" valign="middle">' +
          '<a class="btn-icono" href="' + esc(ctx.media.externo) + '" target="_blank" title="An&aacute;lisis tem&aacute;tico">' +
          '<img src="images/obra.gif" alt="" width="22" height="16" border="0" />' +
          '<span class="btn-icono__label">An&aacute;lisis tem&aacute;tico</span>' +
          "</a></td>"
        : "") +
      "</tr>" +
      "</table>" +
      "</div></td>" +
      "</tr>" +
      "</table>" +
      '<map name="Map" id="Map">' +
      '  <area shape="rect" coords="0,1,21,15" href="javascript:close();" />' +
      "</map>";

    // Ajuste de tamaño de imagen dentro del marco.
    // Regla: puede agrandar un poco (upscale controlado), pero nunca más de 1.35x.
    var img = document.getElementById("imgA");
    if (img) {
      var fitOnce = function () {
        var box = img.parentNode;
        if (!box || !img.naturalWidth || !img.naturalHeight) return;
        var bw = box.clientWidth || 0;
        var bh = box.clientHeight || 0;
        if (!bw || !bh) return;

        var maxUpscale = 1.35;
        var scale = Math.min(bw / img.naturalWidth, bh / img.naturalHeight, maxUpscale);
        img.style.width = Math.round(img.naturalWidth * scale) + "px";
        img.style.height = Math.round(img.naturalHeight * scale) + "px";
      };

      img.addEventListener("load", function () {
        window.requestAnimationFrame(fitOnce);
      });
      window.addEventListener("resize", function () {
        window.requestAnimationFrame(fitOnce);
      });
      if (img.complete) window.requestAnimationFrame(fitOnce);
    }
  }

  function main() {
    var root = document.getElementById("herm-root");
    if (!root) return;

    var id = getQueryId();
    var obrasUrl = root.getAttribute("data-obras-json") || "../../data/gallery/obras.json";
    var hermUrl = root.getAttribute("data-herm-json") || "../../data/gallery/herm.json";

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
    root.innerHTML =
      '<div style="width:800px;margin:20px auto;color:#fff;font-family:Verdana, Arial, Helvetica, sans-serif;font-size:12px;">Cargando...</div>';

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
        var obraList = Array.isArray(obrasData) ? obrasData : obrasData.obras || [];
        var obra = findById(obraList, id);

        var texto =
          (item && item.texto) ||
          (obra && (obra.textoHermeneutico || obra.descripcionIconografica)) ||
          "Análisis no disponible todavía para este código.";

        render(root, {
          id: id,
          texto: texto,
          media: mergeMedia(id, obra),
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

