/* ui-tweaks.js — Limpieza UI producción + lógica "renovar a 5 días"
   No depende de app.min.js. Opera por DOM/textos.
*/
(() => {
  "use strict";

  // Ajustes
  const SHOW_RENEW_DAYS = 5;     // mostrar "Activar/Gestionar" cuando falten <= 5 días
  const RUN_EVERY_MS = 1200;     // re-aplicar (por si la app re-renderiza)

  // Helpers
  const norm = (s) => (s || "").toString().toLowerCase().trim();
  const hasText = (el, txt) => el && norm(el.textContent).includes(norm(txt));

  function hideIfContains(tag, text) {
    document.querySelectorAll(tag).forEach(el => {
      if (hasText(el, text)) el.style.display = "none";
    });
  }

  function hideButtonsByLabel(label) {
    document.querySelectorAll("button, a").forEach(el => {
      if (norm(el.textContent) === norm(label)) el.style.display = "none";
    });
  }

  function findSectionByTitle(titleText) {
    // Busca un contenedor que incluya el título "Activación Premium"
    const all = Array.from(document.querySelectorAll("section, div, article, main"));
    return all.find(el => hasText(el, titleText));
  }

  function extractDaysLeft() {
    // Busca "Días restantes:" y extrae el número
    const nodes = Array.from(document.querySelectorAll("*"));
    for (const n of nodes) {
      const t = n.textContent || "";
      if (t.includes("Días restantes")) {
        const m = t.match(/Días\s+restantes\s*:\s*(\d+)/i);
        if (m) return parseInt(m[1], 10);
      }
    }
    return null;
  }

  function isPremiumUI() {
    // Si en el panel aparece "Estado: PREMIUM"
    return Array.from(document.querySelectorAll("*"))
      .some(n => (n.textContent || "").includes("Estado: PREMIUM"));
  }

  function apply() {
    // 1) Ocultar indicadores azules (online / sw)
    hideIfContains("div, span, small", "Online");
    hideIfContains("div, span, small", "SW:");

    // 2) Ocultar info verde de build/debug
    hideIfContains("div, span, small", "Build:");
    hideIfContains("div, span, small", "assets/js/");

    // 3) Ocultar botón "Copiar" (naranja)
    hideButtonsByLabel("Copiar");

    // 4) Lógica del panel de activación
    const panel = findSectionByTitle("Activación Premium");
    if (!panel) return;

    const days = extractDaysLeft();
    const premium = isPremiumUI();

    // Botones dentro del panel
    const btnManage = Array.from(panel.querySelectorAll("button, a"))
      .find(el => norm(el.textContent).includes("activar") || norm(el.textContent).includes("gestionar"));
    const btnRemove = Array.from(panel.querySelectorAll("button, a"))
      .find(el => norm(el.textContent).includes("quitar"));

    // Regla:
    // - En FREE: mostrar panel completo (para suscripción)
    // - En PREMIUM: ocultar todo el panel excepto contador; y mostrar gestionar solo si faltan <= 5 días
    if (premium) {
      // Oculta datos “Estado/Usuario” pero deja visible “Días restantes”
      Array.from(panel.querySelectorAll("*")).forEach(el => {
        const txt = el.textContent || "";
        const keep = txt.includes("Días restantes");
        if (!keep && el !== panel) el.style.display = "none";
      });

      // Botón gestionar solo en ventana de renovación
      if (btnManage) {
        if (days !== null && days <= SHOW_RENEW_DAYS) btnManage.style.display = "";
        else btnManage.style.display = "none";
      }

      // Botón “Quitar licencia”: opcional
      // Si lo quieres oculto siempre en premium, descomenta la siguiente línea:
      // if (btnRemove) btnRemove.style.display = "none";

    } else {
      // FREE: panel visible completo (no tocar), solo garantiza que el botón gestionar exista/sea visible
      if (btnManage) btnManage.style.display = "";
      // btnRemove normalmente no debería estar en free, pero si aparece, puedes ocultarlo:
      // if (btnRemove) btnRemove.style.display = "none";
    }
  }

  // Ejecuta ahora y re-ejecuta periódicamente (por si tu app pinta de nuevo)
  apply();
  setInterval(apply, RUN_EVERY_MS);
})();
