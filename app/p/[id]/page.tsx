import { redis } from '@/lib/redis';
import { getCurrentTimeMs } from '@/utils/time';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export default async function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) notFound();

  const key = `paste:${id}`;
  const paste = await redis.get<any>(key);
  if (!paste) notFound();

  const headersList = headers();
  const nowHeader = process.env.TEST_MODE === '1' ? headersList.get('x-test-now-ms') : null;
  const now = nowHeader ? parseInt(nowHeader, 10) : Date.now();

  // Check expiry
  if (paste.ttl_seconds !== undefined) {
    const expiresAt = paste.created_at + paste.ttl_seconds * 1000;
    if (now >= expiresAt) {
      await redis.del(key);
      notFound();
    }
  }

  // Check views
  if (paste.max_views !== undefined && paste.views >= paste.max_views) {
    await redis.del(key);
    notFound();
  }

  // Increment view
  paste.views += 1;
  await redis.set(key, paste, { ex: paste.ttl_seconds });

  const safeContent = paste.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  return (
    <div className="container">
      <div className="card">
        <h1 className="center">Paste</h1>
        <div
          className="paste-content"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
        <a href="/" className="back-link">← Create Another Paste</a>
      </div>
    </div>
  );
}