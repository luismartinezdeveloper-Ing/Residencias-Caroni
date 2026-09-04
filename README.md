# Residencias Caroní · Altamira, Caracas
### Plataforma Digital Interactiva & Asesor Cognitivo para Bienes Raíces de Ultra-Lujo

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_Live-Multimodal-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production_Ready-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io)

---

## 🏛️ Descripción General

**Residencias Caroní** es una plataforma web interactiva de grado arquitectónico desarrollada para la comercialización privada y preventa de 8 exclusivas residencias unifamiliares de autor situadas en la **Transversal 8, entre 2da y 3ra Avenida de Altamira, Municipio Chacao, Caracas, Venezuela**, al pie del Parque Nacional El Ávila.

El software integra renderizado volumétrico 3D acelerado por WebGL, narrativa visual sincronizada por desplazamiento (*scroll-driven cinematic storytelling*), cotización financiera interactiva de cartas de intención (LOI) y un asesor inmobiliario impulsado por inteligencia artificial multimodal en tiempo real (**Gemini Live API y TTS**).

---

## 🌟 Módulos y Capacidades Técnicas

### 1. Cinemática Interactiva Dual (Scroll & Auto-Reel)
- **Motor Híbrido de Reproducción:** Permite exploración fotograma a fotograma vinculada al scroll vertical del usuario (`480vh`), o reproducción continua automática (*idle reel*) tras 4 segundos de inactividad.
- **Transiciones Limpias Dip-to-Black:** Eliminación de artefactos visuales de superposición mediante curvas de opacidad no lineales calculadas por `Framer Motion`.
- **Streaming Instantáneo (FastStart):** Videos codificados con reubicación de átomo `moov` al inicio del archivo y soporte HTTP `Range` (`206 Partial Content`), reduciendo el Time-to-First-Frame a milisegundos.

### 2. Maqueta Arquitectónica 3D (Three.js & WebGL)
- Visualización volumétrica en tiempo real del conjunto residencial.
- Iluminación física fotométricamente calibrada con simulación de luz solar cenital y sombras suaves.
- Cotas topográficas (+920.00 M.S.N.M.) y segmentación interactiva por niveles y tipologías de unidades.

### 3. Asesor Cognitivo Multimodal (Google Gemini)
- **Voz Bidireccional en Tiempo Real:** Comunicación mediante WebSocket seguro (`/api/live`) con protocolo PCM de baja latencia para interacción por voz natural.
- **Chat Inteligente con Streaming SSE:** Endpoint `/api/chat` con Server-Sent Events y arquitectura de reintento en cascada (`gemini-3.7-flash`, `gemini-3.1-pro-preview`, fallback local offline).
- **Sintetizador de Voz TTS:** Generación dinámica de audio con el modelo `gemini-3.1-flash-tts-preview` y perfiles de voz corporativos.

### 4. Simulador Financiero & Emisor de LOI
- Desglose financiero automatizado con esquema institucional:
  - **30%** a la firma del contrato de preventa.
  - **50%** prorrateado durante el cronograma de ejecución de obra (24 meses).
  - **20%** contra entrega y protocolización del inmueble.
- Generador y emisor de Carta de Intención (LOI) y descarga del Dossier Técnico Confidencial en formato PDF.

### 5. Arquitectura PWA & Resiliencia Offline
- Service Worker y Web App Manifest instalables en dispositivos móviles y de escritorio.
- Almacenamiento local seguro (`localStorage` + fallback) para registrar leads y compradores acreditados sin conexión, sincronizándose automáticamente al restablecer el acceso a la red.

---

## 📐 Diseño de Autor & Sistema de Diseño

La interfaz refleja la identidad arquitectónica sobria de **Añil Arquitectura**:

| Token / Elemento | Valor | Uso |
| :--- | :--- | :--- |
| **Color Primario** | `#1B1813` | Fondo oscuro institucional, elegancia y contraste |
| **Acento Dorado** | `#8C7452` / `#C9A86A` | Detalles arquitectónicos, cotas, acentos activos |
| **Color Fondo Claro** | `#EFEBE0` / `#FAF9F6` | Papel técnico, planos, esquemas tipográficos |
| **Tipografía Titulares** | *EB Garamond* (Serif) | Presencia editorial clásica y nobleza institucional |
| **Tipografía Funcional** | *Inter* (Sans-serif) | Datos numéricos, cotas técnicas y legibilidad UI |

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, TypeScript 5.8, Vite 6.2, Tailwind CSS v4.
- **Gráficos & Animaciones:** Three.js 0.185, Motion (Framer Motion 12), Lucide React.
- **Inteligencia Artificial:** `@google/genai` (SDK oficial de Google GenAI), Gemini Live Audio WebSocket.
- **Backend de Desarrollo & Node:** Express 4.21, WebSocket Server (`ws`), `tsx`.
- **Despliegue Serverless (Edge / Vercel):** `@vercel/node`, Serverless Functions en `/api`.

---

## 📂 Arquitectura de Directorios

