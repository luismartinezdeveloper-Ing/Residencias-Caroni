# Implementation Plan — Auditoría y Corrección Integral con Recuperación Silenciosa

## 1. Overview
Este plan establece la estrategia de corrección integral y blindaje operativo para la plataforma digital interactiva de **Residencias Caroní · Altamira, Caracas** (Arquitectura: **Añil Arquitectura — Arq. Juan Carlos Láncara** · Ingeniería de Software y Experiencia Interactiva: **Ing. Luis Martinez**). El objetivo es eliminar puntos de fallo en escritorio y dispositivos móviles (iOS Safari, Android Chrome y contenedores web) mediante **recuperación automática silenciosa y motores de respaldo local**, garantizando que el inversionista nunca perciba interrupciones técnicas durante la exploración del proyecto.

## 2. Architecture & System Design
El sistema implementará una arquitectura de **Resiliencia Multicapa con Degradación Elegante (Silent Self-Healing)** tanto en el cliente como en el servidor:

```text
+-----------------------------------------------------------------------------------+
|                   CLIENTE WEB & MÓVIL (ESCRITORIO / iOS / ANDROID)                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [1. Hero & Galería]       [2. Visor 3D WebGL]       [3. Asesor IA & Voz]         |
|   - Auto-recuperación       - Monitor de contexto     - Cascada Gemini 3.8        |
|     ante stall/suspend        (contextlost/restored)  - Fallback AudioWorklet ->  |
|   - Fallback silencioso     - Reducción adaptativa      ScriptProcessorNode       |
|     a Poster HD si            de DPR en móviles       - Reconexión WS silenciosa  |
|     Modo Ahorro bloquea     - Respaldo 2D Técnico       y conserje local offline  |
|     autoplay                  automático sin crash                                |
|                                                                                   |
|  [4. Simulador LOI, Acreditación & Dossier PDF]                                   |
|   - Cola Outbox Transaccional en LocalStorage con reintento exponencial           |
|   - Acreditación inmediata sin bloqueo si la red fluctúa                          |
|   - Generación de Dossier/LOI 100% autónoma en cliente                            |
+-----------------------------------------+-----------------------------------------+
                                          |
                          HTTPS / SSE / WebSocket (WSS)
                                          v
+-----------------------------------------------------------------------------------+
|                        SERVIDOR FULL-STACK & PROXY SEGURO                         |
+-----------------------------------------------------------------------------------+
|  - Modelos actualizados (@google/genai):                                          |
|      * Chat SSE: gemini-3.8-flash -> gemini-3.1-flash-lite -> Respaldo Local      |
|      * Voz en Vivo: gemini-3.8-live con reconexión y control de sesión            |
|      * Síntesis TTS: gemini-3.8-flash-lite-tts con degradación silenciosa         |
|  - Cabeceras CSP/Permissions-Policy compatibles con iframes, Safari y Android     |
|  - Persistencia atómica de Leads con auto-reparación de JSON corrupto             |
+-----------------------------------------------------------------------------------+
```

## 3. Core Features
- **Actualización y Blindaje de Motores de IA y Voz (Servidor y Cliente):**
  - Actualización de la cascada de modelos a las versiones vigentes (`gemini-3.8-flash` y `gemini-3.1-flash-lite` para chat en streaming, `gemini-3.8-live` para voz bidireccional en tiempo real, y `gemini-3.8-flash-lite-tts` para síntesis de voz), eliminando parámetros obsoletos que provocan errores HTTP 400/404.
  - Respaldo automático en captura de micrófono: si `AudioWorklet` falla o es restringido en navegadores móviles o vistas embebidas, conmutación instantánea y silenciosa a procesamiento PCM compatible y reconexión automática del WebSocket.
  - Si la red o el servicio externo no están disponibles en `/api/chat` o `/api/tts`, activación transparente del motor de conocimiento arquitectónico local sin mostrar errores crudos al usuario.
- **Recuperación Automática del Visor 3D Volumétrico y Planos Técnicos:**
  - Captura preventiva de los eventos `webglcontextlost` y `webglcontextrestored` en el lienzo Three.js para restaurar la escena automáticamente cuando el navegador móvil libera memoria GPU al cambiar de pestaña.
  - Ajuste dinámico de resolución (`devicePixelRatio` acotado en móviles) y conmutación silenciosa a la vista de Planos y Cotas Técnicas 2D si el hardware del dispositivo agota los recursos gráficos.
- **Estabilidad de Video Cinemático Hero y Limpieza de Caché PWA:**
  - Mecanismo de auto-recuperación ante eventos `stalled`, `suspend` o bloqueos de reproducción automática en modo de bajo consumo (iOS/Android), asegurando transición fluida entre el póster arquitectónico de alta resolución y el film maestro.
  - Purga automática al iniciar la aplicación de registros antiguos de Service Worker en navegadores de clientes recurrentes para evitar colisiones de recursos en caché.
- **Resiliencia Transaccional en Formulario LOI, Lead Gate y Descarga PDF:**
  - Cola de sincronización silenciosa (`Outbox`) con reintento automático al detectar reconexión (`online`) y al iniciar sesión, garantizando que toda solicitud de acreditación o reserva quede respaldada localmente al instante y desbloquee el acceso sin esperas ni mensajes de fallo.
  - Blindaje del generador de Dossier y Carta de Intención (LOI) frente a errores de carga de fuentes o imágenes cruzadas.
- **Error Boundary Global Silencioso:**
  - Contenedor de protección de interfaz que intercepta cualquier excepción de renderizado en componentes diferidos (`lazy`) y restablece el estado de la vista sin dejar la pantalla en blanco.

## 4. Visual Direction
Se preservará íntegramente la estética institucional sobria de autor definida para **Residencias Caroní**:
- **Paleta Cromática:** Carbón arquitectónico (`#1B1813` y `#14120E`), Bronce cálido (`#8C7452` y `#C9A86A`), y Piedra caliza / Marfil (`#FAF9F6` y `#EFEBE0`).
- **Tipografía:** `EB Garamond` para titulares editoriales, `Inter` para lectura funcional, y fuente monoespaciada para cotas técnicas y métricas financieras.
- **Comportamiento de Estado:** Cero alertas invasivas o mensajes de error técnico; las transiciones hacia modos de respaldo ocurrirán de forma orgánica e imperceptible dentro de la misma interfaz editorial, manteniendo visible en todo momento la autoría de **Añil Arquitectura — Arq. Juan Carlos Láncara** y el desarrollo del **Ing. Luis Martinez**.

## 5. Technical Decisions & Trade-offs
- **Recuperación Silenciosa vs. Notificaciones de Error:** En lugar de interrumpir la experiencia con modales de fallo cuando una red móvil pierde paquetes o el navegador restringe un API de hardware, el sistema conmuta internamente al motor local de respaldo (conserje de dominio local, vista técnica 2D, o síntesis vocal nativa del navegador), priorizando la continuidad comercial de la preventa.
- **Doble Motor de Captura de Audio (`AudioWorklet` + Fallback):** Aunque `AudioWorklet` ofrece menor latencia en escritorio, ciertos entornos WebView e iOS presentan restricciones con módulos `blob:`. Mantener un respaldo automático garantiza compatibilidad universal entre escritorio y dispositivos móviles.
- **Hidratación y Limpieza de Caché en Cliente:** Desregistrar cachés heredados al montar la aplicación evita que dispositivos que visitaron versiones previas retengan fragmentos antiguos de código o video, asegurando consistencia inmediata tras cada despliegue.
