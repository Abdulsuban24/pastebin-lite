// app/api/pastes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { Paste } from '@/types';
import { nanoid } from 'nanoid';

const MAX_CONTENT_LENGTH = 100_000; // optional safety

export async function POST(req: NextRequest) {
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { content, ttl_seconds, max_views } = data;

  // Validation
  if (typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json({ error: 'content is required and must be a non-empty string' }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: 'content too long' }, { status: 400 });
  }

  if (ttl_seconds !== undefined) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
      return NextResponse.json({ error: 'ttl_seconds must be an integer >= 1' }, { status: 400 });
    }
  }

  if (max_views !== undefined) {
    if (!Number.isInteger(max_views) || max_views < 1) {
      return NextResponse.json({ error: 'max_views must be an integer >= 1' }, { status: 400 });
    }
  }

  const id = nanoid(12);
  const paste: Paste = {
    content,
    ttl_seconds,
    max_views,
    created_at: Date.now(),
    views: 0,
  };

  // Store in Redis
  await redis.set(`paste:${id}`, paste, {
    ex: ttl_seconds, // auto-expire key
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/p/${id}`;

  return NextResponse.json({ id, url }, { status: 201 });
}