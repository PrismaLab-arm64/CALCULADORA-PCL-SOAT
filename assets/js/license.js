/*
  license.js — Verificación de token premium (HMAC-SHA256) + estado local.
  Formato token:  base64url(payloadJson) + "." + base64url(hmac_sha256(payloadB64u, SECRET))

  IMPORTANTE:
  - Para producción, NO dejes el SECRET hardcodeado en cliente.
  - En tu modelo actual (100% offline), el SECRET en cliente es una barrera ligera, no seguridad fuerte.
*/
(function(){
  "use strict";

  // === CONFIG ===
  const LICENSE_STORAGE_KEY = "pclsoat_license_token_v1";

  // ⚠️ Sustituye por tu SECRET real (el mismo del generador offline).
  // Si lo dejas vacío, la app seguirá en modo FREE.
  const SECRET = "Sk1nn3r%%2025"; // <-- pega tu SECRET aquí

  // === Helpers base64url ===
  function b64uEncode(bytes){
    let bin = "";
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    for (let i=0;i<arr.length;i++) bin += String.fromCharCode(arr[i]);
    const b64 = btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
    return b64;
  }
  function b64uToBytes(b64u){
    const b64 = b64u.replace(/-/g,"+").replace(/_/g,"/") + "===".slice((b64u.length + 3) % 4);
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function textToBytes(s){ return new TextEncoder().encode(s); }

  async function hmacSha256(secret, message){
    const key = await crypto.subtle.importKey(
      "raw",
      textToBytes(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, textToBytes(message));
    return b64uEncode(new Uint8Array(sig));
  }

  function nowUtcMs(){ return Date.now(); }
  function daysLeft(expUtcMs){
    const ms = expUtcMs - nowUtcMs();
    return Math.floor(ms / (24*3600*1000));
  }

  async function verifyToken(token){
    if (!SECRET) return { ok:false, reason:"SECRET vacío en la PWA. Mantiene modo FREE." };
    if (!token || typeof token !== "string" || !token.includes(".")) return { ok:false, reason:"Token inválido." };

    const [payloadB64u, sigB64u] = token.split(".");
    if (!payloadB64u || !sigB64u) return { ok:false, reason:"Token incompleto." };

    const expected = await hmacSha256(SECRET, payloadB64u);
    if (expected !== sigB64u) return { ok:false, reason:"Firma NO coincide (SECRET incorrecto o token modificado)." };

    let payload;
    try{
      payload = JSON.parse(new TextDecoder().decode(b64uToBytes(payloadB64u)));
    }catch(e){
      return { ok:false, reason:"Payload inválido." };
    }

    const exp = Number(payload?.expUtcMs);
    if (!exp || !Number.isFinite(exp)) return { ok:false, reason:"Payload sin expiración (expUtcMs)." };

    const left = daysLeft(exp);
    if (left < 0) return { ok:false, reason:"Licencia vencida.", payload };
    return { ok:true, payload, daysLeft:left };
  }

  function saveToken(token){ localStorage.setItem(LICENSE_STORAGE_KEY, token); }
  function loadToken(){ return localStorage.getItem(LICENSE_STORAGE_KEY) || ""; }
  function clearToken(){ localStorage.removeItem(LICENSE_STORAGE_KEY); }

  // Exponer API mínima a la app
  window.PCLSOAT_LICENSE = {
    verifyToken, saveToken, loadToken, clearToken,
    STORAGE_KEY: LICENSE_STORAGE_KEY
  };
})();
