# ⚖️ Calculadora PCL SOAT | SISTROVIAL.LEGAL

> **Herramienta Forense Digital para el cálculo de indemnizaciones SOAT en Colombia.**
> *Powered by Forensics Crash S.A.S*

![Version](https://img.shields.io/badge/version-3.2-blue.svg) ![PWA](https://img.shields.io/badge/Type-PWA-success.svg) ![Status](https://img.shields.io/badge/Status-Production-green.svg)

## 📖 Descripción del Proyecto

Esta aplicación es una **Calculadora Progresiva Web (PWA)** diseñada específicamente para abogados, peritos forenses y liquidadores de seguros. Permite calcular de manera exacta e instantánea el valor de la indemnización por **Pérdida de Capacidad Laboral (PCL)** bajo el amparo del SOAT, cumpliendo estrictamente con la normativa colombiana vigente (**Decreto 780 de 2016**).

Su diseño "Premium" y su arquitectura técnica garantizan funcionamiento **Offline** (sin internet), adaptabilidad total a dispositivos móviles (iOS/Android) y una experiencia de usuario de alta gama.

## 🚀 Enlaces de Acceso

- **🔗 Link de Uso (App en Vivo):** [https://prismalab-arm64.github.io/CALCULADORA-PCL-SOAT/](https://prismalab-arm64.github.io/CALCULADORA-PCL-SOAT/)
- **💻 Repositorio Oficial:** [https://github.com/PrismaLab-arm64/CALCULADORA-PCL-SOAT.git](https://github.com/PrismaLab-arm64/CALCULADORA-PCL-SOAT.git)

---

## 🛠️ Novedades de la Versión 3.2

Esta versión incluye una auditoría técnica completa y mejoras de experiencia de usuario (UX/UI):

### 🎨 Interfaz & Diseño (UI)
- **Estilo "Glassmorphism":** Inputs con efecto de cristal esmerilado sobre fondo dinámico.
- **Identidad Corporativa:** Integración de la imagen de "Dama de la Justicia" con filtros de marca azul profundo (`#0a1931`).
- **Jerarquía Visual:** Títulos optimizados para lectura rápida en campo.

### 📱 Adaptabilidad Móvil (Responsive)
- **Soporte "Notch" & Isla Dinámica:** Ajuste de *safe-areas* para iPhones modernos.
- **Teclado Seguro:** Diseño flexible (`100dvh`) que evita que el teclado oculte el campo de entrada.
- **Anti-Zoom iOS:** Ajuste de fuentes a 16px para evitar zoom involuntario en iPhone.

### 🧠 Lógica Forense Estricta (Backend Logic)
Se implementó el algoritmo exacto del **Decreto 780 de 2016**:
1.  **0% - 0.99%:** Sin indemnización.
2.  **1% - 5%:** Pago fijo de **14 SMDLV**.
3.  **5.01% - 50%:** Fórmula progresiva: `14 + ((PCL_Redondeado - 5) * 3.5)`.
4.  **> 50% (Invalidez):** Tope máximo legal de **180 SMDLV**.

---

## 📲 Instalación (Cómo usarla)

Al ser una **PWA**, no requiere descargas de tiendas.

### En Android (Chrome)
1. Ingresa al [Link de Uso](https://prismalab-arm64.github.io/CALCULADORA-PCL-SOAT/).
2. Toca los tres puntos (menú) ➡️ **"Instalar aplicación"** o "Agregar a pantalla principal".

### En iOS (Safari)
1. Ingresa al [Link de Uso](https://prismalab-arm64.github.io/CALCULADORA-PCL-SOAT/).
2. Toca el botón "Compartir" (cuadrado con flecha) ➡️ **"Agregar al Inicio"**.

---

## ⚙️ Stack Tecnológico

- **HTML5 Semántico:** Estructura optimizada.
- **CSS3 Moderno:** Variables CSS, Flexbox, Glassmorphism y Media Queries avanzadas.
- **JavaScript (ES6+):** Lógica de cálculo en tiempo real y manejo del DOM.
- **Service Workers:** Cacheo de recursos para funcionamiento **100% Offline**.
- **Manifest JSON:** Configuración nativa para instalación en móviles.

---

## 👨‍💻 Autor y Créditos

Desarrollado por **Ing. John Alexander Skinner Susa**.
**Forensics Crash S.A.S** - *Villavicencio, Meta, Colombia.*

> *"La tecnología al servicio de la verdad pericial."*

---

© 2026 Forensics Crash S.A.S. Todos los derechos reservados.
