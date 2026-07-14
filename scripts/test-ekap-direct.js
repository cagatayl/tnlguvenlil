const axios = require('axios');
const fs = require('fs');

async function test() {
  const token = '4b1e1d8b-5f2c-4799-b8e5-6babb22b2b97';
  
  try {
    const res = await axios.post('https://api.brightdata.com/request', {
      zone: 'ekap_unlocker1',
      url: 'https://ekap.kik.gov.tr/EKAP/Ortak/IhaleArama/index.html',
      format: 'raw'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      timeout: 60000
    });
    
    fs.writeFileSync('ekap_direct.html', res.data, 'utf8');
    console.log('Saved to ekap_direct.html, length:', res.data.length);
  } catch(e) {
    console.log('Error:', e.message);
  }
}
test();
