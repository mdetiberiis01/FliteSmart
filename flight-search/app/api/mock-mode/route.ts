import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isMockMode } from '@/lib/search/orchestrator';

const MOCK_FLAG = path.join(process.cwd(), '.mock-mode');

export async function GET() {
  return NextResponse.json({ mockMode: isMockMode() });
}

export async function POST(req: Request) {
  const { enabled } = await req.json();
  if (enabled) {
    fs.writeFileSync(MOCK_FLAG, '');
  } else {
    if (fs.existsSync(MOCK_FLAG)) fs.unlinkSync(MOCK_FLAG);
  }
  return NextResponse.json({ mockMode: isMockMode() });
}
