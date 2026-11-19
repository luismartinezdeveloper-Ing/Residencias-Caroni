import { test, expect } from '@playwright/test';

/**
 * Suite End-to-End (E2E) — Residencias Caroní · Altamira, Caracas
 * Ingeniería de Software: Ing. Luis Martinez (luismartinez.developer@gmail.com)
 */

test.describe('Residencias Caroní · Plataforma Institucional E2E', () => {
  test('carga hero arquitectónico, video adaptativo e identidad visual', async ({ page }) => {
    await page.goto('/');

    // Esperar a que pase la cortina introductoria o aparezca la sección protagonista
    const heroSection = page.locator('#obra');
    await expect(heroSection).toBeVisible();

    const heroVideo = heroSection.locator('video').first();
    await expect(heroVideo).toBeVisible({ timeout: 10_000 });
    const src = await heroVideo.getAttribute('src');
    expect(src).toMatch(/residencias_caroni_master_film(_mobile)?\.mp4/);

    // Footer mantiene autoría institucional
    const footer = page.locator('footer');
    await expect(footer).toContainText(/RESIDENCIAS CARONÍ/i);
    await expect(footer).toContainText(/AÑIL ARQUITECTURA/i);
  });

  test('cambia idioma ES ↔ EN en el encabezado y persiste tras recargar', async ({ page }) => {
    await page.goto('/');

    // Revelar el encabezado desplazando hacia abajo
    await page.evaluate(() => window.scrollTo(0, 600));

    const langButton = page.locator('button[aria-label*="idioma" i], button[aria-label*="language" i]').first();
    await expect(langButton).toBeVisible({ timeout: 10_000 });
    await langButton.click();

    await expect(page.locator('#contacto')).toContainText(/Schedule Private Viewing|Private Advisory/i, {
      timeout: 5_000,
    });

    await page.reload();
    await expect(page.locator('#contacto')).toContainText(/Schedule Private Viewing|Private Advisory/i, {
      timeout: 5_000,
    });
  });

  test('galería usa <picture> con fuentes AVIF/WebP y sección de elevación responde', async ({ page }) => {
    await page.goto('/');

    const gallery = page.locator('#galeria');
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery).toBeVisible();

    // Verificar fuentes modernas <picture><source type="image/avif" ...>
    const avifSource = gallery.locator('picture source[type="image/avif"]').first();
    const webpSource = gallery.locator('picture source[type="image/webp"]').first();
    await expect(avifSource).toHaveAttribute('srcset', /\.avif(\?.*)?$/i);
    await expect(webpSource).toHaveAttribute('srcset', /\.webp(\?.*)?$/i);

    const elevation = page.locator('#elevacion');
    await elevation.scrollIntoViewIfNeeded();
    await expect(elevation).toBeVisible();
  });

  test('puerta de acceso (Lead Gate) abre, valida campos y cierra con Escape', async ({ page }) => {
    await page.goto('/');

    const open3DBtn = page.locator('button[title="Abrir Maqueta 3D Interactiva"], button[title="Open Interactive 3D Model"]').first();
    await open3DBtn.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Cierre accesible por teclado
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('asesor de dominio funciona sin conexión PWA (Catálogo Offline)', async ({ page, context }) => {
    await page.goto('/');

    const openAdvisorBtn = page.locator('button[aria-label="Abrir Asesor"], button[aria-label="Open Advisor"]').first();
    await expect(openAdvisorBtn).toBeVisible({ timeout: 10_000 });
    await openAdvisorBtn.click();

    const advisorDialog = page.locator('[role="dialog"][aria-label*="Caroní"]').first();
    await expect(advisorDialog).toBeVisible();

    // Simular pérdida total de red y consultar el catálogo offline verificado
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));

    await expect(advisorDialog).toContainText(/Catálogo Offline|Offline Catalog/i, { timeout: 5_000 });

    const input = advisorDialog.locator('input[type="text"], textarea').first();
    await input.fill('¿Qué unidades están disponibles y qué áreas tienen?');
    const sendBtn = advisorDialog.locator('button[aria-label*="Enviar" i], button[aria-label*="Send" i]').first();
    await sendBtn.click();

    await expect(advisorDialog).toContainText(/Jardín|Mirador|m²/i, { timeout: 5_000 });

    await context.setOffline(false);
  });

  test('catálogo de componentes UI (?docs=ui) renderiza tokens y enlace de retorno', async ({ page }) => {
    await page.goto('/?docs=ui');

    await expect(page.locator('h1')).toContainText(/Design System & Componentes/i);
    await expect(page.getByText('#EFEBE0')).toBeVisible();
    await expect(page.getByText('#8C7452')).toBeVisible();
    await expect(page.getByText(/ING\. LUIS MARTINEZ/i)).toBeVisible();
  });
});
