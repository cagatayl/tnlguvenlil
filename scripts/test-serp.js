const axios = require('axios');
const fs = require('fs');

async function test() {
  const query = 'site:ilan.gov.tr "kamera" OR "güvenlik"';
  const url = 'https://www.google.com.tr/search?q=' + encodeURIComponent(query) + '&num=30';
  const token = '4b1e1d8b-5f2c-4799-b8e5-6babb22b2b97';
  
  try {
    console.log('Sending request to SERP API...');
    const res = await axios.post('https://api.brightdata.com/request', {
      zone: 'serp_api1',
      url: url,
      format: 'raw',
      data_format: 'json'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      timeout: 60000
    });
    
    fs.writeFileSync('serp_test.json', JSON.stringify(res.data, null, 2), 'utf8');
    console.log('Saved JSON!');
    
  } catch(e) { 
    console.log('Err', e.message, e.response?.data); 
  }
}
test();
