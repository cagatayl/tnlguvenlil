const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

async function test() {
  const query = 'site:ekap.kik.gov.tr "kamera" OR "güvenlik" "ŞANLIURFA"';
  const url = 'https://www.google.com.tr/search?q=' + encodeURIComponent(query) + '&num=10';
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
      let title = $(el).find('h3').text().trim();
      const link = a.attr('href') || '';
      
      const container = $(el).parent().parent();
      let snippet = container.find('div[style*=\"-webkit-line-clamp\"]').text() || container.text().replace(title, '').substring(0, 150);
      
      // Extract real title from snippet
      if (title.includes('Bir Bakışta İhale') && snippet.length > 5) {
         title = snippet.split('.')[0] + '...';
      }
      
      results.push({ title, link, snippet, il: 'ŞANLIURFA' });
    });
    console.log('Found:', results.length);
    console.log(results.slice(0, 3));
  } catch(e) { 
    console.log('Err', e.message); 
  }
}
test();
