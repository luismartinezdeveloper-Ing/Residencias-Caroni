const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('Page error: ', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });

  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  
  try {
    // scroll down
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(500);
    
    // Click PORTAL ASESOR
    await page.click('text="PORTAL ASESOR"');
    console.log('Clicked PORTAL ASESOR');
    await page.waitForTimeout(500);
    
    // scroll down again
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(500);

    // Click MODO GALERÍA to toggle off
    await page.click('text="MODO GALERÍA"');
    console.log('Clicked MODO GALERÍA');
    await page.waitForTimeout(500);
  } catch (e) {
    console.log('Test interaction failed:', e.message);
  }
  
  await browser.close();
})();
