const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const targetCities = [
  'MALATYA', 'ELAZIĞ', 'DİYARBAKIR', 'ŞANLIURFA', 'GAZİANTEP', 
  'MARDİN', 'ADIYAMAN', 'BATMAN', 'BİNGÖL', 'TUNCELİ', 'ŞIRNAK', 'SİİRT', 'HAKKARİ', 'VAN', 'BİTLİS', 'MUŞ', 'AĞRI', 'IĞDIR', 'KARS', 'ARDAHAN', 'ERZURUM', 'ERZİNCAN'
];

async function fetchGoogleCity(city) {
  const query = `site:ekap.kik.gov.tr "kamera" OR "güvenlik" "${city}"`;
  const url = 'https://www.google.com.tr/search?q=' + encodeURIComponent(query) + '&num=10';
  const token = '4b1e1d8b-5f2c-4799-b8e5-6babb22b2b97';
  
  let retries = 3;
  while (retries > 0) {
    try {
      console.log(`🌐 [${city}] Bright Data SERP API üzerinden aranıyor... (Kalan Deneme: ${retries})`);
      const res = await fetch('https://api.brightdata.com/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          zone: 'serp_api1',
          url: url,
          format: 'raw',
          data_format: 'html'
        })
      });
      
      if (!res.ok) throw new Error('Bright Data Hatası: ' + res.status + ' - ' + res.statusText);
      return await res.text();
    } catch (e) {
      retries--;
      if (retries === 0) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function scrapeTenders() {
  console.log('🤖 TNL İhale Botu Başlatılıyor... (EKAP + Bright Data SERP API)');
  let allIhaleler = [];
  
  // Sadece en çok aranan 5 doğu ilini hızlı tarayalım ki timeout olmasın
  const fastCities = ['ŞANLIURFA', 'MARDİN', 'ELAZIĞ', 'MALATYA', 'DİYARBAKIR'];

  for (const city of fastCities) {
    try {
      const html = await fetchGoogleCity(city);
      const $ = cheerio.load(html);
      
      $('.yuRUbf').each((i, el) => {
        const a = $(el).find('a').first();
        let title = $(el).find('h3').text().trim();
        const link = a.attr('href') || '';
        
        const container = $(el).parent().parent();
        let snippet = container.find('div[style*="-webkit-line-clamp"]').text() || container.text().replace(title, '').substring(0, 150);
        
        // Google başlığı genelde "EKAP - Bir Bakışta İhale" oluyor. 
        // Gerçek başlık snippet'in ilk cümlesinde oluyor.
        if (title.includes('Bir Bakışta İhale') || title.includes('Mahkeme Kararları')) {
           if (snippet.length > 10) {
             title = snippet.split('.')[0] + '...';
           }
        }
        
        if (title.length > 5 && link.includes('ekap.kik.gov.tr')) {
          allIhaleler.push({
            baslik: title,
            kurum: 'Kamu Kurumu (EKAP)',
            il: city,
            tarih: new Date().toLocaleDateString('tr-TR'),
            sonTarih: 'Belirtilmedi',
            link: link
          });
        }
      });
      
      // Delay to avoid overwhelming the proxy
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.log(`❌ Hata (${city}):`, e.message);
    }
  }

  const uniqueIhaleler = Array.from(new Map(allIhaleler.map(item => [item.baslik + item.il, item])).values());
  console.log(`🎉 Başarılı! Toplam ${uniqueIhaleler.length} adet EKAP ihalesi kaydedildi.`);

  const outputPath = path.join(__dirname, '..', 'public', 'ekap-data.json');
  fs.writeFileSync(outputPath, JSON.stringify({ ihaleler: uniqueIhaleler }, null, 2), 'utf-8');
}

scrapeTenders();
