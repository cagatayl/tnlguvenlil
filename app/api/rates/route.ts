// Next.js API Route — Sunucu tarafından döviz kuru çekme (CORS sorunu yok)
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 300; // 5 dakika cache

export async function GET() {
  const apis = [
    'https://open.er-api.com/v6/latest/USD',
    'https://api.exchangerate-api.com/v4/latest/USD',
    'https://api.frankfurter.app/latest?from=USD&to=TRY,EUR,GBP',
  ];

  for (const url of apis) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const data = await res.json();

      // open.er-api / exchangerate-api format
      if (data.rates?.TRY) {
        return NextResponse.json({
          USD: data.rates.TRY,
          EUR: data.rates.TRY / data.rates.EUR,
          GBP: data.rates.TRY / data.rates.GBP,
          source: url,
          timestamp: new Date().toISOString(),
        });
      }

      // frankfurter.app format
      if (data.rates?.TRY) {
        return NextResponse.json({
          USD: data.rates.TRY,
          EUR: data.rates.TRY / (data.rates.EUR ?? 1),
          GBP: data.rates.TRY / (data.rates.GBP ?? 1),
          source: url,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      // Try next API
    }
  }

  // Fallback — realistic values
  return NextResponse.json({
    USD: 38.5,
    EUR: 42.0,
    GBP: 48.5,
    source: 'fallback',
    timestamp: new Date().toISOString(),
  });
}
