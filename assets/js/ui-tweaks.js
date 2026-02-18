/* ui-tweaks.js — Producción: menos pistas + UX premium + gancho 2027 + fondo azul */
(() => {
  "use strict";

  const SHOW_RENEW_DAYS = 5;   // mostrar "Activar/Gestionar" cuando falten <= 5 días
  const RUN_EVERY_MS = 1200;
  const YEAR_GANCHO = "2027";  // año premium visible pero bloqueado en FREE
  const FALLBACK_YEAR = "2026";

  const norm = (s) => (s || "").toString().toLowerCase().trim();
  const hasText = (el, txt) => el && norm(el.textContent).includes(norm(txt));

  function injectStyleOnce(id, cssText) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
  }

  function hideIfContains(selector, text) {
    document.querySelectorAll(selector).forEach(el => {
      if (hasText(el, text)) el.style.display = "none";
    });
  }

  function hideButtonsByLabel(label) {
    document.querySelectorAll("button, a").forEach(el => {
      if (norm(el.textContent) === norm(label)) el.style.display = "none";
    });
  }

  function findSectionByTitle(titleText) {
    const all = Array.from(document.querySelectorAll("section, div, article, main"));
    return all.find(el => hasText(el, titleText));
  }

  function extractDaysLeft() {
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
    return Array.from(document.querySelectorAll("*"))
      .some(n => (n.textContent || "").includes("Estado: PREMIUM"));
  }

  function setSmallHint(text) {
    const el = document.getElementById("smmlvInfo");
    if (!el) return;
    // Solo mensajes cortos y no invasivos
    el.textContent = text || "";
  }

  function ensure2027Gated(premium) {
  const sel = document.getElementById("year");
  if (!sel) return;

  // Asegura que exista la opción 2027
  let opt = sel.querySelector(`option[value="${YEAR_GANCHO}"]`);
  if (!opt) {
    opt = document.createElement("option");
    opt.value = YEAR_GANCHO;
    opt.textContent = YEAR_GANCHO;
    sel.insertBefore(opt, sel.firstChild);
  }

  const currentYear = String(new Date().getFullYear());
  const isYear2027 = (currentYear === YEAR_GANCHO);

  // Regla:
  // - FREE: siempre bloqueado (gancho)
  // - PREMIUM: solo habilitado si YA estamos en 2027 (datos oficiales deberían existir)
  const canUse2027 = premium && isYear2027;

  if (!canUse2027) {
    opt.disabled = true;
    if (!opt.textContent.includes("🔒")) opt.textContent = `${YEAR_GANCHO} 🔒`;

    // Evita selección manual
    if (sel.value === YEAR_GANCHO) {
      sel.value = FALLBACK_YEAR;
      setSmallHint("2027 se habilita cuando esté vigente.");
    }
    sel.addEventListener("change", () => {
      if (sel.value === YEAR_GANCHO) {
        sel.value = FALLBACK_YEAR;
        setSmallHint("2027 se habilita cuando esté vigente.");
      } else {
        setSmallHint("");
      }
    }, { once: true });

  } else {
    opt.disabled = false;
    opt.textContent = YEAR_GANCHO;
    setSmallHint("");
  }
}


    // Gating: FREE -> disabled y con candado; PREMIUM -> habilitado
    if (!premium) {
      opt.disabled = true;
      if (!opt.textContent.includes("🔒")) opt.textContent = `${YEAR_GANCHO} 🔒`;
      // Si por algún motivo quedó seleccionado, vuelve a 2026
      if (sel.value === YEAR_GANCHO) {
        sel.value = FALLBACK_YEAR;
        setSmallHint("2027 disponible con suscripción.");
      }
      // Bloqueo adicional ante cambios manuales
      sel.addEventListener("change", () => {
        if (sel.value === YEAR_GANCHO) {
          sel.value = FALLBACK_YEAR;
          setSmallHint("2027 disponible con suscripción.");
        } else {
          setSmallHint("");
        }
      }, { once: true });
    } else {
      opt.disabled = false;
      opt.textContent = YEAR_GANCHO;
      // En premium no molestamos con textos
      setSmallHint("");
    }
  }

  function apply() {
    // ===== Estilo: fondo azul tipo activador =====
    injectStyleOnce("pcl-blue-bg", `
      body { background: #08142b !important; }
      .topbar { background: #08142b !important; border-bottom: 1px solid rgba(255,255,255,.08) !important; }
      .wrap { padding-bottom: 28px; }
    `);

    // ===== Ocultar pistas (debug) =====
    hideIfContains("div, span, small", "Online");
    hideIfContains("div, span, small", "SW:");
    hideIfContains("div, span, small", "Build:");
    hideIfContains("div, span, small", "assets/js/");
    hideIfContains("div, span, small", "localStorage"); // la nota del modal
    hideIfContains("div, span, small", "Sin backend");  // la nota del modal

    // ===== Quitar botón "Copiar" del dictamen (naranja) =====
    hideButtonsByLabel("Copiar");

    // ===== Panel premium (amarillo) =====
    const panel = findSectionByTitle("Activación Premium");
    if (!panel) return;

    const premium = isPremiumUI();
    const days = extractDaysLeft();

    // Botones dentro del panel
    const btnManage = Array.from(panel.querySelectorAll("button, a"))
      .find(el => norm(el.textContent).includes("activar") || norm(el.textContent).includes("gestionar"));
    const btnRemove = Array.from(panel.querySelectorAll("button, a"))
      .find(el => norm(el.textContent).includes("quitar"));

    // FREE: panel visible (para convertir)
    // PREMIUM: ocultar casi todo y mostrar gestionar solo cuando falten <=5 días
    if (premium) {
      Array.from(panel.querySelectorAll("*")).forEach(el => {
        const txt = el.textContent || "";
        const keep = txt.includes("Días restantes");
        if (!keep && el !== panel) el.style.display = "none";
      });

      if (btnManage) {
        if (days !== null && days <= SHOW_RENEW_DAYS) btnManage.style.display = "";
        else btnManage.style.display = "none";
      }

      // Por seguridad/UX: ocultar "Quitar licencia" (evita que el cliente juegue con eso)
      if (btnRemove) btnRemove.style.display = "none";
    } else {
      if (btnManage) btnManage.style.display = "";
      // En FREE también oculto "Quitar licencia" (no aporta y da pistas)
      if (btnRemove) btnRemove.style.display = "none";
    }

    // ===== Gancho 2027 gated =====
    ensure2027Gated(premium);
  }

  apply();
  setInterval(apply, RUN_EVERY_MS);
})();
