import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    let ihaleler: any[] = [];
    const url = payload.url || '';

    // Eğer eklenti zaten parse edip gönderdiyse direkt onu kullanalım (EKAP v2 için)
    if (payload.ihaleler && Array.isArray(payload.ihaleler)) {
      ihaleler = payload.ihaleler;
    } else {
      const html = payload.html || '';
      const $ = cheerio.load(html);

    // URL'e göre parser seçimi
    if (url.includes('ilan.gov.tr')) {
      // ilan.gov.tr parser
      const items = $('.ilan-list-item, .card-ilan').toArray();
      items.forEach(el => {
        const title = $(el).find('h3, .title, .ilan-baslik').text().trim();
        const kurum = $(el).find('.description, .kurum, .satici').text().trim();
        const il = $(el).find('.city, .il, .location').text().trim().toUpperCase() || 'TÜRKİYE';
        const tarih = $(el).find('.date, .tarih, .zaman').text().trim() || new Date().toLocaleDateString('tr-TR');
        const link = $(el).find('a').attr('href') || '#';
        
        if (title) {
          ihaleler.push({ baslik: title, kurum: kurum || 'Kamu Kurumu', il, tarih, sonTarih: tarih, link });
        }
      });
    } else if (url.includes('ekapv2.kik.gov.tr') || url.includes('ekap.kik.gov.tr')) {
      // EKAP v2 genel parser
      // Ekapv2 genellikle div satırları veya tablo kullanır.
      // Ekap search result kartları veya tabloları:
      const rows = $('tr, .card, .list-item, .p-datatable-row').toArray();
      
      rows.forEach(el => {
        const textContent = $(el).text();
        // Sadece ihale kelimeleri geçen satırları alalım
        if (textContent.toLowerCase().includes('ihale') || $(el).find('a').length > 0) {
          const links = $(el).find('a');
          const title = links.first().text().trim() || $(el).find('.title, h4, h3, .bold').first().text().trim();
          
          if (title && title.length > 5) {
            let link = links.first().attr('href') || url;
            if (link.startsWith('/')) {
              link = 'https://ekap.kik.gov.tr' + link;
            }
            
            // Satırdaki diğer bilgileri bulmaya çalışalım
            // İl bilgisi genelde metin içinde olur
            const cities = ['MALATYA', 'ELAZIĞ', 'DİYARBAKIR', 'ŞANLIURFA', 'GAZİANTEP', 'MARDİN', 'ADIYAMAN', 'BATMAN', 'BİNGÖL', 'TUNCELİ'];
            let il = 'TÜRKİYE';
            for (let c of cities) {
              if (textContent.toUpperCase().includes(c)) {
                il = c; break;
              }
            }

            ihaleler.push({
              baslik: title,
              kurum: 'EKAP Kurumu (Otomatik Tarama)', // Detaylar için sayfa yapısı değişkendir, şimdilik genel
              il: il,
              tarih: new Date().toLocaleDateString('tr-TR'),
              sonTarih: 'Belirtilmedi',
              link: link
            });
          }
        }
      });
    } else {
      // Genel fallback (Eğer bilinmeyen bir siteyse)
      const links = $('a').toArray();
      links.forEach(el => {
        const title = $(el).text().trim();
        if (title.toLowerCase().includes('ihale') || title.toLowerCase().includes('kamera') || title.toLowerCase().includes('güvenlik')) {
          ihaleler.push({
            baslik: title,
            kurum: 'Web Taraması',
            il: 'TÜRKİYE',
            tarih: new Date().toLocaleDateString('tr-TR'),
            sonTarih: 'Belirtilmedi',
            link: $(el).attr('href') || url
          });
        }
      });
    }
    } // End of HTML parsing block

    // Doğu ve Güneydoğu Anadolu İlleri Listesi
    const targetCities = [
      'MALATYA', 'ELAZIĞ', 'DİYARBAKIR', 'ŞANLIURFA', 'GAZİANTEP', 
      'MARDİN', 'ADIYAMAN', 'BATMAN', 'BİNGÖL', 'TUNCELİ', 'ŞIRNAK', 'SİİRT', 'HAKKARİ', 'VAN', 'BİTLİS', 'MUŞ', 'AĞRI', 'IĞDIR', 'KARS', 'ARDAHAN', 'ERZURUM', 'ERZİNCAN'
    ];

    // Temizleme, tekilleştirme ve ŞEHİR FİLTRELEMESİ
    let uniqueIhaleler = Array.from(new Map(ihaleler.map(item => [item.baslik, item])).values());
    
    // Sadece hedef şehirlerdeki ihaleleri tutalım (Eğer il bulunamadıysa 'TÜRKİYE' olanları da dahil edebiliriz ama tam otomasyon için filtreleyelim)
    uniqueIhaleler = uniqueIhaleler.filter(item => {
      // Eğer il tam olarak tespit edilemediyse ama metin içinde geçiyorsa onu da alabiliriz, ama biz "il" alanına zaten atadık.
      return targetCities.includes(item.il) || item.il === 'TÜRKİYE';
    });

    // Eğer hiç ihale bulunamadıysa bile boş kaydetmeyelim, ama listeyi kaydedelim
    if (uniqueIhaleler.length === 0) {
      // Belki de sayfa yapısı farklıdır, dom içindeki tüm h3/h4/a ları alalım
      const allHeaders = $('h3, h4').toArray();
      allHeaders.forEach(el => {
        if($(el).text().trim().length > 10) {
          uniqueIhaleler.push({
            baslik: $(el).text().trim(),
            kurum: 'Bulunamadı',
            il: 'TÜRKİYE',
            tarih: new Date().toLocaleDateString('tr-TR'),
            sonTarih: '-',
            link: url
          });
        }
      });
    }

    // public klasörüne JSON kaydet
    const filePath = path.join(process.cwd(), 'public', 'ekap-data.json');
    fs.writeFileSync(filePath, JSON.stringify(uniqueIhaleler, null, 2));

    return NextResponse.json({ success: true, count: uniqueIhaleler.length });
  } catch (error: any) {
    console.error('EKAP Sync Hatası:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
