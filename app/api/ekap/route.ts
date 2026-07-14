import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  const dataPath = path.join(process.cwd(), 'public', 'ekap-data.json');
  const scriptPath = path.join(process.cwd(), 'scripts', 'ekap-bot.js');

  try {
    // We execute the Node.js scraper script as a separate process
    // This runs Puppeteer and updates the public/ekap-data.json file
    await execAsync(`node "${scriptPath}"`);
    
    // Read the freshly scraped data
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    } else {
      return NextResponse.json({ ihaleler: [], error: 'Veri dosyası oluşturulamadı.' }, { status: 500 });
    }
  } catch (error) {
    console.error('API /ekap hatası:', error);
    
    // Fallback: If scraping fails (e.g. timeout, puppeteer crash), return old data if exists
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    
    return NextResponse.json({ error: 'Bot çalıştırılırken bir hata oluştu.' }, { status: 500 });
  }
}
