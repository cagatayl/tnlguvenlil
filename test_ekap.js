const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Puppeteer for EKAP...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://ekap.kik.gov.tr/EKAP/Ortak/IhaleArama/index.html', { waitUntil: 'networkidle2' });
  
  await page.screenshot({ path: 'ekap_screenshot.png' });
  console.log('Screenshot saved to ekap_screenshot.png');
  
  await browser.close();
})();
