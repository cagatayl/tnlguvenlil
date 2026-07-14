const fs=require('fs'); 
const cheerio=require('cheerio'); 
const data = JSON.parse(fs.readFileSync('serp_test.json', 'utf8')); 
const $ = cheerio.load(data);
const results = [];
$('.yuRUbf').each((i, el) => {
  const a = $(el).find('a').first();
  const title = $(el).find('h3').text();
  const link = a.attr('href');
  
  // Snippet is usually in the parent or next sibling of yuRUbf, class VwiC3b or something
  // Or just find the closest parent with max width and get text
  const container = $(el).parent().parent();
  let snippet = container.find('div[style*=\"-webkit-line-clamp\"]').text() || container.text().replace(title, '').substring(0, 150);
  
  results.push({ title, link, snippet });
});
console.log(results.slice(0, 2));
