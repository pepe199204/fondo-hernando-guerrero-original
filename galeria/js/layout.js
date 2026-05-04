/**
 * layout.js
 * Colección de Grabado – Facultad de Artes, Universidad de Antioquia
 *
 * Inyecta los bloques compartidos del layout (sidebar, topnav, right-col)
 * en los placeholders de cada página, y gestiona:
 *   • Menú hamburguesa con drawer + overlay
 *   • Cierre del drawer con tecla ESC
 *   • Marcado aria-current="page" en el enlace activo
 */

document.addEventListener('DOMContentLoaded', function () {

    /* ──────────────────────────────────────────────
       1. DETECCIÓN DE PÁGINA ACTUAL
       Usamos la ruta del archivo para saber qué
       enlace marcar como activo (aria-current).
    ────────────────────────────────────────────── */
    var path     = window.location.pathname;
    var filename = path.substring(path.lastIndexOf('/') + 1) || 'principal.html';
  
    /* ──────────────────────────────────────────────
       2. HTML DEL SIDEBAR (columna izquierda)
    ────────────────────────────────────────────── */
    var sidebarHTML = [
      '<div id="sidebar-logo">',
        '<img src="images/logoUdeA.png" alt="Logo Universidad de Antioquia"',
          ' onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';" />',
        '<div class="logo-fallback">Universidad<br />de Antioquia</div>',
      '</div>',
      '<nav id="sidebar-nav"></nav>',
      '<div id="sidebar-footer">&copy; UdeA 2026</div>'
    ].join('');
  
    /* ──────────────────────────────────────────────
       3. HTML DEL TOP-NAV (barra de navegación)
       Cada enlace recibe aria-current="page" si
       coincide con la página actual.
    ────────────────────────────────────────────── */
    var navLinks = [
      { href: 'principal.html', label: 'Principal' },
      { href: 'procesos.html',  label: 'Procesos'  },
      { href: 'galeria/index.html', label: 'Galeria', target: '_blank' },
      { href: 'coleccion.html', label: 'Blog', target: '_blank' },
      { href: 'creditos.html',  label: 'Cr&eacute;ditos' }
    ];
  
    function buildTopNav() {
      var parts = [
        /* Botón hamburguesa – visible sólo en ≤900px vía CSS */
        '<button id="menu-toggle" aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="sidebar">',
          '&#9776;',
        '</button>',
        '<nav>'
      ];
  
      navLinks.forEach(function (link, i) {
        var isCurrent = (filename === link.href || (filename === '' && link.href === 'principal.html'));
        var ariaCurrent = isCurrent ? ' aria-current="page"' : '';
        var activeClass = isCurrent ? ' class="active"' : '';
        var targetAttr  = link.target ? ' target="' + link.target + '"' : '';
  
        if (i > 0) {
          parts.push('<span class="sep">|</span>');
        }
        parts.push(
          '<a href="' + link.href + '"' + targetAttr + activeClass + ariaCurrent + '>' + link.label + '</a>'
        );
      });
  
      parts.push('</nav>');
      return parts.join('');
    }
  
    /* ──────────────────────────────────────────────
       4. HTML DE LA COLUMNA DERECHA
    ────────────────────────────────────────────── */
    var rightColHTML = [
      '<div id="right-title">',
        '<h1>Colecci&oacute;n de Grabado</h1>',
        '<h2>Facultad de Artes</h2>',
      '</div>',
      '<div id="right-panel">',
        '<img src="images/01.JPG" alt="Obra de grabado"',
          ' onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';" />',
        '<div class="img-placeholder" style="display:none;">Obra de grabado<br />Colecci&oacute;n UdeA</div>',
      '</div>',
      '<div id="right-footer"></div>'
    ].join('');
  
    /* ──────────────────────────────────────────────
       5. OVERLAY (fondo oscuro para el drawer)
    ────────────────────────────────────────────── */
    var overlayHTML = '<div id="sidebar-overlay" role="presentation"></div>';
  
    /* ──────────────────────────────────────────────
       6. INYECCIÓN EN PLACEHOLDERS
    ────────────────────────────────────────────── */
    var sidebarEl  = document.getElementById('sidebar');
    var topNavEl   = document.getElementById('top-nav');
    var rightColEl = document.getElementById('right-col');
    var wrapperEl  = document.getElementById('wrapper');
  
    if (sidebarEl)  sidebarEl.innerHTML  = sidebarHTML;
    if (topNavEl)   topNavEl.innerHTML   = buildTopNav();
    if (rightColEl) rightColEl.innerHTML = rightColHTML;
  
    /* Insertar overlay en el wrapper */
    if (wrapperEl && !document.getElementById('sidebar-overlay')) {
      wrapperEl.insertAdjacentHTML('beforeend', overlayHTML);
    }
  
    /* ──────────────────────────────────────────────
       7. LÓGICA DEL MENÚ HAMBURGUESA
    ────────────────────────────────────────────── */
    var menuBtn = document.getElementById('menu-toggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
  
    function openDrawer() {
      if (!sidebar || !menuBtn) return;
      sidebar.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Cerrar menú de navegación');
      if (overlay) overlay.classList.add('active');
      /* Mueve el foco al primer enlace del sidebar para accesibilidad */
      var firstLink = sidebar.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  
    function closeDrawer() {
      if (!sidebar || !menuBtn) return;
      sidebar.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Abrir menú de navegación');
      if (overlay) overlay.classList.remove('active');
      menuBtn.focus();
    }
  
    function toggleDrawer() {
      if (sidebar && sidebar.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    }
  
    if (menuBtn) {
      menuBtn.addEventListener('click', toggleDrawer);
    }
  
    /* Cierre al hacer clic en el overlay */
    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }
  
    /* Cierre con tecla ESC */
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && sidebar && sidebar.classList.contains('open')) {
        closeDrawer();
      }
    });
  
    /* Cierre automático al elegir un enlace del sidebar en móvil */
    if (sidebar) {
      sidebar.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          closeDrawer();
        }
      });
    }
  
    /* ──────────────────────────────────────────────
       8. AJUSTE AL REDIMENSIONAR LA VENTANA
       Si el viewport vuelve a ser >900px,
       cierra el drawer para evitar estado inconsistente.
    ────────────────────────────────────────────── */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        if (menuBtn) {
          menuBtn.setAttribute('aria-expanded', 'false');
          menuBtn.setAttribute('aria-label', 'Abrir menú de navegación');
        }
      }
    });
  
  });
  