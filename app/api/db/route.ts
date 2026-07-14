import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const DB_KEY = 'tnl_muhasebe_cloud_db';

export async function GET() {
  try {
    const data = await kv.get(DB_KEY);
    return NextResponse.json(data || {});
  } catch (error) {
    console.error('KV GET Error:', error);
    return NextResponse.json({ error: 'Veritabanına ulaşılamadı' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await kv.set(DB_KEY, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KV POST Error:', error);
    return NextResponse.json({ error: 'Veritabanına yazılamadı' }, { status: 500 });
  }
}
