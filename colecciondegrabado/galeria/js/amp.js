/**
 * AMP — componente reutilizable (ampliación).
 * URL: amp.html?id=AA-NNNN
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

  function media(id) {
    return {
      low: "../imagenes/baja/" + id + "lo.jpg",
      high: "../imagenes/alta/" + id + "hi.jpg",
      herm: "herm.html?id=" + encodeURIComponent(id),
      ficha: "ficha.html?id=" + encodeURIComponent(id),
      externo: "",
    };
  }

  function mergeMedia(id, obra) {
    var m = media(id);
    if (!obra) return m;

    // Catálogo "nuevo" (galeria/data/obras.json)
    if (obra.urls) {
      if (obra.urls.baja) m.low = obra.urls.baja;
      if (obra.urls.alta) m.high = obra.urls.alta;
    }

    // Catálogo grande (colecciondegrabado/data/gallery/obras.json)
    if (obra.imagenBaja) m.low = obra.imagenBaja;
    if (obra.imagenAlta) m.high = obra.imagenAlta;

    // Enlace a análisis temático externo (presente en algunos registros)
    if (obra.enlaceExterno && obra.enlaceExterno.trim()) {
      m.externo = obra.enlaceExterno.trim();
    }
    return m;
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
      '<table class="amp-outer" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#F4F5FD">' +
      '<tr>' +
      '<td width="800" height="400" align="center" valign="middle" bgcolor="F4F5FD" class="Estilo3">' +
      '<table class="amp-media" border="0" cellpadding="0" cellspacing="0" bordercolor="#CCCCCC" bgcolor="#F4F5FD">' +
      "<tr>" +
      '<td align="center" valign="middle" bgcolor="#F4F5FD">' +
      '<img class="amp-img" src="' +
      esc(ctx.media.low) +
      '" name="imgA" border="0" id="imgA" />' +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      '<tr>' +
      '<td height="100" align="center" valign="middle" bgcolor="#000033">' +
      '<table width="95%" border="0" cellpadding="0" cellspacing="0">' +
      '<tr align="left" valign="middle" class="Estilo2">' +
      '<td height="15" colspan="2" class="Estilo2"><strong>' +
      esc(ctx.title) +
      "</strong></td>" +
      "</tr>" +
      '<tr><td height="15" colspan="2" align="right" valign="middle"><div align="left"><span class="Estilo2">' +
      esc(ctx.tecnica) +
      "</span></div></td></tr>" +
      '<tr><td width="29%" height="15" align="right" valign="middle"><div align="left"><span class="Estilo2">' +
      esc(ctx.medidas) +
      '</span></div></td><td width="70%" height="15" align="right" valign="middle"><div align="left" class="Estilo2"><span class="Estilo6">Edici&oacute;n </span>' +
      esc(ctx.edicion) +
      "</div></td></tr>" +
      '<tr><td height="7" colspan="2" align="right" valign="middle"><div align="left" class="Estilo2"><span class="Estilo6">A&ntilde;o</span> ' +
      esc(ctx.anio) +
      "</div></td></tr>" +
      '<tr><td height="7" colspan="2" align="right" valign="middle"><div align="left" class="Estilo2"><span class="Estilo6">Tem&aacute;tica</span> ' +
      esc(ctx.tematica) +
      "</div></td></tr>" +
      '<tr><td height="8" colspan="2" align="right" valign="middle"><hr /></td></tr>' +
      "</table>" +
      '<table width="95%" border="0" cellspacing="0" cellpadding="0">' +
      "<tr>" +
      '<td width="' + (ctx.media.externo ? "46" : "60") + '%" height="15">&nbsp;</td>' +
      '<td width="14%" align="center" valign="middle"><a class="btn-icono" href="' +
      esc(ctx.media.high) +
      '" target="_blank" title="Imagen original"><img src="images/obra_amp.gif" alt="" width="22" height="16" border="0" /><span class="btn-icono__label">Imagen original</span></a></td>' +
      '<td width="14%" height="15" align="center" valign="middle">' +
      '<a class="btn-icono" href="' +
      esc(ctx.media.herm) +
      '" target="_self" title="An&aacute;lisis est&eacute;tico"><img src="images/analisis.gif" alt="" width="22" height="16" border="0" /><span class="btn-icono__label">An&aacute;lisis est&eacute;tico</span></a>' +
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
      "</td>" +
      "</tr>" +
      "</table>";

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
        // espera un frame por si el layout aún no midió bien
        window.requestAnimationFrame(fitOnce);
      });
      window.addEventListener("resize", function () {
        window.requestAnimationFrame(fitOnce);
      });
      if (img.complete) window.requestAnimationFrame(fitOnce);
    }
  }

  function main() {
    var root = document.getElementById("amp-root");
    if (!root) return;

    var id = getQueryId();
    var obrasUrl = root.getAttribute("data-obras-json") || "../../data/gallery/obras.json";

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

    root.innerHTML =
      '<div style="width:800px;margin:20px auto;color:#fff;font-family:Verdana, Arial, Helvetica, sans-serif;font-size:12px;">Cargando...</div>';

    fetchJson(obrasUrl)
      .then(function (data) {
        var list = Array.isArray(data)
          ? data
          : (data && data.obras) || [];
        var obra = findById(list, id);

        var titulo = obra && obra.titulo ? obra.titulo : "Sin t\u00edtulo";
        var autor = obra && obra.autor ? obra.autor : "";
        var tecnica = obra && obra.tecnica ? obra.tecnica : "";
        var medidas = "";
        if (obra) {
          medidas = obra.medidas || obra.dimensiones || "";
        }
        var edicion = obra && obra.edicion ? obra.edicion : "";
        var anio =
          (obra && (obra.anioObra || obra.ano)) ? (obra.anioObra || obra.ano) : "";
        var tematica = obra && obra.tematica ? obra.tematica : "No disponible";

        document.title = "Galer\u00eda - Colecci\u00f3n de Grabado";
        render(root, {
          media: mergeMedia(id, obra),
          title: (titulo || "Sin t\u00edtulo") + (autor ? ", " + autor : ""),
          tecnica: tecnica,
          medidas: medidas,
          edicion: edicion,
          anio: anio,
          tematica: tematica,
        });
      })
      .catch(function () {
        // Si el catálogo aún no está listo, igual mostramos la ampliación por convención de rutas.
        document.title = "Galer\u00eda - Colecci\u00f3n de Grabado";
        render(root, {
          media: media(id),
          title: id,
          tecnica: "",
          medidas: "",
          edicion: "",
          anio: "",
          tematica: "No disponible",
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();

