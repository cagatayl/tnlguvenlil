const puppeteer = require('puppeteer');

(async () => {
  console.log('Testing EKAPv2 with headless: false');
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto('https://ekapv2.kik.gov.tr/ekap/search', { waitUntil: 'networkidle2' });
    console.log('Page loaded successfully!');
    
    // Check if there's any search input
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body Text Snippet:', bodyText.substring(0, 200));
    
    await browser.close();
  } catch(e) {
    console.error('Failed:', e);
    await browser.close();
  }
})();
