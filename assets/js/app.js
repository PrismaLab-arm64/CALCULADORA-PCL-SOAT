(function(){
  "use strict";

  // ====== DOM ======
  const $ = (id)=>document.getElementById(id);

  const netStatus = $("netStatus");
  const yearEl = $("year");
  const pclEl = $("pcl");
  const smmlvInfo = $("smmlvInfo");

  const kpiSml = $("kpiSml");
  const kpiSmlDv = $("kpiSmlDv");
  const kpiCop = $("kpiCop");

  const dictamen = $("dictamen");
  const btnCopyDictamen = $("btnCopyDictamen");

  // Premium UI
  const premiumStatus = $("premiumStatus");
  const premiumUser = $("premiumUser");
  const premiumDays = $("premiumDays");

  const btnOpenLicense = $("btnOpenLicense");
  const btnClearLicense = $("btnClearLicense");
  const licenseModal = $("licenseModal");
  const btnCloseLicense = $("btnCloseLicense");
  const licenseToken = $("licenseToken");
  const btnValidateLicense = $("btnValidateLicense");
  const btnCopyState = $("btnCopyState");
  const licenseMsg = $("licenseMsg");

  // ====== Datos (SMMLV) ======
  // 2024: 1.300.000; 2025: 1.423.500; 2026: 1.750.905. (Fuentes públicas)
  const SMMLV = {
    2024: 1300000,
    2025: 1423500,
    2026: 1750905
  };

  function fmtCOP(n){
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("es-CO", { style:"currency", currency:"COP", maximumFractionDigits:0 });
  }
  function fmtNum(n, d=1){
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("es-CO", { minimumFractionDigits:d, maximumFractionDigits:d });
  }

  // ====== Regla equivalencia SMLDV vs %PCL ======
  function smlDvEquivalence(pcl){
    if (!Number.isFinite(pcl) || pcl <= 0) return 0;

    // Tramo 1: 1%–5% => 14 SMLDV (tabla divulgada)
    if (pcl <= 5) return 14;

    // Tramo 2: 5%–50% => 14 + (pcl-5)*3.5  (lineal por tramos)
    if (pcl <= 50) return 14 + (pcl - 5) * 3.5;

    // Tramo 3: >50% => 180 SMLDV (tope)
    return 180;
  }

  function smlDvValueCOP(year){
    const smmlv = SMMLV[year] || 0;
    return smmlv / 30; // SMLDV aproximado: SMMLV mensual / 30
  }

  function buildDictamen({year, pcl, sml, smlDvCop, totalCop, premiumState}){
    const lines = [];
    lines.push("DICTAMEN PRELIMINAR — CÁLCULO PCL (SOAT)");
    lines.push("----------------------------------------");
    lines.push(`Fecha: ${new Date().toLocaleString("es-CO")}`);
    lines.push(`Año base (SMMLV): ${year}  |  SMMLV: ${fmtCOP(SMMLV[year]||0)}`);
    lines.push(`PCL reportada: ${fmtNum(pcl,1)} %`);
    lines.push("");
    lines.push(`Equivalencia aplicada (SMLDV): ${fmtNum(sml,1)}`);
    lines.push(`SMLDV (COP): ${fmtCOP(smlDvCop)}`);
    lines.push(`Indemnización estimada (COP): ${fmtCOP(totalCop)}`);
    lines.push("");
    lines.push("Observación técnica:");
    lines.push("- Tope máximo por incapacidad permanente: 180 SMLDV.");
    lines.push("- Equivalencia SMLDV implementada por tramos (según tablas divulgadas); para uso forense/jurídico, validar siempre contra norma vigente y dictamen de calificación.");
    lines.push("");
    lines.push(`Estado de licencia: ${premiumState}`);
    return lines.join("\n");
  }

  // ====== Premium flow ======
  function showMsg(text, ok){
    licenseMsg.textContent = text || "";
    licenseMsg.className = "msg" + (ok===true ? " ok" : ok===false ? " err" : "");
  }

  function openModal(){
    licenseModal.classList.add("is-open");
    licenseModal.setAttribute("aria-hidden","false");
    licenseToken.value = window.PCLSOAT_LICENSE.loadToken();
    showMsg("", null);
  }
  function closeModal(){
    licenseModal.classList.remove("is-open");
    licenseModal.setAttribute("aria-hidden","true");
  }

  async function refreshPremiumUI(){
    const token = window.PCLSOAT_LICENSE.loadToken();
    if (!token){
      premiumStatus.innerHTML = 'Estado: <b>FREE</b>';
      premiumUser.style.display = "none";
      premiumDays.style.display = "none";
      return { state:"FREE", isPremium:false, user:"", daysLeft:0 };
    }

    const res = await window.PCLSOAT_LICENSE.verifyToken(token);
    if (!res.ok){
      premiumStatus.innerHTML = 'Estado: <b style="color:var(--danger)">FREE</b>';
      premiumUser.style.display = "none";
      premiumDays.style.display = "none";
      return { state:"FREE", isPremium:false, user:"", daysLeft:0, reason:res.reason || "" };
    }

    const user = res.payload?.user || "Usuario";
    premiumStatus.innerHTML = 'Estado: <b style="color:var(--accent)">PREMIUM</b>';
    premiumUser.textContent = `Usuario: ${user}`;
    premiumDays.textContent = `Días restantes: ${res.daysLeft}`;
    premiumUser.style.display = "";
    premiumDays.style.display = "";
    return { state:"PREMIUM", isPremium:true, user, daysLeft:res.daysLeft };
  }

  // ====== Cálculo ======
  async function recalc(){
    const year = Number(yearEl.value);
    const pcl = Number(String(pclEl.value).replace(",", "."));
    const sml = smlDvEquivalence(pcl);
    const dv = smlDvValueCOP(year);
    const total = sml * dv;

    smmlvInfo.textContent = `SMMLV ${year}: ${fmtCOP(SMMLV[year]||0)}  |  SMLDV aprox.: ${fmtCOP(dv)}`;

    kpiSml.textContent = sml ? fmtNum(sml,1) : "—";
    kpiSmlDv.textContent = dv ? fmtCOP(dv) : "—";
    kpiCop.textContent = total ? fmtCOP(total) : "—";

    const premium = await refreshPremiumUI();

    // Dictamen textual: SOLO PREMIUM (modelo de negocio + control de uso)
    if (!premium.isPremium){
      dictamen.value = "🔒 Dictamen preliminar disponible solo en versión PREMIUM.\n\nActiva tu licencia para habilitar:\n- Dictamen textual\n- Copiar/compartir\n";
      btnCopyDictamen.disabled = true;
      btnCopyDictamen.style.display = "none";
    } else {
      dictamen.value = buildDictamen({year, pcl, sml, smlDvCop: dv, totalCop: total, premiumState: premium.state});
      btnCopyDictamen.disabled = false;
      btnCopyDictamen.style.display = "inline-block";
    }
  }

  // ====== Eventos ======
  function refreshNet(){
    const online = navigator.onLine;
    netStatus.textContent = online ? "Online" : "Offline";
    netStatus.className = "pill" + (online ? "" : " pill--muted");
  }

  yearEl.addEventListener("change", recalc);
  pclEl.addEventListener("input", recalc);

  btnCopyDictamen.addEventListener("click", async ()=>{
    try{
      await navigator.clipboard.writeText(dictamen.value || "");
    }catch(e){}
  });

  btnOpenLicense.addEventListener("click", openModal);
  btnCloseLicense.addEventListener("click", closeModal);
  licenseModal.addEventListener("click", (e)=>{
    if (e.target === licenseModal) closeModal();
  });

  btnClearLicense.addEventListener("click", async ()=>{
    window.PCLSOAT_LICENSE.clearToken();
    await recalc();
  });

  btnValidateLicense.addEventListener("click", async ()=>{
    const token = (licenseToken.value || "").trim();
    if (!token) return showMsg("Pega un token.", false);
    const res = await window.PCLSOAT_LICENSE.verifyToken(token);
    if (!res.ok){
      showMsg(res.reason || "Licencia no válida.", false);
      return;
    }
    window.PCLSOAT_LICENSE.saveToken(token);
    showMsg(`Licencia OK. Usuario: ${res.payload?.user || "—"} | Días: ${res.daysLeft}`, true);
    await recalc();
  });

  btnCopyState.addEventListener("click", async ()=>{
    const token = window.PCLSOAT_LICENSE.loadToken();
    const text = token ? `TOKEN:\n${token}` : "Sin token (FREE).";
    try{ await navigator.clipboard.writeText(text); }catch(e){}
  });

  window.addEventListener("online", ()=>{refreshNet();});
  window.addEventListener("offline", ()=>{refreshNet();});

  // Init
  refreshNet();
  recalc();
})();
