import { NextResponse } from 'next/server';
import Redis from 'ioredis';

const DB_KEY = 'tnl_muhasebe_cloud_db';

// Use the URL provided by the user's Vercel Redis integration
const redisUrl = process.env.KV_REST_API_REDIS_URL || '';
const redis = redisUrl ? new Redis(redisUrl) : null;

export async function GET() {
  try {
    if (!redis) {
      console.warn('Redis URL is not configured');
      return NextResponse.json({ error: 'Veritabanı yapılandırması eksik (KV_REST_API_REDIS_URL bulunamadı)' }, { status: 500 });
    }
    const data = await redis.get(DB_KEY);
    // data is a JSON string in ioredis, so we need to parse it,
    // but if it's already parsed, we handle it
    const parsedData = data ? JSON.parse(data) : {};
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Redis GET Error:', error);
    return NextResponse.json({ error: 'Veritabanına ulaşılamadı' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Veritabanı yapılandırması eksik' }, { status: 500 });
    }
    const body = await req.json();
    // Save as JSON string
    await redis.set(DB_KEY, JSON.stringify(body));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis POST Error:', error);
    return NextResponse.json({ error: 'Veritabanına yazılamadı' }, { status: 500 });
  }
}
