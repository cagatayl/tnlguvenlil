const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  try {
    const res = await axios.post('https://api.brightdata.com/request', {
      zone: 'ekap_unlocker1',
      url: 'https://www.ilan.gov.tr/ilan/kategori/9/ihale-duyurulari?tx=kamera&ct=59,44',
      format: 'raw',
      data_format: 'html'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 4b1e1d8b-5f2c-4799-b8e5-6babb22b2b97'
      }
    });
    console.log('Status:', res.status);
    const $ = cheerio.load(res.data);
    const items = $('.ilan-list-item, .card-ilan').toArray();
    console.log('Found:', items.length);
    
    if (items.length > 0) {
      const first = items[0];
      console.log('Text snippet:', $(first).text().replace(/\n/g, ' ').substring(0, 200));
    }
  } catch(e) { console.log('Err:', e.message); }
}
test();
