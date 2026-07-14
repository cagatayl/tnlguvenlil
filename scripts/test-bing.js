const axios = require('axios');
const fs = require('fs');
async function test() {
  const query = 'site:ilan.gov.tr "kamera" OR "güvenlik"';
  const url = 'https://www.bing.com/search?q=' + encodeURIComponent(query);
  const token = '4b1e1d8b-5f2c-4799-b8e5-6babb22b2b97';
  try {
    const res = await axios.post('https://api.brightdata.com/request', {
      zone: 'ekap_unlocker1',
      url: url,
      format: 'raw'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    fs.writeFileSync('bing_test.html', res.data, 'utf8');
    console.log('Saved to bing_test.html');
  } catch(e) { console.log('Err', e.message); }
}
test();
