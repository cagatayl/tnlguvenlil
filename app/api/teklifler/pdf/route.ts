import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Vercel timeout'a düşmesini engellemek için maksimum süre (saniye)

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Construct the offerData expected by offer.js based on the payload (which contains { teklif, cari, referenceCategories })
    const { teklif, cari, referenceCategories } = payload;
    
    if (!teklif) {
      return NextResponse.json({ error: 'Teklif data is required' }, { status: 400 });
    }

    const offerData = {
      locale: "tr-TR",
      currency: teklif.doviz || "USD",
      defaultVatRate: 20,
      exchangeRate: 1, // Optional placeholder, can be updated later if needed
      company: {
        name: "TNL Güvenlik Sistemleri",
        phone: "0850-850-23-44",
        email: "info@tnlguvenlik.com",
        address: "Çöşnük Mahallesi Eşref Bitlis Caddesi No:31/7 Battalgazi / Malatya"
      },
      customer: {
        id: cari?.kod || cari?.id || teklif.cariId,
        name: cari?.unvan || teklif.cariUnvan || "Müşteri",
        taxNumber: "",
        address: cari?.adres || ""
      },
      offer: {
        number: teklif.id,
        date: teklif.tarih || new Date().toLocaleDateString('tr-TR'),
        validity: "7 Gün",
        subject: "Fiyat Teklifi",
        authorizedPerson: "Çağatay Lüleci",
        scope: "Güvenlik sistemleri ürün ve hizmetleri fiyat teklifidir.",
        notes: [
          "Teslim süresi stok durumuna göre netleştirilir.",
          "Garanti ve teknik servis koşulları ürün bazında belirtilir.",
          "Bu sayfa teklif özetidir; ürün detayları sonraki sayfalardadır."
        ],
        productNotes: [
          "Fiyatlar teklif geçerlilik süresi boyunca geçerlidir."
        ]
      },
      referenceCategories: referenceCategories || [],
      products: (teklif.kalemler || []).map((k: any, index: number) => ({
        id: index + 1,
        stockCode: k.barkod || k.urunId || `URUN-${index + 1}`,
        brand: k.marka || "",
        name: k.ad || "Ürün",
        model: k.model || "",
        category: k.anaKategori || "",
        description: "",
        image: k.gorsel || "",
        quantity: k.adet || 1,
        unit: "Adet",
        vatRate: 20,
        unitPriceVatIncluded: k.birimFiyat || 0
      }))
    };

    // Determine the base URL from the incoming request
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const templateUrl = `${protocol}://${host}/pdf-template/index.html`;

    console.log("Generating PDF from", templateUrl);

    let browser;
    if (process.env.VERCEL) {
      // Vercel Environment
      const chromium = (await import('@sparticuz/chromium')).default;
      const puppeteerCore = await import('puppeteer-core');
      
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // Local Development or VDS Environment
      const puppeteer = (await import('puppeteer')).default;
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    
    // Wait for networkidle0 so all CSS/images are loaded
    await page.goto(templateUrl, { waitUntil: 'networkidle0' });
    
    // Inject the data and render
    await page.evaluate((data) => {
      // @ts-ignore
      if (window.renderOffer) {
        // @ts-ignore
        window.renderOffer(data);
      }
    }, offerData);

    await page.emulateMediaType('print');
    // NOTE: generate-pdf.mjs returned Uint8Array buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    // Return the PDF buffer
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Teklif_${teklif.id}.pdf"`
      }
    });

  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Error generating PDF' }, { status: 500 });
  }
}
