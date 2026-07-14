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
    const [data, locationsData] = await Promise.all([
      redis.get(DB_KEY),
      redis.hgetall('tnl_locations')
    ]);
    
    const parsedData = data ? JSON.parse(data) : {};
    
    // Konum verilerini parse et (Her bir değer JSON string)
    const userLocationsMap: Record<string, any> = {};
    if (locationsData) {
      for (const [userId, locationStr] of Object.entries(locationsData)) {
        try {
          userLocationsMap[userId] = JSON.parse(locationStr);
        } catch {}
      }
    }
    
    return NextResponse.json({
      ...parsedData,
      userLocationsMap
    });
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
    
    // Eğer istekte konum bilgisi varsa, onu HSET ile kaydet
    if (body._userLocation && body._userId) {
      await redis.hset('tnl_locations', body._userId, JSON.stringify(body._userLocation));
      // Konum bilgisini ana veritabanına kaydetmemek için body'den çıkar
      delete body._userLocation;
      delete body._userId;
    }

    // Geri kalan ana veriyi kaydet (Eğer boş değilse)
    if (Object.keys(body).length > 0) {
      await redis.set(DB_KEY, JSON.stringify(body));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redis POST Error:', error);
    return NextResponse.json({ error: 'Veritabanına yazılamadı' }, { status: 500 });
  }
}
