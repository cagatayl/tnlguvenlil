(() => {
  const root = document.getElementById('offer-root');
  const PRODUCTS_PER_PAGE = 3;
  const REFERENCES_PER_PAGE = 20;

  const esc = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const money = (value, currency = 'TRY', locale = 'tr-TR') => {
    const amount = Number(value || 0);
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${currency}`;
    }
  };

  const chunk = (items, size) => {
    const output = [];
    for (let i = 0; i < items.length; i += size) output.push(items.slice(i, i + size));
    return output;
  };

  const getVatRate = (product, data) => Number(product.vatRate ?? data.defaultVatRate ?? 20);

  // Muhasebe uygulamasındaki satış fiyatı KDV DAHİL gelir.
  // Geriye dönük uyumluluk için eski unitPrice alanı da okunabilir,
  // ancak yeni entegrasyonda unitPriceVatIncluded kullanılmalıdır.
  const getGrossUnitPrice = product => Number(
    product.unitPriceVatIncluded ?? product.unitPrice ?? 0
  );

  const calculateLine = (product, data) => {
    const quantity = Number(product.quantity || 0);
    const grossUnitPrice = getGrossUnitPrice(product);
    const vatRate = getVatRate(product, data);
    const grossTotal = quantity * grossUnitPrice;
    const netTotal = vatRate > 0 ? grossTotal / (1 + vatRate / 100) : grossTotal;
    const includedVat = grossTotal - netTotal;

    return { quantity, grossUnitPrice, vatRate, netTotal, includedVat, grossTotal };
  };

  const calculateOffer = data => data.products.reduce((totals, product) => {
    const line = calculateLine(product, data);
    totals.netSubtotal += line.netTotal;
    totals.includedVat += line.includedVat;
    totals.grandTotal += line.grossTotal;
    return totals;
  }, { netSubtotal: 0, includedVat: 0, grandTotal: 0 });

  const logoMarkup = () => `
    <div class="brand">
      <div class="brand-mark"><span class="brand-corner"></span></div>
      <div class="brand-copy"><strong>TNL<br>GÜVENLİK</strong><span>SİSTEMLERİ</span></div>
    </div>`;

  const header = (title, subtitle) => `
    <header class="header">
      ${logoMarkup()}
      <div class="title"><h1>${esc(title)}</h1><p>${esc(subtitle || '')}</p></div>
    </header>`;

  const footer = (company, pageNumber) => `
    <footer class="footer">${esc(company.phone)} &nbsp;&nbsp; | &nbsp;&nbsp; ${esc(company.email)} &nbsp;&nbsp; | &nbsp;&nbsp; ${esc(company.address)}</footer>
    <div class="page-number">${pageNumber}</div>`;

  const infoCard = (label, value, emphasis = false) => `
    <div class="info-card ${emphasis ? 'emphasis' : ''}">
      <div class="info-label">${esc(label)}</div>
      <div class="info-value">${esc(value)}</div>
    </div>`;

  const productCard = (product, data) => {
    const line = calculateLine(product, data);
    const image = product.image
      ? `<img src="${esc(product.image)}" alt="${esc(product.name)}">`
      : '<div class="product-image-placeholder">Ürün<br>Görseli</div>';

    return `
      <article class="product-card">
        <div class="product-image-wrap">${image}</div>
        <div>
          <div class="product-name">${esc(product.name)}</div>
          <div class="product-model">${esc(product.brand || '')} ${esc(product.model || product.stockCode || '')}</div>
          <div class="product-description">${esc(product.description || '')}</div>
        </div>
        <div class="price-box">
          <div class="price-row"><span>Adet</span><span>${esc(product.quantity)}</span></div>
          <div class="price-row"><span>Birim Fiyat<br><small>KDV Dahil</small></span><span>${money(line.grossUnitPrice, data.currency, data.locale)}</span></div>
          <div class="price-row total"><span>Toplam<br><small>KDV Dahil</small></span><span>${money(line.grossTotal, data.currency, data.locale)}</span></div>
        </div>
      </article>`;
  };

  const renderCover = (data, pageNumber) => `
    <section class="page">
      ${header('FİYAT TEKLİFİ', 'KDV dahil satış fiyatlarıyla dinamik teklif')}
      <div class="info-grid">
        ${infoCard('Müşteri', data.customer.name)}
        ${infoCard('Teklif No', data.offer.number, true)}
        ${infoCard('Tarih', data.offer.date)}
        ${infoCard('Konu', data.offer.subject)}
        ${infoCard('Geçerlilik', data.offer.validity)}
        ${infoCard('Yetkili', data.offer.authorizedPerson)}
      </div>
      <div class="split-cards">
        <div class="panel"><h2>Teklif Kapsamı</h2><p>${esc(data.offer.scope)}</p></div>
        <div class="panel dark"><h2>Fiyatlandırma Kuralı</h2><ul>
          <li>Ürün fiyatları KDV dahildir.</li>
          <li>KDV toplamın üstüne tekrar eklenmez.</li>
          <li>Dahil KDV tutarı bilgi amaçlı ayrıştırılır.</li>
        </ul></div>
      </div>
      <div class="steps"><h2>Uygulama Akışı</h2>
        ${[
          'Muhasebe uygulamasında cihazın KDV dahil satış fiyatı girilir.',
          'Bu fiyat unitPriceVatIncluded alanına aynen aktarılır.',
          'Sistem net tutarı ve dahil KDV iç tutarını otomatik ayrıştırır.',
          'Ödenecek genel toplam, ürünlerin KDV dahil fiyatlarının toplamıdır.'
        ].map((s, i) => `<div class="step"><div class="step-number">${i + 1}</div><div class="step-text">${esc(s)}</div></div>`).join('')}
      </div>
      <div class="panel notes"><h2>Notlar</h2><ul>${(data.offer.notes || []).map(note => `<li>${esc(note)}</li>`).join('')}</ul></div>
      ${footer(data.company, pageNumber)}
    </section>`;

  const renderProductPages = (data, pageStart) => {
    const groups = chunk(data.products, PRODUCTS_PER_PAGE);
    const totals = calculateOffer(data);

    return groups.map((products, pageIndex) => {
      const isLast = pageIndex === groups.length - 1;
      return `
        <section class="page product-page">
          ${header('ÜRÜNLER', `KDV dahil fiyatlar • Sayfa ${pageIndex + 1}/${groups.length}`)}
          <div class="product-list">${products.map(p => productCard(p, data)).join('')}</div>
          ${isLast ? `
            <div class="product-bottom">
              <div class="panel"><h2>Teklif Notu</h2><ul>${(data.offer.productNotes || []).map(note => `<li>${esc(note)}</li>`).join('')}</ul></div>
              <div class="totals">
                <div class="total-row"><span>KDV Hariç Tutar</span><span>${money(totals.netSubtotal, data.currency, data.locale)}</span></div>
                <div class="total-row"><span>Dahil KDV</span><span>${money(totals.includedVat, data.currency, data.locale)}</span></div>
                <div class="total-row grand"><span>Genel Toplam<br><small>KDV Dahil</small></span><span>${money(totals.grandTotal, data.currency, data.locale)}</span></div>
                ${data.exchangeRate && data.currency !== 'TRY' ? `<div class="total-row"><span>TL Karşılığı<br><small>KDV Dahil</small></span><span>${money(totals.grandTotal * data.exchangeRate, 'TRY', data.locale)}</span></div>` : ''}
              </div>
            </div>` : ''}
          ${footer(data.company, pageStart + pageIndex)}
        </section>`;
    }).join('');
  };

  const flattenReferences = categories => (categories || []).flatMap(category =>
    category.items.map(item => ({ ...item, categoryName: category.name }))
  );

  const renderReferencePages = (data, pageStart) => {
    const all = flattenReferences(data.referenceCategories);
    const pages = chunk(all, REFERENCES_PER_PAGE);

    return pages.map((items, pageIndex) => {
      const grouped = items.reduce((acc, item) => {
        (acc[item.categoryName] ||= []).push(item);
        return acc;
      }, {});

      const isFirstRefPage = pageIndex === 0;
      const hasPartners = data.solutionPartners && data.solutionPartners.length > 0;
      const solutionPartnersHTML = (isFirstRefPage && hasPartners) ? `
        <div class="panel partners-panel">
          <h2>Çözüm Ortaklarımız</h2>
          <div class="partners-grid">
            ${data.solutionPartners.map(p => `<div class="partner-item">${esc(p)}</div>`).join('')}
          </div>
        </div>
      ` : '';

      return `
        <section class="page">
          ${header(hasPartners && isFirstRefPage ? 'ORTAKLAR & REFERANSLAR' : 'REFERANSLAR', hasPartners && isFirstRefPage ? 'Çözüm ortaklarımız ve referanslarımız' : `Kategori bazlı referanslar ${pageIndex + 1}/${pages.length}`)}
          ${solutionPartnersHTML}
          ${isFirstRefPage ? `<div class="reference-intro panel"><h2>Referanslarımız</h2><p>Referanslar sektörlerine göre ayrılmıştır. Her logo kendi oranı korunarak gösterilir.</p></div>` : ''}
          ${Object.entries(grouped).map(([categoryName, categoryItems]) => `
            <section class="reference-category">
              <h2>${esc(categoryName)}</h2><div class="category-line"></div>
              <div class="reference-grid">
                ${categoryItems.map(item => `<div class="reference-logo" title="${esc(item.name)}">${item.logo ? `<img src="${esc(item.logo)}" alt="${esc(item.name)}">` : `<span>${esc(item.name)}</span>`}</div>`).join('')}
              </div>
            </section>`).join('')}
          ${footer(data.company, pageStart + pageIndex)}
        </section>`;
    }).join('');
  };

  window.renderOffer = data => {
    if (!data || !Array.isArray(data.products)) throw new Error('Teklif verisi veya products listesi eksik.');
    if (data.pricesIncludeVat !== true) throw new Error('pricesIncludeVat true olmalıdır. Bu şablon KDV dahil fiyatlarla çalışır.');

    const productPageCount = Math.max(1, Math.ceil(data.products.length / PRODUCTS_PER_PAGE));
    const referenceCount = flattenReferences(data.referenceCategories).length;

    let html = renderCover(data, 1);
    html += renderProductPages(data, 2);
    if (referenceCount) html += renderReferencePages(data, 2 + productPageCount);

    root.innerHTML = html;
    document.title = `${data.offer.number} - ${data.customer.name}`;
  };
})();
