// Eklenti sayfaya yüklendiğinde ufak bir TNL butonu ekleyelim
function addTnlButton() {
  if (document.getElementById('tnl-sync-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'tnl-sync-btn';
  btn.innerHTML = '🔄 İhaleleri TNL\'ye Aktar';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.zIndex = '999999';
  btn.style.padding = '12px 20px';
  btn.style.background = '#3b82f6';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '8px';
  btn.style.fontWeight = 'bold';
  btn.style.fontSize = '16px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

  btn.onclick = async () => {
    btn.innerHTML = '⌛ Aktarılıyor...';
    btn.style.background = '#f59e0b';
    
    try {
      // EKAP v2'deki tablo satırlarını (p-table) okuyup JSON oluşturalım
      const ihaleler = [];
      const rows = document.querySelectorAll('.p-datatable-tbody > tr');
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 3) {
          const ikn = cells[0].innerText.trim(); // İhale Kayıt No genellikle ilk sütun
          const title = cells[1].innerText.trim() || cells[2].innerText.trim();
          
          let il = 'TÜRKİYE';
          const cities = ['MALATYA', 'ELAZIĞ', 'DİYARBAKIR', 'ŞANLIURFA', 'GAZİANTEP', 'MARDİN', 'ADIYAMAN', 'BATMAN', 'BİNGÖL', 'TUNCELİ'];
          for (let c of cities) {
            if (row.innerText.toUpperCase().includes(c)) { il = c; break; }
          }
          
          if (ikn && title && ikn.includes('/')) {
            ihaleler.push({
              baslik: title,
              kurum: 'Kamu Kurumu (EKAP)',
              il: il,
              tarih: new Date().toLocaleDateString('tr-TR'),
              sonTarih: 'Belirtilmedi',
              link: 'https://ekapv2.kik.gov.tr/ekap/search?tnl_open_ikn=' + encodeURIComponent(ikn)
            });
          }
        }
      });

      // Arka plan scripti üzerinden CORS'a takılmadan gönderelim
      chrome.runtime.sendMessage(
        { action: 'syncToLocalhost', payload: { ihaleler: ihaleler, url: window.location.href } },
        (response) => {
          if (response && response.success) {
            btn.innerHTML = '✅ Başarıyla Aktarıldı!';
            btn.style.background = '#10b981';
            
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('tnl_auto') === '1') {
              setTimeout(() => { window.close(); }, 1500);
            }
          } else {
            console.error(response);
            btn.innerHTML = '❌ Hata Oluştu!';
            btn.style.background = '#ef4444';
            alert('Aktarım hatası: Sunucunuzun (localhost:3000) açık olduğundan emin olun.\n' + (response ? response.error : ''));
          }
        }
      );
    } catch (error) {
      console.error(error);
      btn.innerHTML = '❌ Hata Oluştu!';
      btn.style.background = '#ef4444';
    }
    
    setTimeout(() => {
      btn.innerHTML = '🔄 İhaleleri TNL\'ye Aktar';
      btn.style.background = '#3b82f6';
    }, 4000);
  };

  document.body.appendChild(btn);
}

// OTO-PİLOT MAKROSU
async function autoPilotSearch() {
  console.log("TNL Auto-Pilot başladı!");
  await new Promise(r => setTimeout(r, 4000));
  
  // Arama kutusuna yaz
  const searchInput = document.querySelector('input[placeholder*="Ara"], input[type="text"]');
  if (searchInput) {
    searchInput.value = 'kamera güvenlik';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  await new Promise(r => setTimeout(r, 1000));

  // Ara butonuna bas
  const searchBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ara') || b.innerText.includes('Sorgula'));
  if (searchBtn) searchBtn.click();

  await new Promise(r => setTimeout(r, 4000));

  // Sonuçları aktar
  const tnlBtn = document.getElementById('tnl-sync-btn');
  if (tnlBtn) tnlBtn.click();
}

// İlana Git MAKROSU (Modal Açıcı)
async function openIhaleModal(ikn) {
  console.log("TNL Modal Açıcı: " + ikn);
  await new Promise(r => setTimeout(r, 3000));
  
  // Arama kutusuna IKN yaz
  const searchInput = document.querySelector('input[placeholder*="Ara"], input[type="text"]');
  if (searchInput) {
    searchInput.value = ikn;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    const searchBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ara') || b.innerText.includes('Sorgula'));
    if (searchBtn) searchBtn.click();
    
    await new Promise(r => setTimeout(r, 3000));
    
    // İlk satıra tıkla (Modalı açar)
    const firstRow = document.querySelector('.p-datatable-tbody > tr');
    if (firstRow) {
      firstRow.click();
    }
  }
}

setTimeout(() => {
  addTnlButton();
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tnl_auto') === '1') {
    autoPilotSearch();
  } else if (urlParams.get('tnl_open_ikn')) {
    openIhaleModal(urlParams.get('tnl_open_ikn'));
  }
}, 2000);

const observer = new MutationObserver(() => {
  if (!document.getElementById('tnl-sync-btn')) addTnlButton();
});
observer.observe(document.body, { childList: true, subtree: true });
