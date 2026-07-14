/**
 * Geliştirilmiş kategorizasyon — Diğer Ürünler'i azalt
 * Tüm 782 ürünü yeniden kategorize eder
 */
const fs = require('fs');
const path = require('path');

function hedefBayiKategori(ad) {
  const u = (ad || '').toUpperCase().replace(/İ/g,'I').replace(/Ş/g,'S').replace(/Ç/g,'C')
            .replace(/Ğ/g,'G').replace(/Ü/g,'U').replace(/Ö/g,'O').replace(/\s+/g,' ').trim();

  // ============ İP KAMERALAR ============
  if (/PTZ|SPEED DOME|SD\d+[A-Z]|TPC-DF|PSD\d/.test(u) && !/DVR|NVR|XVR|SWITCH/.test(u)) return 'IP Speed Dome Kamera';
  if (/TIOC|2IN1 KAMERA|TPC-/.test(u)) return 'IP Speed Dome Kamera';

  // IP PT Kamera (Pan-Tilt)
  if (/\bPT KAMERA\b|PT1[0-9]+|HPT[0-9]+|IPC-PT|IPC-HPT|BEBEK KAMERA|PT CAMERA|TANDEMV|DS-2SE4/.test(u)) return 'IP Speed Dome Kamera';
  if (/DH-P3AE-PV|DH-P5AE-PV|DH-P8F-PV/.test(u)) return 'WiFi Kamera';

  // IP Bullet
  if (/IPC-HFW|DH-IPC-HFW/.test(u)) return 'IP Bullet Kamera';
  if (/DS-2CD.*T\d\d[A-Z]|DS-2CD.*HFW/.test(u)) return 'IP Bullet Kamera';
  if (/HFW[0-9]|HFW-[0-9]/.test(u) && !/DVR|XVR/.test(u)) return 'IP Bullet Kamera';
  if (/BULLET.*IP|IP.*BULLET|POE BULLET|REOLINK.*P3|REOLINK.*P[0-9]/.test(u)) return 'IP Bullet Kamera';
  if (/COLORVU|COLORVUE|ACUSENSE|WIZSENSE|SMARTLIGHT/.test(u) && /BULLET|HFW|T[0-9]{2}G/.test(u)) return 'IP Bullet Kamera';
  if (/DS-2CE10DF0T|DS-2CE1[0-9]/.test(u) && /BULLET/.test(u)) return 'IP Bullet Kamera';

  // IP Dome
  if (/IPC-HDW|IPC-HDBW|IPC-EW/.test(u)) return 'IP Dome Kamera';
  if (/DS-2CD.*HDW|DS-2CD.*TRQ|DS-2CD.*EW|DS-2CD.*EY/.test(u)) return 'IP Dome Kamera';
  if (/DOME.*IP|IP.*DOME|POE DOME/.test(u)) return 'IP Dome Kamera';
  if (/HDW[0-9]|HDW-[0-9]|HDW1[0-9]/.test(u) && !/DVR|XVR/.test(u)) return 'IP Dome Kamera';
  if (/DAHUA.*ZS.*DOM|DAHUA.*[0-9]R-ZS/.test(u)) return 'IP Dome Kamera';
  if (/DS-2CD/.test(u) && !/DVR|NVR/.test(u)) return 'IP Dome Kamera';
  if (/LUMUS.*4M|ARGUS|REOLINK.*LUMUS/.test(u)) return 'WiFi Kamera';

  // ============ AHD KAMERALAR ============
  if (/HAC-HFW|DH-HAC-HFW/.test(u)) return 'AHD Bullet Kamera';
  if (/DAHUA.*HFW[0-9].*4MP|DAHUA.*HFW[0-9].*2MP/.test(u)) return 'AHD Bullet Kamera';
  if (/DS-2CE.*HFW|DS-2CE.*HIT/.test(u)) return 'AHD Bullet Kamera';
  if (/AHD.*BULLET|CVI.*BULLET|TVI.*BULLET/.test(u)) return 'AHD Bullet Kamera';
  if (/DAHUA.*SDT4|SDT[0-9]+/.test(u)) return 'AHD Bullet Kamera';

  if (/HAC-HDW|DH-HAC-HDW|DH-HAC-T/.test(u)) return 'AHD Dome Kamera';
  if (/DS-2CE.*HDW|DS-2CE16D|DS-2CE76D/.test(u)) return 'AHD Dome Kamera';
  if (/COLORVU|COLORVUE/.test(u) && /DOM|HDW/.test(u)) return 'AHD Dome Kamera';
  if (/DAHUA.*DOM.*MOT|DOM.*MOTORIZE|HDW1230/.test(u)) return 'AHD Dome Kamera';
  if (/DS-2CE10DF0T|DS-2CE1[0-9]/.test(u)) return 'AHD Dome Kamera';

  // Speed Dome AHD
  if (/SPEED DOME|PTZ/.test(u) && /AHD|CVI|TVI|XVR|HAC/.test(u)) return 'AHD Speed Dome Kamera';

  // ============ ARAÇ KAMERASI ============
  if (/ARAC KAMERA|ARAC GUVENL|MOBIL KAMERA|DAE-HC|INOX-603|DASHCAM|DASH CAM/.test(u)) return 'Araç Kamerası';

  // ============ WIFI KAMERA ============
  if (/WIFI|WIRELES.*KAMERA|KAMERA.*WIFI|WI-FI.*CAM|F4C-PV|T2A-PV|DAHUA.*F[0-9]C/.test(u) && !/4G/.test(u)) return 'WiFi Kamera';
  if (/INOX-X100|ONVIF.*WIFI/.test(u)) return 'WiFi Kamera';

  // ============ 4G & SOLAR KAMERA ============
  if (/4G.*KAMERA|KAMERA.*4G|SOLAR KAMERA|P5AE-PV-4G|4G.*MINI/.test(u)) return '4G & Solar Kamera';

  // ============ NVR ============
  if (/\bNVR\b/.test(u) || /DS-[0-9]+NI|DHI-NVR|NVR[0-9]|DS-7[0-9]+NI|HIKVISION.*NI/.test(u)) {
    if (/4\s*CH|4\s*KANAL|\b4K\b.*NVR|NVR.*\b4\b/.test(u)) return 'NVR Kayıt Cihazı (4 Kanal)';
    if (/8\s*CH|8\s*KANAL|NVR.*\b8\b/.test(u)) return 'NVR Kayıt Cihazı (8 Kanal)';
    if (/16\s*CH|16\s*KANAL|NVR4216|NVR302-16/.test(u)) return 'NVR Kayıt Cihazı (16 Kanal)';
    if (/32\s*CH|32\s*KANAL|NVR4232|DH-NVR4232/.test(u)) return 'NVR Kayıt Cihazı (32 Kanal)';
    if (/64\s*CH|64\s*KANAL/.test(u)) return 'NVR Kayıt Cihazı (64 Kanal)';
    return 'NVR Kayıt Cihazı';
  }

  // ============ DVR/XVR ============
  if (/\bDVR\b|\bXVR\b|PENTA.BRID|5M-N|DS-7[0-9]+HQ|DS-7[0-9]+HU|HCVR|EKRANSIZ.*DVR/.test(u)) {
    if (/4\s*CH|4\s*KANAL|XVR1B04|XVR5104|DH-XVR.*04/.test(u)) return 'AHD XVR Kayıt Cihazı (4 Kanal)';
    if (/8\s*CH|8\s*KANAL|XVR1B08|XVR5108|DH-XVR.*08/.test(u)) return 'AHD XVR Kayıt Cihazı (8 Kanal)';
    if (/16\s*CH|16\s*KANAL|XVR5116|HIKVISION.*7216/.test(u)) return 'AHD XVR Kayıt Cihazı (16 Kanal)';
    if (/32\s*CH|32\s*KANAL|DS-7204.*4K/.test(u)) return 'AHD XVR Kayıt Cihazı (32 Kanal)';
    if (/4\s*KANAL|DS-7204/.test(u)) return 'AHD XVR Kayıt Cihazı (4 Kanal)';
    return 'AHD XVR Kayıt Cihazı';
  }

  // ============ POE SWITCH ============
  // Coredata, Dahua, Ruijie PoE switchler
  if (/PFS4[0-9]+|DH-CS4[0-9]+|DH-PFS4[0-9]+|PS2[0-9]M|PS2[0-9]M|COREDATA PS[0-9]/.test(u)) {
    if (/\b4\s*PORT|\b4PORT|4-PORT/.test(u)) return 'POE Switch (4 Port)';
    if (/\b8\s*PORT|\b8PORT|8-PORT|8GT|8GE/.test(u)) return 'POE Switch (8 Port)';
    if (/\b16\s*PORT|16-PORT|16ET/.test(u)) return 'POE Switch (16 Port)';
    if (/\b18\s*PORT|18-PORT|18ET/.test(u)) return 'POE Switch (16 Port)';
    if (/\b24\s*PORT|24-PORT|24ET|24GT|24POE|PFS4226|PS26M|DH-CS4218/.test(u)) return 'POE Switch (24 Port)';
    return 'POE Switch';
  }
  if (/NBS3200|RG-ES[0-9]+|RG-ES220|RUIJIE.*PORT.*POE|RUIJIE.*SWITCH|CLOUD.*POE.*SWITCH/.test(u)) {
    if (/24\s*PORT|24GT/.test(u)) return 'POE Switch (24 Port)';
    if (/20\s*PORT/.test(u)) return 'POE Switch (24 Port)';
    if (/8\s*PORT|8GE/.test(u)) return 'POE Switch (8 Port)';
    return 'POE Switch';
  }
  if (/PFS3[0-9]+|DH-PFS|DS-3E|COREDATA.*SWITCH|EAP.*SWITCH/.test(u)) {
    if (/\b4\s*PORT|\b4PORT|4-PORT/.test(u)) return 'POE Switch (4 Port)';
    if (/\b8\s*PORT|\b8PORT|8-PORT/.test(u)) return 'POE Switch (8 Port)';
    if (/\b16\s*PORT|16-PORT/.test(u)) return 'POE Switch (16 Port)';
    if (/\b24\s*PORT|24-PORT/.test(u)) return 'POE Switch (24 Port)';
    return 'POE Switch';
  }
  if (/\bSWITCH\b/.test(u) && !/WIRELESS|ACCESS/.test(u)) return 'POE Switch';
  if (/\bPOE\b.*INJECTOR|ENJEKTO/.test(u)) return 'POE Switch';
  if (/TEKLI.*POE|POE KAMERA.*POE/.test(u)) return 'POE Switch';

  // ============ KABLOSUZ ALARM ============
  if (/KABLOSUZ.*ALARM|WIRELESS.*ALARM|DHI-ART-ARC|DHI-ARM|DS-PA.*KABLOSUZ/.test(u)) return 'Kablosuz Hırsız Alarm';
  if (/DS-PK1.*WE|KABLOSUZ.*LED.*TUS|WIRELESS.*KEYPAD/.test(u)) return 'Kablosuz Hırsız Alarm';
  if (/DS-PA201P.*KIT|ALARM KONTROL KIT/.test(u)) return 'Alarm Paneli';
  if (/ALARM KIT|ALARM SET|TSP.*ALARM.*SET|WAP-404/.test(u)) {
    if (/KABLOSUZ|WIRELESS/.test(u)) return 'Kablosuz Hırsız Alarm';
    return 'Kablolu Hırsız Alarm';
  }

  // ============ ALARM DEDEKTÖRÜ ============
  if (/\bPIR\b|HAREKET DEDEKTOR|MOTION DETECT|MANYETIK KONTAK/.test(u)) return 'Alarm Dedektörü';
  if (/ARD323|ARD[0-9]+|DS-PDMCK|DS-PMF|REFLEKTIF BEAM|REFLECTIVE BEAM/.test(u)) return 'Alarm Dedektörü';
  if (/FINDER.*BEAM|TNA.*TX|BEAM DEDECT|GST.*I-9105|I9105R|REFLEKTORLU/.test(u)) return 'Alarm Dedektörü';
  if (/OPTIK DUMAN|TSD-5135|DEDEKTOR TABI|DEDEKTÖR TABI|TFA-[0-9]+|DD-T DEDEKTOR/.test(u)) return 'Alarm Dedektörü';
  if (/YANGIN DEDEKT|DUMAN DEDEKT|ISIL DEDEKT/.test(u)) return 'Yangın & Gaz Algılama';
  if (/DHI-ARA43|TEKRARLAYICI PANEL/.test(u)) return 'Adresli Yangın Aksesuar';

  // ============ ALARM PANELİ ============
  if (/ALARM PANEL|ALARM SANTRAL|DS-PWA|DS-PW[0-9]|SMARTLOGIX|TEKNIM.*WAP/.test(u)) return 'Alarm Paneli';
  if (/GSM.*ALARM.*PANEL|GPRS.*ALARM/.test(u)) return 'Alarm Paneli';

  // ============ YANGIN SİREN ============  
  if (/SR-[0-9]+|KONVANSIYONEL YANGIN SIREN|YANGIN SIREN/.test(u)) return 'Yangın & Gaz Algılama';
  // ============ ALARM SİREN ============
  if (/\bSIREN\b|\bFLASOR\b|ARD821|DS-PS1|ALARM.*SIRENL/.test(u)) return 'Alarm Sireni';

  // ============ ALARM KUMANDA ============
  if (/KUMANDA|KEYPAD|KEY PAD|LED TUSU|DHI-KTA|DS-PKF|GSM.*MODUL|TEKNIM.*TXM/.test(u)) return 'Alarm Kumanda & GSM';
  if (/ADRESLEME MODULU|TEKNIM.*TFCM|MAXLOGIC.*ML|MAM-RED|RELAY MODULU/.test(u)) return 'Yangın Kontrol Modülü';

  // ============ ADRESLİ YANGIN ============
  if (/ADRESLI PANEL|CODE.*PANEL|LOOP.*PANEL|ADR.*YANGIN.*PANEL/.test(u)) return 'Adresli Yangın Paneli';
  if (/ADRESLI|CODE OM|CODE IM|CODE SA|LOOP FLASH/.test(u)) return 'Adresli Yangın Aksesuar';

  // ============ KONVANSİYONEL YANGIN ============
  if (/KONVAN.*PANEL|YANGIN PANEL/.test(u)) return 'Konvansiyonel Yangın Paneli';
  if (/GAZ DEDEKTOR|DUMAN DEDEKTOR|CO DEDEKTOR|ISI DEDEKTOR|HEAT DEDEKTOR/.test(u)) return 'Yangın & Gaz Algılama';
  if (/YANGIN.*BUTON|BREAK GLASS|YANGIN.*IHBAR/.test(u)) return 'Yangın & Gaz Algılama';

  // ============ İNTERKOM ============
  if (/VTO[0-9]|DH-VTO|DHI-VTO|ZIL PANEL|DOOR STATION|VIDEO INTERCOM KIT|DHI-KTA02/.test(u)) return 'İnterkom Zil Paneli';
  if (/DS-KV6113|VİLLA.*BUTON|DS-KV.*BUTON/.test(u)) return 'İnterkom Zil Paneli';
  if (/VTH[0-9]|DH-VTH|DHI-VTH|LCD MONITOR|INDOOR MONITOR/.test(u)) return 'İnterkom LCD Monitör';
  if (/INTERKOM|INTERCOM/.test(u)) return 'İnterkom Aksesuar';

  // ============ ACCESS KONTROL ============
  if (/KARTLI GECIS|ASI[0-9]+|DHI-ASI|DS-K[0-9]|RFID|YUZTAN|FACE RECOGN|STANDALONE ACCESS|FINGERPRINT/.test(u)) return 'Access Kontrol';
  if (/PROXIMITY KART|PROX KART|125KHZ|13.56MHZ/.test(u)) return 'Access Kontrol';
  if (/PARMAK IZI|P.IZI|PROXEN/.test(u)) return 'Access Kontrol';
  if (/MANYETIK KILIT|ELEKTRIKLI KILIT/.test(u)) return 'Access Kontrol';

  // ============ TURNİKE & BARİYER ============
  if (/TURNIKE|BARIYER|LN-SBM|LA08ZBT/.test(u)) return 'Bariyer & Turnikeler';

  // ============ ACCESS POINT / ROUTER ============
  if (/ACCESS POINT|CEILING.*MOUNT|TAVAN.*ERISIM|EAP[0-9]|RG-RAP|RG-EST|RAP2[0-9]+/.test(u)) return 'Access Point';
  if (/CPE[0-9]|PFWB[0-9]|OUTDOOR.*WIRELESS|WIRELESS.*OUTDOOR|PTP.*ACCESS|WI-AP[0-9]|WI-AP/.test(u)) return 'Access Point';
  if (/RUIJIE|REYEE/.test(u) && /ACCESS|\bAP\b|WIRELESS/.test(u)) return 'Access Point';
  if (/KABLOSUZ AKTARICI/.test(u)) return 'Access Point';
  // Router → Access Point kategorisi
  if (/WIRELESS.*ROUTER|WİFİ.*ROUTER|WK-R[0-9]+|APRONX.*WR|WI-FI.*ROUTER/.test(u)) return 'Access Point';
  // Wireless Bridge
  if (/WIRELESS BRIDGE|HIKVISION.*DS-3WF/.test(u)) return 'Access Point';
  if (/GBIC|TRANSCEIVER|MEDIA CONVERTER|MEDIA CONV|SC SM.*10\/100|SC SM.*1000/.test(u)) return 'Fiber Optik Kablo & Aksesuar';
  if (/SFP MODULE|SFP MODUL/.test(u)) return 'Fiber Optik Kablo & Aksesuar';

  // ============ MONİTÖR ============
  if (/MONITOR|LM[0-9]+|EXPOTECH.*EX|EXM-[0-9]+|INC.*MONITOR|\d+".*MONITOR/.test(u)) return 'Monitörler';
  if (/ANDROID TV|DIGITAL SIGNAGE/.test(u)) return 'Monitörler';

  // ============ UPS & GÜÇ KAYNAĞI ============
  if (/\bUPS\b/.test(u)) return 'UPS Güç Kaynağı';
  if (/\bAKU\b|\bBATTERY\b|\bCR123A\b|LİTYUM PİL|LITHIUM PIL|GP CR/.test(u)) return 'UPS Güç Kaynağı';
  if (/ADAPTOR|ADAPT[OÖ]R|12V.*[0-9]A|[0-9]AMPER.*ADAPTOR|DC POWER|ENERJİ JAK/.test(u)) return 'Adaptörler';
  if (/SLIM ADAPTOR|AQUA.*12V|VOLT.*AMPER.*ADAPTOR/.test(u)) return 'Adaptörler';

  // ============ HARD DİSK / SD KART ============
  if (/\bHDD\b|\bSSD\b|HARD DISK|GUVENLIK DISKI|TOSHIBA S300/.test(u)) return 'Hard Disk';
  if (/\bNAS\b/.test(u)) return 'Hard Disk';
  if (/SD KART|MICRO SD|MICRO-SD|SDCARD|[0-9]+GB/.test(u)) return 'Hard Disk';

  // ============ KABLOLAR ============
  if (/\bUTP\b|CAT5E|CAT6|CAT7|CAT8|PATCH CORD|CAT [56]|PATCH COART/.test(u)) return 'Cat Kablo';
  if (/FİBER OPTIK|FIBER OPTIC|SM 9\/125|F\/O KABLO|ZIRHLI.*KABLO|PIGTAIL/.test(u)) return 'Fiber Optik Kablo & Aksesuar';
  if (/SC\/UPC|SC\/APC|LC\/UPC|SC-LC SM|FIBER KASET|FAST CONNECTOR/.test(u)) return 'Fiber Optik Kablo & Aksesuar';
  if (/\bHDMI\b/.test(u)) return 'CCTV Kablo';
  if (/RG59|COAX|KOAKSIYEL|CROS.*KAMERA.*KABLO|CROSS.*KAMERA|KAMERA KABLOSU/.test(u)) return 'CCTV Kablo';
  if (/YANGIN.*KABLO|KABLO.*YANGIN|2\+1 KABLO|4\+1 KABLO|BAKIR KABLO/.test(u)) return 'Yangın Alarm Kablosu';
  if (/PATCH PANEL|ISDN PANEL|SAC PANEL|PORT.*PANEL/.test(u)) return 'Cat Kablo';
  if (/\bKABLO\b/.test(u)) return 'CCTV Kablo';

  // ============ RACK KABİN ============
  if (/DUVAR TIPI|WALL.*RACK|DUVAR.*KABIN|DEMONTE.*KABIN/.test(u)) return 'Duvar Tipi Rack Kabin';
  if (/DIKILI|FREE STAND|FLOOR RACK/.test(u)) return 'Dikili Tip Rack Kabin';
  // Lande montajlı kabinler, proline kabinler, U tipi
  if (/MONTAJLI.*[0-9]+U|PROLINE KABİN|PROLINE KABIN|LANDE MONTAJLI/.test(u)) return 'Dikili Tip Rack Kabin';
  if (/KABINET|\bRACK\b|19.*INCH|19 INC|1U.*19|KABIN.*VIDASI|ORGANIZER.*FIRCA|PRIZ.*SIGORT|SABIT RAF/.test(u)) return 'Rack Kabin Aksesuar';
  if (/SAHA DOLABI|PANO OUTDOOR|POLYESTER PANO|TRK-178|LN-SBM/.test(u)) return 'Duvar Tipi Rack Kabin';
  if (/M6 KAFES SOMUN|KABIN VID|SIMPLEX.*PORT.*SONLANDIR|SONLANDIRMA KUTUSU|FIBER KASET/.test(u)) return 'Fiber Optik Kablo & Aksesuar';
  if (/ARAZITIPI EK KUTUSU|ARAZI.*EK KUTUSU|ARAZİ.*EK|EK KUTUSU|ATEK-[0-9]+/.test(u)) return 'Fiber Optik Kablo & Aksesuar';
  if (/TEKERLEKSETI|TEKERLEK SETI|ON MONTAJLI.*TEKERLEK/.test(u)) return 'Rack Kabin Aksesuar';
  if (/LA08ZBT/.test(u)) return 'Rack Kabin Aksesuar';

  // ============ SES SİSTEMLERİ ============
  if (/AMPLIFIKATOR|AMFI|MIXER|MIKSER|POWER AMP|DS-QAE0A|DX[0-9].*AMP|WM-350U|WM-605U|MIXING AMP/.test(u)) return 'Ses Sistemleri (Amfi & Mixer)';
  if (/HORNS|HORN HOPARLOR|HOPARLOR|SPEAKER|SUTUN HAPORLOR|SUTUN HOPARLOR|WSS-[0-9]+|WS-505|DS-1325TB|DH-8A/.test(u)) return 'Ses Sistemleri (Hoparlör)';
  if (/MIKROFON|MICROPHONE|WM-101T|WM-202H|LAVALIER|HANDHELD MIC|YAKA MIC/.test(u)) return 'Ses Sistemleri';
  if (/SES UNITESI|ANONS|DH-30T DECON|VOLUME CONTROL|VLK-[0-9]+/.test(u)) return 'Ses Sistemleri (Hoparlör)';
  if (/OKUL ZIL|AKILLI.*ZIL|WS-316|ALARM ZIL/.test(u)) return 'Ses Sistemleri';
  if (/XLR.*KONNEKT|CP-3FD|CP-3MD|3.5MM STEREO|STEREO.*ERKEK|DC-240L/.test(u)) return 'Ses Sistemleri';

  // ============ TELSİZ ============
  if (/TELSIZ|WALKIE|EL TELSIZI|KULAKLIK.*A446|SNT.*MIKROFON/.test(u)) return 'Telsiz & Aksesuar';

  // ============ MONTAJ & APARAT ============
  if (/KAMERA KUTUSU|KAMERA KUTU|TRK-10[0-9]|TRK-113|TRK-400|TRK-154|TRK-159/.test(u)) return 'Montaj Aparatları';
  if (/PFA[0-9]+|BRAKET|MONTAJ APARATI|BAGLANTI APARATI/.test(u)) return 'Montaj Aparatları';
  if (/TELESKOPIK UZATMA|TELESKOP|TRK-FP|UZATMA AYAK/.test(u)) return 'Montaj Aparatları';
  if (/BUAT|KANAL KAPAK|DIREC|BORUSAL|EK KORUYUCU|KAPAK.*KORUYUCU/.test(u)) return 'Montaj Aparatları';
  if (/LCD ASKI APARATI|ASKI APARATI|ST-4[0-9]|ST-5[0-9]/.test(u)) return 'Montaj Aparatları';
  if (/CCTV TESTER|KAMERA TEST/.test(u)) return 'Montaj Aparatları';
  if (/\bLENS\b/.test(u)) return 'Montaj Aparatları';
  if (/\bBNC\b|KONEKTOR|KONNEKTOR|RJ45/.test(u)) return 'Fiber Optik Kablo & Aksesuar';
  if (/MG-4000|MG-4100|MAVIGARD|PARALELLERIHBARLAMBASI/.test(u)) return 'Yangın & Gaz Algılama';
  if (/ML-0710|BUTON KORUYUCU|MAXLOGIC.*BUTON/.test(u)) return 'Yangın Kontrol Modülü';
  if (/WESTA WS-402|WESTA.*WS/.test(u)) return 'Ses Sistemleri';
  if (/KAMERA SETI|IP SESLI.*SET|SESLI.*KAMERA.*SET/.test(u)) return 'IP Bullet Kamera';

  return 'Diğer Ürünler';
}

function extractMarka(ad) {
  const u = (ad || '').toUpperCase();
  if (/HIKVISION|HIKVISYON/.test(u)) return 'Hikvision';
  if (/DAHUA/.test(u)) return 'Dahua';
  if (/HIWATCH/.test(u)) return 'HiWatch';
  if (/REOLINK/.test(u)) return 'Reolink';
  if (/ALFAFONET/.test(u)) return 'Alfafonet';
  if (/ASELSAN/.test(u)) return 'Aselsan';
  if (/EXPOTECH/.test(u)) return 'Expotech';
  if (/INOX/.test(u)) return 'Inox';
  if (/TOSHIBA/.test(u)) return 'Toshiba';
  if (/LANDE/.test(u)) return 'Lande';
  if (/RUIJIE|REYEE/.test(u)) return 'Ruijie Reyee';
  if (/PROXEN/.test(u)) return 'Proxen';
  if (/TEKNIM/.test(u)) return 'Teknim';
  if (/COREDATA/.test(u)) return 'Coredata';
  if (/CODE /.test(u)) return 'Code';
  if (/MAXLOGIC/.test(u)) return 'Maxlogic';
  if (/ARMAGAN/.test(u)) return 'Armağan';
  if (/DEMONTE/.test(u)) return 'Demonte';
  if (/AQUA/.test(u)) return 'Aqua';
  if (/TANSA/.test(u)) return 'Tansa';
  if (/DHI-|DH-IPC|DH-NVR|DH-XVR|DH-HAC/.test(u)) return 'Dahua';
  if (/DS-[0-9]/.test(u)) return 'Hikvision';
  if (/IPC-HFW|IPC-HDW|HAC-HFW|HAC-HDW/.test(u)) return 'Dahua';
  if (/PFS[0-9]/.test(u)) return 'Dahua';
  if (/NVR[0-9]+[0-9]/.test(u)) return 'Uniview';
  return '';
}

// initialData.json'u oku
const dataPath = path.join(__dirname, '../lib/initialData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Tüm ürünleri yeniden kategorize et
let improved = 0;
const updated = data.ticari_urunler.map(u => {
  const oldKat = u.anaKategori;
  const newKat = hedefBayiKategori(u.ad);
  const marka = extractMarka(u.ad) || u.marka || '';
  if (oldKat !== newKat || marka !== u.marka) improved++;
  return { ...u, anaKategori: newKat, marka };
});

// Kategori istatistikleri
const catCounts = {};
updated.forEach(u => { catCounts[u.anaKategori] = (catCounts[u.anaKategori] || 0) + 1; });
console.log('\n📊 YENİ KATEGORİ DAĞILIMI:');
Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(`  ${k.padEnd(45)} ${v}`);
});
console.log(`\nToplam: ${updated.length} ürün`);
console.log(`Güncellenen: ${improved} ürün`);
console.log(`Hâlâ "Diğer": ${catCounts['Diğer Ürünler'] || 0}`);

// Kaydet
const newData = { ...data, ticari_urunler: updated };
fs.writeFileSync(dataPath, JSON.stringify(newData));
console.log('✅ initialData.json güncellendi!');