```
Residencias-Caroni/
├── api/                     # Serverless Functions desplegables en Vercel
│   ├── chat.ts              # Endpoint streaming SSE para Gemini AI
│   ├── leads.ts             # Captura y validación de acreditaciones (Webhook CRM)
│   └── tts.ts               # Endpoint de generación de audio Gemini TTS
├── public/                  # Archivos estáticos y multimedia pública
│   ├── videos/              # Tomas cinematográficas 1080p Full HD optimizadas
│   │   ├── Camera_rotating_around_building.mp4
│   │   ├── Building_transforms_into_luxury.mp4
│   │   └── vFirst_person_wide_angle_archi.mp4
│   ├── icon.svg             # Isotipo y favicons vectoriales
│   └── manifest.webmanifest # Manifiesto de aplicación web progresiva (PWA)
├── src/
│   ├── components/
│   │   ├── modals/          # Maqueta 3D, Asesor IA, Acreditación de Comprador
│   │   ├── sections/        # Cinemática, Alzados arquitectónicos, Inversión, Contacto
│   │   └── ui/              # Planos, isotipos institucionales, HUD interactivo
│   ├── services/            # Gestión de leads y sincronización con hojas de cálculo / CRM
│   ├── utils/               # Clientes Web Audio API y WebSocket de voz en tiempo real
│   ├── App.tsx              # Componente principal con ScrollSpy y orquestación
│   └── main.tsx             # Punto de montaje del Virtual DOM
├── server.ts                # Servidor Node.js para desarrollo local y contenedores
├── vercel.json              # Configuración de rutas, rewrites SPA y cabeceras CDN
├── vite.config.ts           # Configuración de bundler con manual chunking
├── tsconfig.json            # Configuración de compilador TypeScript estricto
└── package.json             # Manifiesto de dependencias y scripts de construcción
```

---

## 🚀 Puesta en Marcha (Instalación Local)

### Prerrequisitos
- **Node.js:** Versión 18.0.0 o superior (recomendado Node 20+ LTS).
- **NPM** versión 9+.
- Clave de API de Gemini obtenible en [Google AI Studio](https://aistudio.google.com/).

### 1. Clonación del Repositorio
```bash
git clone https://github.com/luismartinezdeveloper-Ing/Residencias-Caroni.git
cd Residencias-Caroni
```

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto tomando como referencia el siguiente esquema:
```env
# Clave requerida para el Asesor Cognitivo Gemini y TTS
GEMINI_API_KEY=tu_clave_de_api_aqui

# Puerto de ejecución local (opcional, por defecto 3000)
PORT=3000

# Integración opcional con CRM externo
CRM_WEBHOOK_URL=https://tu-crm.com/api/leads/webhook
```

### 4. Ejecución en Modo Desarrollo
```bash
npm run dev
```
Abre tu navegador en `http://localhost:3000` (o el puerto configurado).

### 5. Compilación de Producción
```bash
npm run build
```
Genera los bundles minificados en `dist/` con división de código (*code-splitting*) automática en módulos proveedores (`react-vendor`, `three-vendor`, `motion-vendor`, `icons-vendor`).

---

## ☁️ Despliegue en Producción (Vercel)

El proyecto incluye configuración nativa lista para desplegar en **Vercel**:

1. Vincula el repositorio de GitHub en el panel de Vercel.
2. Añade la variable de entorno en **Settings > Environment Variables**:
   - `GEMINI_API_KEY`
   - `CRM_WEBHOOK_URL` *(opcional)*
3. Vercel ejecutará automáticamente `vite build` y desplegará las funciones de `/api` en su red Edge global con cabeceras de optimización multimedia (`Accept-Ranges`, `Cache-Control: public, max-age=31536000`).

---

## 🔒 Seguridad y Buenas Prácticas

- **Permissions-Policy estricta:** Acceso delimitado a `microphone=(self)` y `xr-spatial-tracking=(self)` únicamente en orígenes seguros.
- **Protección contra ataques comunes:** Cabeceras HTTP `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` y `Referrer-Policy: strict-origin-when-cross-origin`.
- **Cero exposición de secretos:** La clave `GEMINI_API_KEY` se procesa exclusivamente en el backend serverless, evitando cualquier filtración en el bundle de cliente.

---

## 👨‍💻 Créditos y Autoría

- **Concepción, Arquitectura & Urbanismo:**  
  **Añil Arquitectura** — *Arq. Juan Carlos Láncara*
- **Ingeniería de Software, Arquitectura Web & Experiencia Interactiva:**  
  **Ing. Luis Martinez**  
  📫 Contacto: [luismartinez.developer@gmail.com](mailto:luismartinez.developer@gmail.com)  
  💼 GitHub: [@luismartinezdeveloper-Ing](https://github.com/luismartinezdeveloper-Ing)

---

## 📄 Licencia y Confidencialidad
© 2026 **Residencias Caroní**. Todos los derechos reservados.  
Documentación confidencial y privada desarrollada para la comercialización inmobiliaria de ultra-lujo en Altamira, Caracas. Prohibida su reproducción o distribución sin autorización expresa.
