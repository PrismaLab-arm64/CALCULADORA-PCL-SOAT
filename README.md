# 📱 Calculadora PCL SOAT - Forensics Crash Edition
**Versión Actual:** 1.2.1 (Offline Fix + SW Network-First Lic) | **Build:** V18-Patch
**Desarrollado por:** Ing. John A. Skinner S. 

## ✅ Patch 1.2.1 (Correcciones Repo)
- Service Worker registrado desde la app (PWA funcional).
- Precache corregido: `Diosa.png` (antes apuntaba a `Diosa.jpg`).
- Estrategia de caché: `licencia_valora.json` en **Network-First** para evitar licencias obsoletas.
- CSP aplicado vía meta-tag (mitigación XSS básica acorde a los CDNs usados).


## 🛡️ Aviso Legal
Esta herramienta realiza estimaciones basadas en la normativa vigente. Los valores finales pueden variar por redondeos bancarios o ajustes en las tablas oficiales de la Superintendencia Financiera.

## ⚠️ Cláusula de Continuidad y Exención de Responsabilidad

**1. DERECHO DE RETIRO Y SUSPENSIÓN:**
El desarrollador (**Ing. John A. Skinner S. / Forensics Crash S.A.S.**) se reserva el derecho absoluto, unilateral y exclusivo de descontinuar, modificar, suspender o anular el acceso y soporte de esta herramienta en cualquier momento, sin previo aviso y sin que esto genere derecho a indemnización o reclamación alguna por parte de los usuarios.

**2. LICENCIAMIENTO DE USO (NO VENTA):**
La entrega de este software constituye una **Licencia de Uso Temporal, Revocable y No Exclusiva**. La propiedad intelectual y el código fuente permanecen en todo momento bajo la titularidad exclusiva de su autor. Queda prohibida la ingeniería inversa, redistribución o comercialización no autorizada.

**3. EXENCIÓN DE GARANTÍA ("AS IS"):**
Esta aplicación se entrega "TAL CUAL" (*As Is*), como una herramienta auxiliar de cálculo. El autor no se hace responsable por:
- Cambios normativos futuros no reflejados en la versión actual.
- Decisiones jurídicas, financieras o periciales tomadas con base en estos cálculos.
- Lucro cesante o daños derivados del uso o imposibilidad de uso de la herramienta.

**El uso continuado de esta aplicación implica la aceptación total de estos términos.**

## 📄 Descripción del Producto
Aplicación Web Progresiva (PWA) diseñada para el cálculo forense y jurídico de indemnizaciones por Pérdida de Capacidad Laboral (PCL) bajo el amparo del **Decreto 780 de 2016** en Colombia.

La herramienta está optimizada para uso en campo (Offline), permitiendo a peritos, abogados y aseguradoras obtener liquidaciones precisas, consultar topes normativos y generar dictámenes preliminares instantáneos vía WhatsApp.

## 🚀 Características Técnicas (Core Features)

### 1. Motor de Cálculo "Live-Typing"
- **Automatización:** Elimina el botón "Calcular". El algoritmo procesa la entrada en tiempo real.
- **Lógica Matemática:** Implementa la curva de indemnización del Dec. 780 (14 salarios base + progresión aritmética).
- **Blindaje de Céntimos:** Implementación del signo `±` en todos los outputs financieros para denotar estimación técnica y proteger legalmente al usuario.

### 2. Base de Datos Maestra (Future-Proof)
- Arquitectura preparada para el futuro (2026 - 2030+).
- Configuración centralizada en objeto `DATA_HISTORICA` para actualización rápida de SMMLV y UVT sin tocar la lógica del núcleo.

### 3. Módulo de Tarifas Fijas & Topes
- Conversión automática de **SMLDV y UVT a Pesos Colombianos (COP)**.
- Incluye topes actualizados para:
  - Muerte y Gastos Funerarios (750 SMLDV).
  - Transporte de Víctimas (8.77 UVT).
  - Gastos Médicos Quirúrgicos (300 vs 800 SMLDV).

### 4. Generador de Dictámenes (WhatsApp API)
- Integra la API de WhatsApp para redactar informes automáticos.
- **Formato Jurídico:** Estructura limpia, sin emojis informales, con fundamento legal citado y datos de contacto corporativos.
- **Codificación Segura:** Uso de `encodeURIComponent` para garantizar la integridad del mensaje en cualquier dispositivo.

### 5. Seguridad & Rendimiento
- **CSP (Content Security Policy):** Cabeceras de seguridad inyectadas para mitigar ataques XSS e inyección de datos.
- **Modo Fallo Visual:** Background de seguridad (`#0a1931`) en caso de error de carga de assets gráficos.
- **Responsive:** Adaptabilidad 100% a muescas (Notch), teclados virtuales y pantallas pequeñas.

---

## ⚙️ Configuración y Mantenimiento

Para actualizar los valores económicos anuales, editar la constante `DATA_HISTORICA` en el script principal:

```javascript
const DATA_HISTORICA = {
    '2026': { smmlv: 1750905, uvt: 53000 },
    // Para activar 2027, descomentar y ajustar:
    // '2027': { smmlv: 1900000, uvt: 56000 },
};
