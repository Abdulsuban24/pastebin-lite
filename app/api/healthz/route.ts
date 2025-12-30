// app/api/healthz/route.ts
import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await redis.ping();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Health check failed:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}