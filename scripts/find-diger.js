const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../../hedef_bayi_ip_bullet_kameralar (1).csv');
const csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.split('\n').slice(1);

function parseFields(line) {
  const fields = [];
  let f = '', q = false;
  for (const c of line.replace(/\r/g, '')) {
    if (c === '"') { q = !q; continue; }
    if (c === ';' && !q) { fields.push(f); f = ''; continue; }
    f += c;
  }
  fields.push(f);
  return fields;
}

// CSV'deki Kategori sütunu index=4 — hepsi "IP Bullet Kamera" olarak girilmiş
// Şimdi initialData.json'dan Diğer Ürünler'i bul
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/initialData.json'), 'utf-8'));
const diger = data.ticari_urunler.filter(u => u.anaKategori === 'Diğer Ürünler');
console.log(`Toplam "Diğer Ürünler": ${diger.length}`);
console.log('\nİlk 80 "Diğer" ürün:');
diger.slice(0, 80).forEach((u, i) => console.log(`${(i+1).toString().padStart(3)}. ${u.kod} | ${u.ad}`));
