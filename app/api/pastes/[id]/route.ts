// app/api/pastes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { Paste } from '@/types';
import { getCurrentTimeMs } from '@/utils/time';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing paste ID' }, { status: 400 });
  }

  const key = `paste:${id}`;
  const paste = await redis.get<Paste>(key);

  if (!paste) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const now = getCurrentTimeMs(req);

  // Check TTL
  if (paste.ttl_seconds !== undefined) {
    const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
    if (now >= expiresAt) {
      await redis.del(key);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  // Check view limit
  if (paste.max_views !== undefined && paste.views >= paste.max_views) {
    await redis.del(key);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Increment view
  paste.views += 1;
  await redis.set(key, paste, {
    ex: paste.ttl_seconds,
  });

  const expiresAt = paste.ttl_seconds
    ? new Date(paste.created_at + paste.ttl_seconds * 1000).toISOString()
    : null;

  const remainingViews = paste.max_views ? paste.max_views - paste.views : null;

  return NextResponse.json({
    content: paste.content,
    remaining_views: remainingViews,
    expires_at: expiresAt,
  });
}