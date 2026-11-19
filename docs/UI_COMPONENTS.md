# Catálogo de Componentes UI & Design System — Residencias Caroní

**Proyecto:** Residencias Caroní · Altamira, Caracas  
**Arquitectura:** Añil Arquitectura — Arq. Juan Carlos Láncara  
**Ingeniería de Software & Experiencia Digital:** Ing. Luis Martinez (`luismartinez.developer@gmail.com`)

---

## Acceso Interactivo

La guía visual interactiva de tokens y componentes vive en la ruta lazy-loaded:

```text
/?docs=ui
```

No incrementa el peso del bundle inicial de la landing principal (`src/App.tsx` la carga con `React.lazy`).

---

## 1. Tokens de Diseño

- **Superficies:** `#FAF9F6` (Papel Institucional), `#EFEBE0` (Crema Bone), `#1B1813` (Tinta Oscura).
- **Acento Estructural:** `#8C7452` (Bronce) y `#C9A86A` (Oro cálido en acentos oscuros).
- **Tipografías:** `EB Garamond` (`font-serif`), `Inter` (`font-sans`), Monoespaciada técnica (`font-mono`).

---

## 2. Inventario de Componentes Principales

| Componente | Ubicación | Responsabilidad |
| :--- | :--- | :--- |
| `ExperienceHeader` | `src/components/layout/ExperienceHeader.tsx` | Barra superior fija Apple-Glass, ScrollSpy y selector bilingüe `ES/EN`. |
| `CinematicScrollNarrative` | `src/components/sections/CinematicScrollNarrative.tsx` | Hero en video adaptable (`7.5 MB` stream móvil/lento vs `22 MB` master + selector 4K SR). |
| `HorizontalGallery` | `src/components/sections/HorizontalGallery.tsx` | Galería horizontal por categoría con `OptimizedPicture` (AVIF/WebP + `IntersectionObserver`). |
| `OptimizedPicture` | `src/components/ui/OptimizedPicture.tsx` | Elemento `<picture>` progresivo con prioridades `eager/lazy` y respaldo automático. |
| `InteractiveElevationViewer` | `src/components/sections/InteractiveElevationViewer.tsx` | Visor interactivo de alzados y selección de las 8 residencias. |
| `Architectural3DModal` | `src/components/modals/Architectural3DModal.tsx` | Maqueta 3D con barrel tree-shaken (`src/components/modals/3d/three.ts`), DRACO/KTX2, vistas solares y modo explosivo. |
| `AIChatbot` | `src/components/modals/AIChatbot.tsx` | Asesor conversacional + voz Gemini Live API con detección online/offline y catálogo local `aiDomainFallback.ts`. |
| `LeadGateModal` | `src/components/modals/LeadGateModal.tsx` | Registro y validación VIP para desbloquear maqueta 3D, planos e inversión. |
| `MaintenanceBanner` | `src/components/ui/MaintenanceBanner.tsx` | Banner condicional de recuperación conectado a `useServiceRecoveryMonitor`. |
| `ComponentCatalog` | `src/components/docs/ComponentCatalog.tsx` | Estilo visual vivo, paleta copiable, tipografía y contador de eventos locales del embudo. |

---

## 3. Accesibilidad, Analítica y Calidad

- **WCAG 2.2 AA:** Validado automáticamente mediante `axe-core` en `src/__tests__/app.a11y.test.tsx`.
- **Analítica sin PII:** `src/services/analyticsService.ts` elimina campos sensibles (`email`, `phone`, `token`, etc.), respeta `Do Not Track` y despacha a GA4, Plausible o `/api/analytics`.
- **Tests E2E:** Suite Playwright en `e2e/residencias-caroni.spec.ts` (`npm run test:e2e`).
