/**
 * Hedef Bayi kategorilerine göre ürün kategorilendirme
 * Kaynak: https://hedefbayi.com/shop/
 * Kategori yapısı siteden alınmıştır
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('path');

// CSV dosyasını oku
const csvPath = path.join(__dirname, '../../hedef_bayi_ip_bullet_kameralar (1).csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// CSV parse et
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].replace(/\r/g,'').split(';').map(h => h.replace(/^"|"$/g,''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].replace(/\r/g,'');
    if (!line.trim()) continue;
    // Handle semicolon-separated with quoted fields
    const fields = [];
    let field = '';
    let inQuote = false;
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '"') { inQuote = !inQuote; continue; }
      if (line[j] === ';' && !inQuote) { fields.push(field); field = ''; continue; }
      field += line[j];
    }
    fields.push(field);
    if (fields.length >= 4) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = fields[idx] || ''; });
      rows.push(row);
    }
  }
  return rows;
}

// HEDEFBAYİ.COM KATEGORİ HARİTASI
// Tam kategori ağacı siteden alınmıştır
function hedefBayiKategori(ad) {
  const u = (ad || '').toUpperCase().replace(/\s+/g,' ').trim();

  // ============ İP KAMERALAR ============
  // IP Speed Dome / PTZ
  if (/\bPTZ\b|SPEED DOME|DS-2SE|SD\d+[A-Z].*KAM/.test(u) && !/SWITCH/.test(u)) return 'İP Speed Dome Kamera';
  
  // IP Bullet Kamera
  if (/IPC-HFW|PC-HFW/.test(u)) return 'İP Bullet Kamera';
  if (/DS-2CD.*HFW|DS-2CD.*T26|DS-2CD.*T46|DS-2CD.*T47|BULLET.*IP|IP.*BULLET/.test(u)) return 'İP Bullet Kamera';
  if (/HIKVISION.*DS-2CD2T|SMARTLIGHT|COLORVU|COLORVUE|ACUSENSE|WIZSENSE/.test(u) && /BULLET|HFW|T\d{2}G/.test(u)) return 'İP Bullet Kamera';
  if (/DH-F2C.*IP|FULL.*HD.*IP.*BULLET/.test(u)) return 'İP Bullet Kamera';

  // IP Dome Kamera
  if (/IPC-HDW|IPC-HDBW|IPC-EW/.test(u)) return 'İP Dome Kamera';
  if (/DS-2CD.*HDW|DS-2CD.*TRQ|DS-2CD.*EW|DS-2CD.*EY|DS-2CD.*DF/.test(u)) return 'İP Dome Kamera';
  if (/DOME.*IP|IP.*DOME/.test(u)) return 'İP Dome Kamera';

  // Genel IP Kamera yakalama
  if (/\bIPC[-_]/.test(u) || /DS-2CD/.test(u)) return 'İP Bullet Kamera';

  // ============ AHD KAMERALAR ============
  // AHD Speed Dome
  if (/\bPTZ\b|SPEED DOME/.test(u) && /AHD|CVI|TVI|HDCVI|HDTVI|XVR/.test(u)) return 'AHD Speed Dome Kamera';
  
  // AHD Bullet
  if (/HAC-HFW|DH-HAC-HFW|HAC-B1/.test(u)) return 'AHD Bullet Kamera';
  if (/DS-2CE.*HFW|DS-2CE.*HIT|DS-2CE.*T28|AHD.*BULLET|ANALOG.*BULLET/.test(u)) return 'AHD Bullet Kamera';
  if (/BULLET/.test(u) && /AHD|CVI|TVI|HDCVI|HAC-|4IN1|4 IN 1/.test(u)) return 'AHD Bullet Kamera';

  // AHD Dome
  if (/HAC-HDW|DH-HAC-HDW|HAC-T1|DH-HAC-T/.test(u)) return 'AHD Dome Kamera';
  if (/DS-2CE.*HDW|DS-2CE.*TRQ|DS-2CE.*EW/.test(u)) return 'AHD Dome Kamera';
  if (/DOME/.test(u) && /AHD|CVI|TVI|HDCVI|HAC-|4IN1/.test(u)) return 'AHD Dome Kamera';
  if (/DH-HAC|HAC-/.test(u) && !/NVR|DVR|SWITCH/.test(u)) return 'AHD Dome Kamera';

  // ============ ARAÇ KAMERASI ============
  if (/ARAÇ KAMERA|MOBİL KAMERA|ARAÇ\s*GÜVENL|HC.*ARAÇ|M1PRO|S6\s*DHI|HC[0-9]+.*W.*ARAÇ|DAE-HC.*W/.test(u)) return 'Araç Kamerası';

  // ============ WIFI KAMERA (Daha Fazla menüsünde) ============
  if (/WIFI.*KAMERA|KAMERA.*WIFI|WİFİ.*CAM|DH-P[35]AE-PV.*4G/.test(u) && !/4G/.test(u)) return 'WiFi Kamera';
  if (/ARGUS|BATARYA.*KAMERA|DH-HPT|DH-F2C/.test(u)) return 'WiFi Kamera';

  // ============ 4G & SOLAR KAMERA ============
  if (/4G.*KAMERA|KAMERA.*4G|P[35]AE-PV-4G|4G.*MINI|SOLAR.*KAMERA|GÜNEŞ.*KAMERA/.test(u)) return '4G & Solar Kamera';

  // ============ NVR KAYIT CİHAZI ============
  if (/\bNVR\b/.test(u) || /DS-7[0-9]+NI|DHI-NVR|HC[0-9]+WVR/.test(u)) {
    if (/\b4\s*KANAL\b|4K\s*NVR|4PORT/.test(u)) return 'NVR Kayıt Cihazı (4 Kanal)';
    if (/\b8\s*KANAL\b/.test(u)) return 'NVR Kayıt Cihazı (8 Kanal)';
    if (/\b16\s*KANAL\b/.test(u)) return 'NVR Kayıt Cihazı (16 Kanal)';
    if (/\b32\s*KANAL\b/.test(u)) return 'NVR Kayıt Cihazı (32 Kanal)';
    if (/\b64\s*KANAL\b/.test(u)) return 'NVR Kayıt Cihazı (64 Kanal)';
    return 'NVR Kayıt Cihazı';
  }

  // ============ AHD XVR KAYIT CİHAZI ============
  if (/\bDVR\b|\bXVR\b/.test(u) || /DS-7[0-9]+HQ|DS-7[0-9]+HU|DHI-HCVR|DHI-XVR|EKRANSIZ/.test(u)) {
    if (/\b4\s*KANAL\b/.test(u)) return 'AHD XVR Kayıt Cihazı (4 Kanal)';
    if (/\b8\s*KANAL\b/.test(u)) return 'AHD XVR Kayıt Cihazı (8 Kanal)';
    if (/\b16\s*KANAL\b/.test(u)) return 'AHD XVR Kayıt Cihazı (16 Kanal)';
    if (/\b32\s*KANAL\b/.test(u)) return 'AHD XVR Kayıt Cihazı (32 Kanal)';
    return 'AHD XVR Kayıt Cihazı';
  }

  // ============ POE SWİTCH ============
  if (/PFS3[0-9]+|DH-CS4|DH-PFS|DS-3E|COREDATA|DH-PFS3/.test(u)) {
    if (/\b4\s*PORT|\b4PORT/.test(u)) return 'POE Switch (4 Port)';
    if (/\b8\s*PORT|\b8PORT/.test(u)) return 'POE Switch (8 Port)';
    if (/\b16\s*PORT/.test(u)) return 'POE Switch (16 Port)';
    if (/\b24\s*PORT/.test(u)) return 'POE Switch (24 Port)';
    return 'POE Switch';
  }
  if (/\bSWİTCH\b|\bSWITCH\b/.test(u)) return 'POE Switch';
  if (/\bPOE\b/.test(u) && !/NVR|KAMERA/.test(u)) return 'POE Switch';

  // ============ KABLOSUZ HIRSIZ ALARM ============
  if (/KABLOSUZ.*SET|WIRELESS.*ALARM|DHI-ARA.*SET|KB.*ALARM SET/.test(u)) return 'Kablosuz Hırsız Alarm';
  if (/KABLOSUZ.*ALARM|DS-PA.*KABLOSUZ|WIRELESS.*PIR/.test(u)) return 'Kablosuz Hırsız Alarm';
  if (/DHI-ARM|WIRELESS.*RELAY/.test(u)) return 'Kablosuz Alarm Aksesuar';

  // ============ KABLOLU HIRSIZ ALARM ============
  if (/ALARM PANEL|DS-PW|DS-PKA|SMARTLOGIX|DS-PA[0-9]/.test(u)) return 'Alarm Paneli';
  if (/\bPIR\b|\bDEDEKTÖR\b|DS-PDMCK|ARD323|MANYETİK KONTAK/.test(u)) return 'Alarm Dedektörü';
  if (/\bSİREN\b|FLAŞÖR|ARD821|DS-PS1/.test(u)) return 'Alarm Sireni';
  if (/KUMANDA|KEY PAD|DHI-ARA|DS-PKF/.test(u)) return 'Alarm Kumanda';

  // ============ YANGIN SİSTEMİ ============
  if (/ADRESLİ PANEL|DS-DA.*PANEL|CODE.*PANEL|LOOP.*PANEL/.test(u)) return 'Adresli Yangın Paneli';
  if (/ADRESLİ|CODE OM|CODE IM|CODE SA|LOOP FLASH/.test(u)) return 'Adresli Yangın Aksesuar';
  if (/YANGIN PANEL|KONVAN.*PANEL/.test(u)) return 'Konvansiyonel Yangın Paneli';
  if (/GAZ DEDEKTÖR|DUMAN|YANGIN/.test(u)) return 'Yangın & Gaz Algılama';

  // ============ İNTERKOM ============
  if (/VTO\d+|DH-VTO|DHI-VTO|ZİL PANEL|DOOR STATION/.test(u)) return 'İnterkom Zil Paneli';
  if (/VTH\d+|DH-VTH|DHI-VTH|LCD MONİTÖR|INDOOR MONITOR/.test(u)) return 'İnterkom LCD Monitör';
  if (/VTO6531|FACE.*RECOGN|APARTMAN.*DOOR/.test(u)) return 'İnterkom Zil Paneli';
  if (/İNTERKOM|INTERKOM/.test(u)) return 'İnterkom Aksesuar';

  // ============ ACCESS KONTROL ============
  if (/KARTLI GEÇİŞ|ASI\d+|DHI-ASI|DS-K|RFID|YÜZTAN|FACE RECOGN|STANDALONE ACCES|DHI-DAE-HC53/.test(u)) return 'Access Kontrol';
  if (/TURNIKE|BARİYER/.test(u)) return 'Bariyer';
  if (/MANYETİK KİLİT|ELEKTRİKLİ KİLİT/.test(u)) return 'Access Kontrol';

  // ============ ACCESS POINT ============
  if (/ACCESS POINT|EAP\d+|WİRELESS ACCESS|EAP5212|KABLOSUZ AKTARICI/.test(u)) return 'Access Point';

  // ============ MONİTÖR ============
  if (/MONİTÖR|MONITOR|LM\d+|LTV\d+|INC\b|ANDROID TV|LCD.*İNC/.test(u)) return 'Monitörler';

  // ============ UPS & GÜÇ KAYNAĞI ============
  if (/\bUPS\b/.test(u)) return 'UPS Güç Kaynağı';
  if (/\bAKÜ\b|\bBATARYA\b|\bBATTERY\b/.test(u) && !/KAMERA/.test(u)) return 'UPS Güç Kaynağı';
  if (/ADAPTÖR|12V\s*\d+A|SLİM.*ADAPT|AQUA.*12V|VOLT.*AMPER/.test(u)) return 'Adaptörler';

  // ============ HARD DİSK ============
  if (/\bHDD\b|\bSSD\b|\bNAS\b|HARD DISK/.test(u)) return 'Hard Disk';

  // ============ KABLOLAR ============
  if (/UTP|CAT5|CAT6|CAT7|CAT8|PATCH CORD/.test(u)) return 'Cat Kablo';
  if (/FİBER OPTİK|FIBER OPTIC|SM 9\/125|F\/O KABLO|ZIRHLI.*KABLO|PIGTAIL|SC\/UPC|SC\/APC|SFP MODULE|FAST CONNECTOR/.test(u)) return 'Fiber Optik Kablo & Aksesuar';
  if (/\bHDMI\b/.test(u)) return 'CCTV Kablo';
  if (/RG59|COAX|KOAKSİYEL|CCTV.*KABLO/.test(u)) return 'CCTV Kablo';
  if (/YANGIN.*KABLO|KABLO.*YANGIN|2\+1|4\+1|BAKIR KABLO/.test(u)) return 'Yangın Alarm Kablosu';
  if (/PATCH PANEL|ISDN PANEL|SAÇ PANEL|PORT.*PANEL|SONLANDIRMA/.test(u)) return 'Fiber Optik Kablo & Aksesuar';
  if (/\bKABLO\b/.test(u)) return 'CCTV Kablo';

  // ============ RACK KABİN ============
  if (/DUVAR TİPİ|WALL.*RACK|DUVAR.*KABİN/.test(u)) return 'Duvar Tipi Rack Kabin';
  if (/DİKİLİ|FREE.*STAND|FLOOR.*RACK/.test(u)) return 'Dikili Tip Rack Kabin';
  if (/KABİNET|KABINET|\bRACK\b|19INCH|DEMONTE/.test(u)) return 'Duvar Tipi Rack Kabin';

  // ============ SES SİSTEMLERİ ============
  if (/AMPLİFİKATÖR|AMFİ|MIXER|MİKSER/.test(u)) return 'Ses Sistemleri (Amfi & Mixer)';
  if (/HOPARLÖR|SPEAKER/.test(u)) return 'Ses Sistemleri (Hoparlör)';
  if (/MİKROFON|MICROPHONE/.test(u)) return 'Ses Sistemleri';
  if (/SES ÜNİTESİ|DS-PA201|ANONS/.test(u)) return 'Ses Sistemleri';

  // ============ TELSIZ ============
  if (/TELSİZ|WALKIE|EL TELSİZİ|ASELSAN/.test(u)) return 'Diğer Ürünler';

  // ============ MONTAJ ============
  if (/BAĞLANTI APARATI|PFA\d+|APARAT|BRAKET|MONTAJ/.test(u)) return 'Montaj Aparatları';
  if (/BUAT|KANAL KAPAK|DİREK|BORUSAL|KORUYUCU|EK KORUYUCU/.test(u)) return 'Montaj Aparatları';
  if (/\bLENS\b/.test(u)) return 'Montaj Aparatları';
  if (/\bBNC\b|KONNEKTÖR|\bRJ45\b/.test(u)) return 'Fiber Optik Kablo & Aksesuar';
  if (/MODÜL|MODULE/.test(u)) return 'Diğer Ürünler';

  return 'Diğer Ürünler';
}

// Marka çıkar
function extractMarka(ad) {
  const u = ad.toUpperCase();
  if (/HIKVISION|HİKVİSYON/.test(u)) return 'Hikvision';
  if (/DAHUA/.test(u)) return 'Dahua';
  if (/HIWATCH/.test(u)) return 'HiWatch';
  if (/ALFAFONET/.test(u)) return 'Alfafonet';
  if (/ARMAĞAN/.test(u)) return 'Armağan';
  if (/ASELSAN/.test(u)) return 'Aselsan';
  if (/DEMONTE/.test(u)) return 'Demonte';
  if (/AQUA/.test(u)) return 'Aqua';
  if (/COREDATA/.test(u)) return 'Coredata';
  if (/CODE/.test(u)) return 'Code';
  if (/DHI-/.test(u) || /DH-/.test(u)) return 'Dahua';
  if (/DS-[0-9]/.test(u)) return 'Hikvision';
  if (/IPC-/.test(u)) return 'Dahua';
  if (/HAC-/.test(u)) return 'Dahua';
  if (/PFS/.test(u)) return 'Dahua';
  if (/ARGUS/.test(u)) return 'Reolink';
  return '';
}

const rows = parseCSV(csvContent);
console.log(`CSV'den ${rows.length} ürün okundu.`);

const products = rows.map(row => {
  const ad = row['UrunAdi'] || '';
  const stokKodu = row['StokKodu'] || '';
  const barkod = row['Barkod'] || '';
  const alisFiyati = parseFloat(row['AlisFiyati']) || 0;
  const gorsel = row['ResimURL'] || '';
  const urunLinki = row['UrunLinki'] || '';
  const kategori = hedefBayiKategori(ad);
  const marka = extractMarka(ad);
  
  // Model: ürün adından marka çıkarılmış hali
  let model = ad;
  if (marka && ad.toUpperCase().startsWith(marka.toUpperCase())) {
    model = ad.slice(marka.length).trim().replace(/^[-\s]+/, '');
  }

  return {
    id: stokKodu || 'HDF-' + Math.random().toString(36).slice(2,7).toUpperCase(),
    kod: stokKodu,
    barkod: barkod || stokKodu,
    ad: ad,
    model: model,
    anaKategori: kategori,
    altKategori: '',
    marka: marka,
    alisFiyati: alisFiyati,
    satisFiyati: parseFloat((alisFiyati * 1.25).toFixed(2)),
    doviz: 'USD',
    karMarji: 25,
    toptanciStok: 9999,
    bayiStok: 9999,
    gorsel: gorsel,
    aciklama: '',
    urunLinki: urunLinki,
  };
});

// Kategori istatistikleri
const catCounts = {};
products.forEach(p => { catCounts[p.anaKategori] = (catCounts[p.anaKategori] || 0) + 1; });
console.log('\n📊 KATEGORİ DAĞILIMI (Hedefbayi.com):');
Object.entries(catCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
  console.log(`  ${k.padEnd(45)} ${v}`);
});
console.log(`\nToplam: ${products.length} ürün`);
console.log(`Kategorisiz (Diğer): ${catCounts['Diğer Ürünler'] || 0}`);

// Mevcut initialData.json'u yükle, sadece ticari_urunler'i güncelle
const dataPath = path.join(__dirname, '../lib/initialData.json');
const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const newData = { ...existingData, ticari_urunler: products };
fs.writeFileSync(dataPath, JSON.stringify(newData));
console.log('\n✅ initialData.json güncellendi!');
