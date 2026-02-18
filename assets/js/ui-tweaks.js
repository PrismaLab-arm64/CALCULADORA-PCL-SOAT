/* ui-tweaks.js — Producción: menos pistas + UX premium + gancho 2027
   - Premium panel: "Asesor: NOMBRE — Días restantes: N"
   - Dictamen: añade bloque premium (Asesor + días) al inicio SOLO en Premium
   - Botón dictamen: WhatsApp SOLO en Premium (copia + abre wa.me)
   - Ajustes visuales: Fondo azul, cards integradas, responsive mejorado.
*/
(() => {
  "use strict";

  const SHOW_RENEW_DAYS = 5;
  const RUN_EVERY_MS = 1200;

  const YEAR_GANCHO = "2027";
  const FALLBACK_YEAR = "2026";

  const norm = (s) => (s || "").toString().toLowerCase().trim();

  function injectStyleOnce(id, cssText) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
  }

  function isPremiumUI() {
    const el = document.getElementById("premiumStatus");
    if (el) {
      const t = (el.textContent || "").toUpperCase();
      return t.includes("PREMIUM") || t.includes("DEMO") || t.includes("PRUEBA");
    }
    // Fallback: check body text just in case
    return document.body.textContent.includes("Estado: PREMIUM") ||
      document.body.textContent.includes("Estado: DEMO");
  }

  function extractDaysLeft() {
    const el = document.getElementById("premiumDays");
    if (el) {
      const m = (el.textContent || "").match(/(\d+)/);
      if (m) return parseInt(m[1], 10);
    }
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

  function setSmallHint(text) {
    const el = document.getElementById("smmlvInfo");
    if (!el) return;
    el.textContent = text || "";
  }

  // Asesor:
  // 1) Si premiumUser lo llena, lo usamos
  // 2) Si no, leemos token guardado (payload.user)
  function getTitularName() {
    const pu = document.getElementById("premiumUser");
    if (pu) {
      const t = (pu.textContent || "").trim();
      const m = t.match(/usuario\s*:\s*(.+)$/i);
      if (m && m[1]) return m[1].trim();
      if (t && t.length <= 60) return t.replace(/^Usuario:\s*/i, "").trim();
    }
    try {
      const token = (localStorage.getItem("pclsoat_license_token_v1") || "").trim();
      if (!token) return "";
      const parts = token.split(".");
      if (parts.length !== 2) return "";
      const b64u = parts[0];
      const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4);
      const payload = JSON.parse(atob(b64));
      const u = (payload.user || "").toString().trim();
      return u;
    } catch {
      return "";
    }
  }

  function ensure2027Gated(premium) {
    const sel = document.getElementById("year");
    if (!sel) return;

    let opt = sel.querySelector(`option[value="${YEAR_GANCHO}"]`);
    if (!opt) {
      opt = document.createElement("option");
      opt.value = YEAR_GANCHO;
      opt.textContent = YEAR_GANCHO;
      sel.insertBefore(opt, sel.firstChild);
    }

    const currentYear = String(new Date().getFullYear());
    const isYear2027 = (currentYear === YEAR_GANCHO);

    // Premium NO abre 2027 antes de tiempo.
    const canUse2027 = premium && isYear2027;

    if (!canUse2027) {
      opt.disabled = true;
      if (!opt.textContent.includes("🔒")) opt.textContent = `${YEAR_GANCHO} 🔒`;

      if (sel.value === YEAR_GANCHO) {
        sel.value = FALLBACK_YEAR;
        setSmallHint("2027 se habilita cuando esté vigente.");
      }

      if (!sel.__pclHooked) {
        sel.addEventListener("change", () => {
          if (sel.value === YEAR_GANCHO) {
            sel.value = FALLBACK_YEAR;
            setSmallHint("2027 se habilita cuando esté vigente.");
          } else {
            setSmallHint("");
          }
        });
        sel.__pclHooked = true;
      }
    } else {
      opt.disabled = false;
      opt.textContent = YEAR_GANCHO;
      setSmallHint("");
    }
  }

  async function copyToClipboard(text) {
    const t = (text || "").toString();
    if (!t) return false;

    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(t); return true; } catch { }
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch {
      return false;
    }
  }

  function openWhatsAppShare(text) {
    const url = "https://wa.me/?text=" + encodeURIComponent(text || "");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Inserta encabezado premium en el dictamen (solo premium)
  function buildPremiumDictamenHeader(titular, days) {
    const d = (typeof days === "number") ? String(days) : "—";
    const name = (titular && titular.trim()) ? titular.trim() : "—";
    return (
      `ASESOR: ${name}\n` +
      `SUSCRIPCIÓN: ${d} día(s) restantes\n` +
      `----------------------------------------\n`
    );
  }

  function apply() {
    // Fondo azul consistente y homólogo
    injectStyleOnce("pcl-blue-bg", `
      body, .topbar { background-color: #08142b !important; color: #ffffff; }
      .topbar { border-bottom: 1px solid rgba(255,255,255,.15) !important; }
      
      /* Ajuste de cards para homologar con el azul */
      .card, .modal__card {
        background-color: #0c1e3d !important; /* Azul ligeramente más claro que el fondo */
        color: #e0e6ed !important;
        border: 1px solid #1c355e !important;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      }
      
      /* Inputs y selects oscuros */
      input, select, textarea {
        background-color: #060f21 !important;
        color: #fff !important;
        border: 1px solid #2a4065 !important;
      }
      
      /* Botones y acentos */
      .h { color: #5c9eff !important; } /* Títulos en azul claro */
      .muted { color: #8ba6ca !important; }
      
      /* Dictamen más grande */
      #dictamen { height: 160px !important; min-height: 160px; }
      
      /* Responsive Tweaks */
      @media (max-width: 600px) {
        .row { flex-wrap: wrap; }
        .btnrow { flex-direction: column; width: 100%; gap: 10px; }
        .btn { width: 100%; margin: 0 !important; }
        .kpi { width: 100%; margin-bottom: 10px; }
      }
    `);

    // Ocultar Online/SW
    const net = document.getElementById("netStatus");
    const sw = document.getElementById("swStatus");
    if (net) net.style.display = "none";
    if (sw) sw.style.display = "none";

    // Ocultar footer completo pero si hay info importante moverla
    document.querySelectorAll("footer.footer, footer").forEach(f => { f.style.display = "none"; });

    // Ocultar nota del modal
    document.querySelectorAll(".modal .muted.small, .modal .small.muted").forEach(el => {
      const t = (el.textContent || "").toLowerCase();
      if (t.includes("localstorage") || t.includes("sin backend")) el.style.display = "none";
    });

    // Panel premium
    const panel = document.getElementById("premiumPanel");
    if (!panel) return;

    const premium = isPremiumUI();
    const days = extractDaysLeft();

    const btnManage = document.getElementById("btnOpenLicense");
    const btnRemove = document.getElementById("btnClearLicense");
    const elDays = document.getElementById("premiumDays");
    const elUser = document.getElementById("premiumUser");

    // Dictamen
    const btnCopyDict = document.getElementById("btnCopyDictamen");
    const dict = document.getElementById("dictamen");

    if (premium) {
      const titular = getTitularName();
      const name = (titular && titular.trim()) ? titular.trim() : "Usuario";

      // Línea premium: Asesor + Días
      const dtxt = (typeof days === "number") ? String(days) : "—";
      if (elDays) {
        elDays.style.display = "";
        elDays.textContent = `Asesor: ${name} — Días restantes: ${dtxt}`;
      }
      if (elUser) elUser.style.display = "none";

      // Ocultar todo en panel excepto premiumDays y botones necesarios
      Array.from(panel.querySelectorAll("*")).forEach(el => {
        // Mantenemos solo contenedores hijos directos o elDay
        const isChild = el.parentElement === panel;
        // La lógica original oculta divs internos, tratamos de ser específicos
        if ((el === elDays) || (el.id === "premiumDays")) {
          el.style.display = "";
        } else if (el.classList.contains("row") || el.classList.contains("btnrow")) {
          // Dejar que los contenedores se muestren si tienen contenido visible
        } else {
          // Ocultar premiumStatus, labels viejos, etc.
          if (el.id === "premiumStatus" || el.id === "premiumUser" || el.classList.contains("h")) {
            el.style.display = "none";
          }
        }
      });

      // Botón gestionar: visible si <= 5 días O si es un usuario "demo" para permitir cambio
      const isDemo = name.toLowerCase().includes("demo") || name.toLowerCase().includes("prueba");

      if (btnManage) {
        // Lógica corregida: Siempre permitir gestionar si es demo para salir del trap
        if (isDemo || (days !== null && days <= SHOW_RENEW_DAYS)) {
          btnManage.style.display = "";
          btnManage.textContent = "Gestionar Licencia";
        } else {
          btnManage.style.display = "none";
        }
      }
      if (btnRemove) btnRemove.style.display = "none"; // Preferimos btnManage que abre el modal

      // Dictamen: botón WhatsApp + encabezado premium
      if (btnCopyDict) {
        btnCopyDict.style.display = "";
        btnCopyDict.textContent = "WhatsApp";
        if (!btnCopyDict.__pclHooked) {
          btnCopyDict.addEventListener("click", async () => {
            const raw = dict ? (dict.value || "") : "";
            if (!raw.trim()) return;

            // Inserta header premium si no existe ya
            const header = buildPremiumDictamenHeader(name, days);
            const already = raw.startsWith("ASESOR:");
            const finalText = already ? raw : (header + raw);

            await copyToClipboard(finalText);
            openWhatsAppShare(finalText);
          });
          btnCopyDict.__pclHooked = true;
        }
      }

    } else {
      // FREE: activar visible, quitar oculto
      if (btnManage) btnManage.style.display = "";
      if (btnRemove) btnRemove.style.display = "none";

      // FREE: dictamen sin compartir
      if (btnCopyDict) btnCopyDict.style.display = "none";
    }

    // Gancho 2027
    ensure2027Gated(premium);
  }

  apply();
  setInterval(apply, RUN_EVERY_MS);
})();
