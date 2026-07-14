const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('request', request => {
    if (request.url().includes('api') || request.method() === 'POST') {
      console.log('>>>', request.method(), request.url(), request.postData());
    }
  });

  page.on('response', async response => {
    if (response.url().includes('api') || response.request().method() === 'POST') {
      console.log('<<<', response.status(), response.url());
      try {
        const text = await response.text();
        console.log('Response body snippet:', text.substring(0, 200));
      } catch (e) { }
    }
  });

  console.log('Navigating to ekapv2.kik.gov.tr/ekap/search...');
  await page.goto('https://ekapv2.kik.gov.tr/ekap/search', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
