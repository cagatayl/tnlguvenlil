const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('ilan_test.html', 'utf8');
const $ = cheerio.load(html);

const items = $('ilan-karti, .ilan-list-item, .card, app-ilan-list-item').toArray();
console.log('Items found:', items.length);

$('ilan-karti, app-ilan-list-item, .ilan-karti, .ilan-list-item').each((i, el) => {
  console.log('Title:', $(el).find('h3, .title, .ilan-title, a').text().trim().replace(/\\s+/g, ' ').substring(0, 80));
  console.log('City:', $(el).find('ilan-sehir, .city, .il, .location, span.d-block').text().trim().replace(/\\s+/g, ' ').substring(0, 50));
  console.log('Link:', $(el).find('a').attr('href'));
  console.log('---');
});
