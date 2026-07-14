const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

async function test() {
  const query = 'site:ekap.kik.gov.tr "kamera" OR "güvenlik"';
  const url = 'https://www.google.com.tr/search?q=' + encodeURIComponent(query) + '&num=30';
  const token = '4b1e1d8b-5f2c-4799-b8e5-6babb22b2b97';
  
  try {
    const res = await axios.post('https://api.brightdata.com/request', {
      zone: 'serp_api1',
      url: url,
      format: 'raw',
      data_format: 'html'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    
    const $ = cheerio.load(res.data);
    const results = [];
    $('.yuRUbf').each((i, el) => {
      const a = $(el).find('a').first();
      const title = $(el).find('h3').text().trim();
      const link = a.attr('href') || '';
      results.push({ title, link });
    });
    console.log('Found:', results.length);
    console.log(results.slice(0, 5));
  } catch(e) { 
    console.log('Err', e.message); 
  }
}
test();
