BUILD COMPILADO — LISTO PARA SUBIR A GITHUB PAGES

Estructura final:
/
├─ index.html
├─ manifest.json
├─ sw.js
├─ icon.png
├─ Diosa.png
├─ licencia_valora.json
├─ license-generator-simple.html   (OFFLINE: genera tokens)
└─ assets/
   ├─ css/styles.min.css
   └─ js/
      ├─ app.min.js
      └─ license.min.js

IMPORTANTE:
- Token esperado: payloadB64u.signatureB64u  (2 partes)
- FREE: dictamen bloqueado.
- PREMIUM: muestra dictamen + copia habilitada + usuario + días restantes.

Si el sitio NO refleja cambios:
Chrome -> F12 -> Application -> Service Workers -> Unregister
Application -> Storage -> Clear site data
Ctrl+Shift+R
