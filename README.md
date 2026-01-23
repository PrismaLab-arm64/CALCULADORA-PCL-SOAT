# 📱 Calculadora PCL SOAT - Forensics Crash Edition
**Versión Actual:** 1.2.0 (Secure Patch CSP v1.0) | **Build:** V17-Final
**Desarrollado por:** Ing. John A. Skinner S.

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
