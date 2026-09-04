const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Sistemas\\.gemini\\antigravity-ide\\brain\\2ad84c02-91f7-403a-bf6d-80d0043cabe6';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('Launching browser with Edge...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. Capture Hero
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_hero.png') });
  console.log('Hero screenshot captured.');

  // 2. Scroll to interactive sections
  await page.evaluate(() => window.scrollBy(0, 900));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_elevation.png') });
  console.log('Elevation screenshot captured.');

  await page.evaluate(() => window.scrollBy(0, 900));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_termsheet.png') });
  console.log('Termsheet screenshot captured.');

  // Check interactive elements on page
  const pageData = await page.evaluate(() => {
    return {
      title: document.title,
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean),
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim()).filter(Boolean)
    };
  });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'page_data.json'), JSON.stringify(pageData, null, 2));

  await browser.close();
  console.log('Browser evaluation complete.');
}

run().catch(err => {
  console.error('Error during browser run:', err);
  process.exit(1);
});
