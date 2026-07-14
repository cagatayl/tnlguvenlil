const data = require('../lib/initialData.json');
const fs = require('fs');
const path = require('path');
const items = data.ticari_urunler;

function smartCategorize(ad) {
  const u = (ad || '').toUpperCase().replace(/\s+/g, ' ').trim();

  // NVR/DVR
  if (/\bNVR\b/.test(u) || /DS-7[0-9]+NI|DHI-NVR|HC\d+WVR/.test(u)) return 'NVR (IP Kayıt Cihazı)';
  if (/\bDVR\b|\bXVR\b/.test(u) || /DS-7[0-9]+HQ|DHI-HCVR|DHI-XVR/.test(u)) return 'DVR/XVR (Analog Kayıt)';

  // PTZ
  if (/\bPTZ\b|SPEED DOME|DS-2SE|DS-2PT|SD\d+[A-Z].*KAMERA/.test(u) && !/SWITCH/.test(u)) return 'PTZ & Speed Dome Kamera';

  // Hikvision IP Kamera
  if (/DS-2CD/.test(u)) {
    if (/DOME|HDW|TRQ|EW|EY|DF/.test(u)) return 'IP Dome Kamera';
    if (/BULLET|HFW|T26|T46|T47/.test(u)) return 'IP Bullet Kamera';
    if (/FISHEYE|360/.test(u)) return 'IP Fisheye Kamera';
    return 'IP Kamera';
  }

  // Hikvision Analog
  if (/DS-2CE/.test(u)) {
    if (/DOME|HDT|TRQ|EW|DF/.test(u)) return 'Analog Dome Kamera';
    return 'Analog Bullet Kamera';
  }

  // Dahua IP
  if (/IPC-HFW|PC-HFW/.test(u)) return 'IP Bullet Kamera';
  if (/IPC-HDW|IPC-HDBW/.test(u)) return 'IP Dome Kamera';
  if (/IPC-EW|IPC-EBW/.test(u)) return 'IP Fisheye Kamera';
  if (/\bIPC-/.test(u)) return 'IP Kamera';

  // Dahua Analog
  if (/HAC-HFW|DH-HAC-HFW/.test(u)) return 'Analog Bullet Kamera';
  if (/HAC-HDW|DH-HAC-HDW|HAC-T1|DH-HAC-T|B1A21|HAC-B1/.test(u)) return 'Analog Dome Kamera';
  if (/DH-HAC|HAC-/.test(u) && !/SWITCH|NVR|DVR/.test(u)) return 'Analog Kamera';

  // Özel kamera tipleri
  if (/4G.*KAMERA|P[35]AE-PV-4G/.test(u)) return 'Güneş & 4G Kamera';
  if (/ARAÇ KAMERA|MOBİL KAMERA|HC\d+.*ARAÇ/.test(u)) return 'Araç & Mobil Kamera';
  if (/WIFI.*KAMERA|KAMERA.*WIFI|WİFİ.*CAM|DH-F2C|DH-P3AE|DH-P5AE|DH-HPT/.test(u)) return 'WiFi & Bataryalı Kamera';
  if (/SMARTLIGHT|COLORVU|COLORVUE|ACUSENSE|WIZSENSE/.test(u) && !/SWITCH/.test(u)) return 'IP Kamera';

  // Genel kamera yakalama
  if (/\bKAMERA\b|\bCAMERA\b/.test(u)) {
    if (/\bIP\b|NETWORK/.test(u)) return 'IP Kamera';
    if (/DOME/.test(u)) return 'Analog Dome Kamera';
    if (/BULLET/.test(u)) return 'Analog Bullet Kamera';
    if (/WİFİ|WIFI/.test(u)) return 'WiFi & Bataryalı Kamera';
    return 'Genel Kamera';
  }

  // Switch
  if (/PFS3[0-9]+|DH-CS4|DH-PFS|DS-3E/.test(u)) return 'Network Switch & PoE';
  if (/\bSWİTCH\b|\bSWITCH\b/.test(u)) return 'Network Switch & PoE';
  if (/\bPOE\b/.test(u) && !/SWITCH|NVR/.test(u)) return 'PoE Adaptör';

  // Alarm
  if (/ALARM PANEL|DS-PW|DS-PKA|DS-PA\d/.test(u)) return 'Alarm Kontrol Paneli';
  if (/ADRESLİ|DS-PA|CODE [A-Z]/.test(u)) return 'Yangın & Adresli Sistem';
  if (/\bSİREN\b|FLAŞÖR|ARD821|DS-PS1/.test(u)) return 'Alarm Sireni & Uyarı';
  if (/\bPIR\b|\bDEDEKTÖR\b|MANYETİK|DS-PDMCK|ARD323/.test(u)) return 'Alarm Dedektörü';
  if (/KUMANDA|KEY PAD|DHI-ARA|DS-PKF/.test(u)) return 'Alarm Kumanda';
  if (/AMPLİFİKATÖR|SES ÜNİTESİ|HOPARLÖR|DS-PA201/.test(u)) return 'Ses & Anons';

  // Yangın
  if (/YANGIN|GAZ DEDEKTÖR|DUMAN|SA-340|OM301|IM-201/.test(u)) return 'Yangın & Gaz Algılama';

  // Geçiş kontrol
  if (/VTO\d+|VTH\d+|DOOR STATION|DHI-VTO|DHI-VTH/.test(u)) return 'Video Kapı Telefonu';
  if (/KARTLI GEÇİŞ|ASI\d+|DHI-ASI|DS-K|RFID|FACE RECOGN|STANDALONE ACCES|DHI-DAE-HC53/.test(u)) return 'Geçiş Kontrol Sistemi';

  // Monitör
  if (/MONİTÖR|MONITOR|LM\d+|LTV\d+|INC\b|ANDROID TV/.test(u)) return 'Monitör & Ekran';

  // Güç
  if (/ADAPTÖR|12V\s*\d+A|SLİM ADAPT|AQUA.*12V/.test(u)) return 'Güç Adaptörü';
  if (/\bUPS\b|\bAKÜ\b|\bBATARYA\b/.test(u) && !/KAMERA/.test(u)) return 'UPS & Akü';

  // Kablo
  if (/UTP|CAT5|CAT6|CAT7|CAT8|PATCH CORD/.test(u)) return 'UTP & Ethernet Kablo';
  if (/FİBER OPTİK|FIBER OPTIC|SM 9\/125|F\/O KABLO|ZIRHLI.*KABLO|ALFAFONET.*KABLO/.test(u)) return 'Fiber Optik Kablo';
  if (/\bHDMI\b/.test(u)) return 'HDMI & Video Kablo';
  if (/RG59|COAX|KOAKSİYEL/.test(u)) return 'Koaksiyel Kablo';
  if (/2\+1|4\+1|BAKIR KABLO|CCA KABLO/.test(u)) return 'Alarm & Kontrol Kablosu';
  if (/\bKABLO\b/.test(u)) return 'Genel Kablo';

  // Fiber
  if (/PATCH PANEL|ISDN PANEL|SAÇ PANEL|PORT.*PANEL/.test(u)) return 'Patch Panel';
  if (/PIGTAIL|SC\/UPC|SC\/APC|FAST CONNECTOR|SFP MODULE|ALFAFONET.*KONEKTÖR/.test(u)) return 'Fiber Konnektör';
  if (/SONLANDIRMA|FIBER.*KUTU/.test(u)) return 'Fiber Sonlandırma Kutusu';

  // Kabinet
  if (/KABİNET|KABINET|\bRACK\b|19INCH|DEMONTE/.test(u)) return 'Rack Kabinet';

  // WiFi
  if (/ROUTER|MODEM/.test(u)) return 'Router & Modem';
  if (/ACCESS POINT|EAP\d+|WİRELESS ACCESS|EAP5212/.test(u)) return 'WiFi Access Point';

  // Telsiz
  if (/TELSİZ|WALKIE|EL TELSİZİ|ASELSAN/.test(u)) return 'Telsiz & Radyo';

  // Montaj
  if (/BAĞLANTI APARATI|PFA\d+|APARAT/.test(u)) return 'Montaj Aparatı';
  if (/BUAT|KABİN AKSESU|KORUYUCU/.test(u)) return 'Tesisat & Kanal';

  if (/\bLENS\b/.test(u)) return 'Kamera Lensi';
  if (/\bBNC\b|KONNEKTÖR|\bRJ45\b/.test(u)) return 'Bağlantı Konnektörleri';
  if (/\bHDD\b|\bSSD\b|\bNAS\b/.test(u)) return 'Depolama';
  if (/RELAY|DHI-ARM/.test(u)) return 'Alarm Aksesuar';
  if (/MODÜL|MODULE/.test(u)) return 'Sistem Modülü';

  return 'Diğer Ekipman';
}

const updated = items.map(u => ({ ...u, anaKategori: smartCategorize(u.ad) }));

const catCounts = {};
updated.forEach(u => { catCounts[u.anaKategori] = (catCounts[u.anaKategori]||0)+1; });
console.log('KATEGORİ DAĞILIMI:');
Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(k.padEnd(45), v));
console.log('\nDiğer:', catCounts['Diğer Ekipman'] || 0, '/', items.length);

const newData = { ...data, ticari_urunler: updated };
fs.writeFileSync(path.join(__dirname, '../lib/initialData.json'), JSON.stringify(newData));
console.log('\n✅ Güncellendi!');
