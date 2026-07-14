const axios = require('axios');
const url = encodeURIComponent('https://ekap.kik.gov.tr/EKAP/Ortak/IhaleArama/index.html');
const key = '4b1e1d8b-5f2c-4799-b8e5-6babb22b2b97';

async function test() {
  try {
    console.log('Testing ZenRows...');
    const zRes = await axios.get(`https://api.zenrows.com/v1/?apikey=${key}&url=${url}`);
    if (zRes.status === 200) { console.log('✅ ZenRows works!'); return; }
  } catch(e) { console.log('ZenRows failed:', e.response?.status || e.message); }

  try {
    console.log('Testing ScraperAPI...');
    const sRes = await axios.get(`http://api.scraperapi.com?api_key=${key}&url=${url}`);
    if (sRes.status === 200) { console.log('✅ ScraperAPI works!'); return; }
  } catch(e) { console.log('ScraperAPI failed:', e.response?.status || e.message); }
  
  try {
    console.log('Testing ScrapingBee...');
    const bRes = await axios.get(`https://app.scrapingbee.com/api/v1/?api_key=${key}&url=${url}`);
    if (bRes.status === 200) { console.log('✅ ScrapingBee works!'); return; }
  } catch(e) { console.log('ScrapingBee failed:', e.response?.status || e.message); }
  
  console.log('Could not identify the service automatically.');
}
test();
