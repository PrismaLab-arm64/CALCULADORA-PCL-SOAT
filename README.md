# CALCULADORA PCL-SOAT (PWA)

**Motor de liquidación (SMLDV) — Offline-first** para estimar indemnización por **Pérdida de Capacidad Laboral (PCL)** en el contexto SOAT (Colombia), con **control de licencias por token** (sin backend) y **dictamen preliminar** habilitable por plan.

---

## ✅ Acceso (GitHub Pages)

La app está publicada en:

- https://prismalab-arm64.github.io/CALCULADORA-PCL-SOAT/

Desde allí puedes:
- Abrir la calculadora.
- Instalarla como **PWA** (Android / iOS / Desktop).
- Usarla **offline** luego de la primera carga (Service Worker).

---

## 🎯 Qué hace (en 30 segundos)

1. Seleccionas **año (SMMLV)**.
2. Ingresas **% PCL** (rango esperado 1–100).
3. La app calcula:
   - **Equivalencia en SMLDV** (por tramos).
   - **SMLDV (COP)** del año.
   - **Indemnización estimada (COP)**.
4. (Según licencia) genera/permite **dictamen preliminar** y **copiado** para compartir.

---

## ✨ Funcionalidades

### Cálculo (core)
- Cálculo por porcentaje de PCL con visualización inmediata.
- Aplicación de **tope máximo 180 SMLDV**.
- Conversión **SMLDV vs %PCL** por tramos (implementación interna):
  - 1–5%  → 14 SMLDV
  - 5–50% → 14 + (PCL − 5) × 3.5
  - >50%  → 180 SMLDV (tope)

> Nota: el cálculo está implementado en el build compilado y se muestra como “Base normativa / criterio” dentro de la app.

### PWA / Offline-first
- **Service Worker** para caché offline.
- Instalable como aplicación (manifest + iconos).
- Operativa sin internet una vez instalada y cacheada.

### Licencias (sin servidor)
- Activación por **token pegable** dentro de la app.
- Persistencia local del token vía **localStorage** (no usa backend).
- Contador de días / vencimiento según token.

### Dictamen preliminar (según plan)
- **FREE:** dictamen y/o copiado restringido.
- **PREMIUM:** dictamen visible + **copiado habilitado** + **nombre de usuario** + **días restantes**.

---

## 🔐 Licenciamiento por Token (formato + flujo)

### Formato esperado
El token se compone de **2 partes**:

`payloadB64u.signatureB64u`

- `payloadB64u`: JSON codificado (Base64URL)
- `signatureB64u`: firma HMAC-SHA256 (Base64URL)

### Cómo activar en la app
1. En la app: **Activación Premium** → “Pegar token”.
2. Presiona **Validar licencia**.
3. Si es válido, la app cambia el estado y habilita las funciones premium según el payload.

---

## 🧩 Generador/Validador SIMPLE (Offline)

Este repo incluye un generador local:

- `license-generator-simple.html`

Uso:
1. Abre el archivo **con doble clic** (sin internet).
2. Ingresa:
   - **Usuario (nombre visible)**
   - **Plan**
   - **Vencimiento** (si el plan es DEMO, se calcula automático a 30 días)
   - (Opcional) `lic_id`
   - (Opcional) `features` (JSON), ejemplo:
     ```json
     { "whatsapp": true, "dictamen": true }
     ```
3. Clic en **Generar token** y luego **Copiar token**.
4. Pégalo en la app y valida.

> DEMO: fija vencimiento automático a **30 días**.  
> Otros planes: el vencimiento se controla con el calendario (ej.: 6 o 12 meses según tu política comercial).

---

## 📁 Estructura del proyecto (etapa actual)

Build compilado listo para GitHub Pages:
/
├─ index.html
├─ manifest.json
├─ sw.js
├─ icon.png
├─ Diosa.png
├─ licencia_valora.json
├─ license-generator-simple.html # OFFLINE: genera tokens
└─ assets/
├─ css/
│ └─ styles.min.css
└─ js/
├─ app.min.js
└─ license.min.js


---

## 🛠️ Notas técnicas

- **Build**: el front está compilado y minificado en `assets/js/*.min.js` y `assets/css/*.min.css`.
- **Sin backend**: la licencia se valida localmente y el token se almacena localmente.
- **CSP / seguridad**: el proyecto contempla políticas para operación en modo web/PWA.

---

## 🧯 Troubleshooting (cuando “no refleja cambios”)

Si GitHub Pages carga una versión anterior, normalmente es por caché del Service Worker.

En Chrome:
1. `F12` → **Application**
2. **Service Workers** → *Unregister*
3. **Storage** → *Clear site data*
4. Recarga fuerte: `Ctrl + Shift + R`

---

## ⚠️ Alcance y responsabilidad

Esta aplicación es un **apoyo técnico** para estimaciones y preliquidaciones.
- No sustituye dictámenes periciales formales.
- No reemplaza asesoría legal.
- El usuario final debe verificar el encuadre normativo y la aplicabilidad al caso concreto.

---

## 📌 Estado del proyecto

- Estado: **Activo**
- Tipo: **PWA – Offline-first**
- Modelo: **FREE + Licenciamiento por token (Premium)**

---

## 📣 Contacto / Titularidad

Autor / Titular: **PrismaLab arm64**  
GitHub: https://github.com/PrismaLab-arm64

